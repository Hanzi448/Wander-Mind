from rest_framework import serializers
from .models import Destination
from .models import Favorite

class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = [
            "id",
            "name",
            "country",
            "description",
            "image_url",   # ✅ Added for frontend display
            "latitude",
            "longitude",
            "created_at",
            "updated_at",  # ✅ Added for last modified info
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class FavoriteSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    destination = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "user", "destination", "created_at"]
        read_only_fields = ["id", "user", "destination", "created_at"]