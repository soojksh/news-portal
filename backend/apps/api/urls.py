from django.urls import path
from .views import HomeAPIView, SectionFeedAPIView, ArticleDetailAPIView

urlpatterns = [
    path("home/", HomeAPIView.as_view(), name="home"),
    path("sections/<slug:slug>/", SectionFeedAPIView.as_view(), name="section-feed"),
    path("articles/<slug:slug>/", ArticleDetailAPIView.as_view(), name="article-detail"),
]
