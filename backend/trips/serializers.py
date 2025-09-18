from rest_framework import serializers
from .models import Trip
from destinations.serializers import DestinationSerializer

class TripSerializer(serializers.ModelSerializer):
    destinations = DestinationSerializer(many=True, read_only=True)  # For GET requests
    destination_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )  # For POST/PUT requests

    budget = serializers.ChoiceField(choices=["low", "medium", "luxury"], required=False)
    style = serializers.ChoiceField(choices=["solo", "family", "adventure", "cultural", "romantic"], required=False)
    days = serializers.IntegerField(required=False, min_value=1, max_value=30)

    class Meta:
        model = Trip
        fields = [
            "id",
            "user",
            "name",
            "destinations",      # Read-only (full destination objects)
            "destination_ids",   # Write-only (list of IDs)
            "start_date",
            "end_date",
            "budget",
            "itinerary",
            "style",
            "days",
            "created_at",
            "weather_snapshot",
        ]
        read_only_fields = ["id", "user", "itinerary", "created_at", "destinations", "weather_snapshot"]

    def create(self, validated_data):
        destination_ids = validated_data.pop('destination_ids', [])
        trip = Trip.objects.create(**validated_data)
        if destination_ids:
            trip.destinations.set(destination_ids)
        return trip

    def update(self, instance, validated_data):
        destination_ids = validated_data.pop('destination_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if destination_ids is not None:
            instance.destinations.set(destination_ids)
        return instance