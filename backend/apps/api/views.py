from __future__ import annotations

from typing import Any, Dict, List

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.pagination import CursorPagination

from wagtail.images.models import Image as WagtailImage

from apps.content.models import HomePage, SectionPage, ArticlePage


def _hero_url(article: ArticlePage) -> str:
    a = article.specific
    return a.hero_image.file.url if getattr(a, "hero_image", None) else ""


def article_to_card(article: ArticlePage) -> dict:
    a = article.specific
    return {
        "title": a.title,
        "slug": a.slug,
        "subtitle": getattr(a, "subtitle", "") or "",
        "excerpt": getattr(a, "excerpt", "") or "",
        "first_published_at": a.first_published_at,
        "section": getattr(a, "section_slug", "") or "",
        "hero_image_url": _hero_url(a),
    }


def resolve_streamfield_images(stream_data: Any) -> Any:
    """
    Convert StreamField blocks so React can render them easily.
    Specifically transforms:
      {"type": "image", "value": <image_id>}
    into:
      {"type": "image", "value": {"url": "...", "alt": "..."}}
    """
    if not isinstance(stream_data, list):
        return stream_data

    resolved: List[Dict[str, Any]] = []
    for block in stream_data:
        if not isinstance(block, dict) or "type" not in block:
            resolved.append(block)
            continue

        btype = block.get("type")
        val = block.get("value")

        if btype == "image":
            # Wagtail StreamField ImageChooserBlock usually stores an ID in `value`
            image_id = None
            if isinstance(val, int):
                image_id = val
            elif isinstance(val, dict) and "id" in val:
                image_id = val.get("id")

            if image_id:
                img = WagtailImage.objects.filter(id=image_id).first()
                if img:
                    resolved.append({
                        "type": "image",
                        "value": {
                            "url": img.file.url,
                            "alt": img.title or "",
                        }
                    })
                    continue

            # fallback if missing
            resolved.append({"type": "image", "value": {"url": "", "alt": ""}})
            continue

        # All other blocks pass through unchanged
        resolved.append(block)

    return resolved


class HomeAPIView(APIView):
    """
    /api/v1/home/
    Returns in one request:
      - featured (curated in HomePage)
      - latest (auto)
    """
    def get(self, request):
        homepage = HomePage.objects.live().public().first()
        if not homepage:
            return Response({"detail": "HomePage not configured in CMS."}, status=404)

        featured = []
        for item in homepage.featured_items.all():
            if item.article and item.article.live:
                featured.append({
                    **article_to_card(item.article),
                    "label": item.label or ""
                })

        latest_qs = ArticlePage.objects.live().public().order_by("-first_published_at")[:12]
        latest = [article_to_card(a) for a in latest_qs]

        return Response({"featured": featured, "latest": latest})


class SectionFeedPagination(CursorPagination):
    page_size = 20
    ordering = "-first_published_at"


class SectionFeedAPIView(ListAPIView):
    """
    /api/v1/sections/<slug>/
    Cursor paginated section feed
    """
    pagination_class = SectionFeedPagination

    def get_queryset(self):
        section_slug = self.kwargs["slug"]
        section = SectionPage.objects.live().public().filter(slug=section_slug).first()
        if not section:
            return ArticlePage.objects.none()

        return (
            ArticlePage.objects.live()
            .public()
            .descendant_of(section)
            .order_by("-first_published_at")
        )

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        page = self.paginate_queryset(qs)
        data = [article_to_card(a) for a in page]
        return self.get_paginated_response(data)


class ArticleDetailAPIView(APIView):
    """
    /api/v1/articles/<slug>/
    Detail endpoint with StreamField blocks resolved for React
    """
    def get(self, request, slug):
        article = ArticlePage.objects.live().public().filter(slug=slug).first()
        if not article:
            return Response({"detail": "Article not found."}, status=404)

        a = article.specific
        tags = [t.name for t in a.tags.all()]
        hero_url = _hero_url(a)

        body = resolve_streamfield_images(a.body.get_prep_value())

        return Response({
            "title": a.title,
            "slug": a.slug,
            "subtitle": a.subtitle or "",
            "excerpt": a.excerpt or "",
            "first_published_at": a.first_published_at,
            "last_published_at": a.last_published_at,
            "section": a.section_slug,
            "tags": tags,
            "hero_image_url": hero_url,
            "body": body,
        })
