from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from authentication.models import User, Profile


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Custom admin interface for User model."""

    model = User
    list_display = [
        "email",
        "is_staff",
        "is_active",
    ]
    list_filter = ("is_staff", "is_active")
    search_fields = ("name", "email")
    ordering = ("email",)
    readonly_fields = ("date_joined",)


admin.site.register(Profile)
