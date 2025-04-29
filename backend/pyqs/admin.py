from django.contrib import admin
from .models import PYQ, PYQRating


@admin.register(PYQ)
class PYQAdmin(admin.ModelAdmin):
    list_display = (
        "course",
        "year",
        "semester",
        "university",
        "program",
        "branch",
        "uploader",
        "uploaded_at",
    )
    list_filter = ("university", "program", "branch", "semester", "year", "uploaded_at")
    search_fields = (
        "course__name",
        "university__name",
        "program__name",
        "branch__name",
        "uploader__username",
    )
    date_hierarchy = "uploaded_at"
    autocomplete_fields = ("course", "university", "program", "branch", "uploader")


@admin.register(PYQRating)
class PYQRatingAdmin(admin.ModelAdmin):
    list_display = ("user", "pyq", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("user__username", "pyq__course__name", "pyq__university__name")
    autocomplete_fields = ("user", "pyq")
