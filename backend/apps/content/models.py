from django.db import models
from django.utils.text import slugify

from wagtail.models import Page, Orderable
from wagtail.fields import RichTextField, StreamField
from wagtail.admin.panels import FieldPanel, MultiFieldPanel, InlinePanel
from wagtail.images.blocks import ImageChooserBlock
from wagtail.blocks import CharBlock, RichTextBlock, StructBlock
from wagtail.search import index

from modelcluster.fields import ParentalKey
from modelcluster.contrib.taggit import ClusterTaggableManager
from taggit.models import TaggedItemBase


# Tags for ArticlePage
class ArticlePageTag(TaggedItemBase):
    content_object = ParentalKey(
        "content.ArticlePage",
        related_name="tagged_items",
        on_delete=models.CASCADE
    )


# HomePage curated blocks
class HomePageFeaturedItem(Orderable):
    page = ParentalKey("content.HomePage", related_name="featured_items", on_delete=models.CASCADE)
    article = models.ForeignKey("content.ArticlePage", null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    label = models.CharField(max_length=60, blank=True)

    panels = [
        FieldPanel("article"),
        FieldPanel("label"),
    ]


class HomePage(Page):
    # You can keep it simple at first:
    intro = RichTextField(blank=True)

    content_panels = Page.content_panels + [
        FieldPanel("intro"),
        MultiFieldPanel([
            InlinePanel("featured_items", label="Featured articles"),
        ], heading="Homepage Curation"),
    ]

    # Tree rules
    subpage_types = ["content.SectionPage"]  # Home -> Sections only
    parent_page_types = ["wagtailcore.Page"]  # allow under root

    # Optional: API exposure
    api_fields = [
        # We'll expose fields later once API is set
    ]


class SectionPage(Page):
    # Represents a section (Politics, Sports...)
    description = RichTextField(blank=True)

    content_panels = Page.content_panels + [
        FieldPanel("description"),
    ]

    # Tree rules
    parent_page_types = ["content.HomePage"]
    subpage_types = ["content.ArticlePage"]

    api_fields = []


# Article blocks
class PullQuoteBlock(StructBlock):
    quote = CharBlock(required=True)
    attribution = CharBlock(required=False)

    class Meta:
        icon = "openquote"
        label = "Pull Quote"


ARTICLE_BODY_BLOCKS = [
    ("heading", CharBlock(form_classname="title", icon="title")),
    ("paragraph", RichTextBlock(icon="doc-full")),
    ("image", ImageChooserBlock(icon="image")),
    ("pullquote", PullQuoteBlock()),
]


class ArticlePage(Page):
    # Core article fields
    subtitle = models.CharField(max_length=250, blank=True)
    excerpt = models.TextField(blank=True)

    # Wagtail image system is best practice:
    hero_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+"
    )

    body = StreamField(ARTICLE_BODY_BLOCKS, use_json_field=True, blank=True)

    tags = ClusterTaggableManager(through=ArticlePageTag, blank=True)

    # Search indexing
    search_fields = Page.search_fields + [
        index.SearchField("subtitle"),
        index.SearchField("excerpt"),
        index.SearchField("body"),
    ]

    content_panels = Page.content_panels + [
        MultiFieldPanel([
            FieldPanel("subtitle"),
            FieldPanel("excerpt"),
            FieldPanel("hero_image"),
            FieldPanel("tags"),
        ], heading="Article metadata"),
        FieldPanel("body"),
    ]

    parent_page_types = ["content.SectionPage"]
    subpage_types = []

    # Convenience for feeds
    @property
    def section_slug(self):
        parent = self.get_parent().specific
        return getattr(parent, "slug", "")

    # Later we expose API fields
    api_fields = []
