from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.pagination import CursorPagination

from apps.content.models import HomePage, SectionPage, ArticlePage


def article_to_card(article: ArticlePage) -> dict:
    a = article.specific
    hero_url = a.hero_image.file.url if a.hero_image else ""
    return {
        "title": a.title,
        "slug": a.slug,
        "subtitle": a.subtitle or "",
        "excerpt": a.excerpt or "",
        "first_published_at": a.first_published_at,
        "section": a.section_slug,
        "hero_image_url": hero_url,
    }


class HomeAPIView(APIView):
    def get(self, request):
        homepage = HomePage.objects.live().public().first()
        if not homepage:
            return Response({"detail": "HomePage not configured in CMS."}, status=404)

        featured = []
        for item in homepage.featured_items.all():
            if item.article and item.article.live:
                featured.append({**article_to_card(item.article), "label": item.label or ""})

        latest_qs = ArticlePage.objects.live().public().order_by("-first_published_at")[:12]
        latest = [article_to_card(a) for a in latest_qs]

        return Response({"featured": featured, "latest": latest})


class SectionFeedPagination(CursorPagination):
    page_size = 20
    ordering = "-first_published_at"


class SectionFeedAPIView(ListAPIView):
    pagination_class = SectionFeedPagination

    def get_queryset(self):
        section_slug = self.kwargs["slug"]
        section = SectionPage.objects.live().public().filter(slug=section_slug).first()
        if not section:
            return ArticlePage.objects.none()

        return ArticlePage.objects.live().public().descendant_of(section).order_by("-first_published_at")

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        page = self.paginate_queryset(qs)
        data = [article_to_card(a) for a in page]
        return self.get_paginated_response(data)


class ArticleDetailAPIView(APIView):
    def get(self, request, slug):
        article = ArticlePage.objects.live().public().filter(slug=slug).first()
        if not article:
            return Response({"detail": "Article not found."}, status=404)

        a = article.specific
        hero_url = a.hero_image.file.url if a.hero_image else ""
        tags = [t.name for t in a.tags.all()]

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
            "body": a.body,  # StreamField JSON
        })
