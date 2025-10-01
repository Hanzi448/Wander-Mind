from django.contrib import admin
from .models import Trip


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "start_date", "end_date", "budget", "style", "days", "created_at")
    list_filter = ("style", "start_date", "end_date")
    search_fields = ("name", "user__username", "user__email")
    readonly_fields = ("created_at",)
    ordering = ("-start_date",)

    filter_horizontal = ("destinations",)  # Better UI for ManyToMany
