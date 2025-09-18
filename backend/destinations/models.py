from django.db import models
from django.conf import settings

class Destination(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True, null=True)  # Optional
    latitude = models.FloatField(blank=True, null=True)   # NEW
    longitude = models.FloatField(blank=True, null=True)  # NEW
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name}, {self.country}"


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name="favorites")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "destination")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} favorited {self.destination.name}"