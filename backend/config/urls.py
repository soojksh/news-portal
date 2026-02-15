from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.api.v2.router import WagtailAPIRouter

# Wagtail API router (headless)
api_router = WagtailAPIRouter("wagtailapi")
api_router.register_endpoint("pages", PagesAPIViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),

    # DRF docs 
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),

    # Wagtail admin
    path("cms/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),

    # Wagtail headless API
    path("api/wagtail/", api_router.urls),

    # Custom DRF endpoints: /api/v1/...
    path("api/v1/", include("apps.api.urls")),

    # Wagtail page serving (optional; keep if you want Django to render pages too)
    path("", include(wagtail_urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
