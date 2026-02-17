from __future__ import annotations

from django.templatetags.static import static
from django.utils.html import format_html
from django.template.loader import get_template
from django.template import TemplateDoesNotExist

from wagtail import hooks

# Wagtail 5/6: dashboard panels via Component API.
try:
    from wagtail.admin.ui.components import Component
except Exception:
    Component = None  # If not available, we skip the dashboard panel safely.


@hooks.register("insert_global_admin_css")
def add_admin_theme_css():
    """
    Inject our newsroom theme CSS into ALL Wagtail admin pages.

    This is the safest way to theme the admin UI:
    - no template overrides needed
    - works across Wagtail upgrades
    """
    return format_html(
        '<link rel="stylesheet" href="{}">',
        static("newsroom_admin/admin-theme.css"),
    )


# ---- Dashboard panel (Wagtail 5/6 Component API) ----

if Component is not None:

    class NewsroomQuickLinksPanel(Component):
        """
        Dashboard panel: "Newsroom shortcuts" box shown on the admin home page.

        Scientific note: newsroom workflows prioritize reducing time-to-publish.
        This panel puts frequent actions (new article, drafts, media library)
        within one click.
        """
        order = 10
        template_name = "newsroom_admin/admin/quicklinks_panel.html"

    @hooks.register("construct_homepage_panels")
    def add_quicklinks_panel(request, panels):
        """
        Insert our custom panel only if the template exists.

        This prevents TemplateDoesNotExist from breaking /cms/ even in dev,
        while still enabling the panel immediately when the template is added.
        """
        try:
            get_template("newsroom_admin/admin/quicklinks_panel.html")
        except TemplateDoesNotExist:
            return  # Do not crash Wagtail admin homepage.

        panels.insert(0, NewsroomQuickLinksPanel())


@hooks.register("construct_main_menu")
def reorder_main_menu(request, menu_items):
    """
    Professional newsroom menu order:
      1) Explorer/Pages (core publishing workflow)
      2) Images
      3) Documents
      4) Snippets
      5) Reports
      6) Settings
    """
    def key(item):
        priority = {
            "explorer": 0,
            "pages": 0,
            "images": 1,
            "documents": 2,
            "snippets": 3,
            "reports": 4,
            "settings": 5,
        }
        return priority.get(getattr(item, "name", ""), 99)

    menu_items.sort(key=key)
