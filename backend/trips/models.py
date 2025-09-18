from django.db import models
from django.conf import settings
from destinations.models import Destination

class Trip(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)  # Trip name like "Summer Europe Trip"
    destinations = models.ManyToManyField(Destination, related_name="trips")  # Changed to ManyToMany
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.CharField(max_length=20, blank=True, null=True)
    style = models.CharField(max_length=20, blank=True, null=True)
    days = models.PositiveIntegerField(default=3)
    itinerary = models.JSONField(blank=True, null=True)
    weather_snapshot = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.user.username}'s {self.name}"