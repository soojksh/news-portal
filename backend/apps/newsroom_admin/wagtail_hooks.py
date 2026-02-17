from __future__ import annotations

from django.templatetags.static import static
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse

from wagtail import hooks

try:
    from wagtail.admin.ui.components import Component
except Exception:
    Component = None  

from wagtail.models import Page, Revision
from wagtail.images import get_image_model
from wagtail.documents import get_document_model


@hooks.register("insert_global_admin_css")
def add_admin_theme_css():
    
    return format_html(
        '<link rel="stylesheet" href="{}">',
        static("newsroom_admin/admin-theme.css"),
    )


@hooks.register("insert_global_admin_js")
def add_admin_brand_js():
    
    return format_html(
        '<script defer src="{}"></script>',
        static("newsroom_admin/brand/admin-logo.js"),
    )


def _safe_reverse(name: str, fallback: str) -> str:
    try:
        return reverse(name)
    except Exception:
        return fallback


def _get_dashboard_context():
    
    Image = get_image_model()
    Document = get_document_model()

    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # KPIs (fast queries, avoid expensive joins)
    published_today = Page.objects.live().filter(last_published_at__gte=today_start).count()
    total_live = Page.objects.live().count()
    total_drafts = Page.objects.filter(live=False).count()

    scheduled = (
        Page.objects.filter(go_live_at__isnull=False, go_live_at__gt=now)
        .order_by("go_live_at")
        .only("id", "title", "go_live_at", "slug")
    )[:6]

    recent_drafts = (
        Page.objects.filter(live=False)
        .order_by("-latest_revision_created_at")
        .only("id", "title", "latest_revision_created_at", "slug")
    )[:7]

    # Workflow / Moderation (optional)
    workflow_items = []
    workflow_enabled = False
    try:
        # Wagtail workflows: WorkflowState exists when workflows app is in use
        from wagtail.models import WorkflowState  # type: ignore

        workflow_enabled = True
        workflow_items = (
            WorkflowState.objects.select_related("page")
            .filter(status=WorkflowState.STATUS_IN_PROGRESS)
            .order_by("-updated_at")
        )[:7]
    except Exception:
        workflow_enabled = False
        workflow_items = []

    # Media counters
    image_count = Image.objects.count()
    doc_count = Document.objects.count()

    # Quick actions: keep URLs stable even if route names differ
    actions = [
        {
            "label": "New page / article",
            "desc": "Create a new story quickly",
            "href": _safe_reverse("wagtailadmin_explore_root", "/cms/pages/"),
            "icon": "plus",
        },
        {
            "label": "Upload images",
            "desc": "Add photos for your stories",
            "href": _safe_reverse("wagtailimages:index", "/cms/images/"),
            "icon": "image",
        },
        {
            "label": "Upload documents",
            "desc": "Attach PDFs & resources",
            "href": _safe_reverse("wagtaildocs:index", "/cms/documents/"),
            "icon": "file",
        },
        {
            "label": "Media library",
            "desc": "Browse all assets",
            "href": _safe_reverse("wagtailimages:index", "/cms/images/"),
            "icon": "grid",
        },
    ]

    return {
        "kpi": {
            "published_today": published_today,
            "total_live": total_live,
            "total_drafts": total_drafts,
            "image_count": image_count,
            "doc_count": doc_count,
        },
        "actions": actions,
        "scheduled": scheduled,
        "recent_drafts": recent_drafts,
        "workflow_enabled": workflow_enabled,
        "workflow_items": workflow_items,
    }


class NewsroomDashboardPanel(Component):
    
    order = 0
    template_name = "newsroom_admin/admin/newsroom_dashboard_panel.html"

    def get_context_data(self, parent_context):
        ctx = super().get_context_data(parent_context)
        ctx.update(_get_dashboard_context())
        return ctx


@hooks.register("construct_homepage_panels")
def add_newsroom_dashboard_panels(request, panels):
    # Only add if Component API is present (Wagtail 5+)
    if not Component:
        return

    panels.insert(0, NewsroomDashboardPanel())
