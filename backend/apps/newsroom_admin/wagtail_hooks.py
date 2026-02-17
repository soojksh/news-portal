from __future__ import annotations

from django.templatetags.static import static
from django.utils.html import format_html
from wagtail import hooks


@hooks.register("insert_global_admin_css")
def add_admin_theme_css():
    """
    Loads our CSS on every Wagtail admin page.
    """
    return format_html(
        '<link rel="stylesheet" href="{}">',
        static("newsroom_admin/admin-theme.css"),
    )


@hooks.register("insert_global_admin_js")
def add_admin_brand_js():
    """
    Loads our JS on every Wagtail admin page.
    Useful for branding tweaks like changing the logo.
    """
    return format_html(
        '<script src="{}" defer></script>',
        static("newsroom_admin/admin-logo.js"),
    )
