from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("email", "username", "is_staff", "is_active", "is_superuser", "is_agent", "date_joined")
    list_filter = ("is_staff", "is_active", "is_superuser", "is_agent", "is_google_user")
    search_fields = ("email", "username", "google_id")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        ("Permissions", {
            "fields": ("is_staff", "is_active", "is_superuser", "is_agent", "groups", "user_permissions"),
        }),
        ("Social Login", {"fields": ("is_google_user", "google_id")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "password1", "password2", "is_staff", "is_active", "is_superuser", "is_agent"),
        }),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "created_at", "updated_at")
    search_fields = ("user__username", "user__email", "phone")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)
