from django.contrib import admin
from .models import Destination, Favorite


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "country", "latitude", "longitude", "created_at", "updated_at")
    list_filter = ("country",)
    search_fields = ("name", "country", "description")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("name",)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "destination", "created_at")
    search_fields = ("user__username", "user__email", "destination__name")
    list_filter = ("created_at",)
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
