from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from datetime import date
import google.generativeai as genai
import json
from core.services.weather import get_trip_forecast, WeatherError

from .models import Trip
from .serializers import TripSerializer
from core.services.weather import get_weather


class IsOwner(permissions.BasePermission):
    """
    Only owners of a trip can view or modify it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        # Ensure logged-in user is linked to trip
        trip = serializer.save(user=self.request.user)

        dest = trip.destination
        if dest.latitude and dest.longitude:
            try:
                weather = get_weather(dest.latitude, dest.longitude)
                trip.weather_snapshot = weather
                trip.save(update_fields=["weather_snapshot"])
            except Exception:
                pass

    @action(detail=True, methods=["post"])
    def generate_itinerary(self, request, pk=None):
        """
        Generate AI-powered itinerary for an existing trip.
        If itinerary already exists, return cached version.
        """
        trip = self.get_object()

        # Prevent regenerating unless explicitly requested
        if trip.itinerary and not request.data.get("regenerate", False):
            return Response(
                {"itinerary": trip.itinerary, "cached": True},
                status=status.HTTP_200_OK
            )

        # Configure Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        prompt = f"""
        You are a professional travel planner AI.
        Create a detailed {trip.days}-day itinerary for {trip.destination.name}.
        Dates: {trip.start_date} → {trip.end_date}.
        Budget: {trip.budget or 'medium'}.
        Style: {trip.style or 'general'}.

        Return output in JSON format like this:
        {{
            "Day 1": ["Morning: ...", "Afternoon: ...", "Evening: ..."],
            "Day 2": ["..."]
        }}
        """

        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            text_response = response.text

            # Try to parse AI response as JSON
            try:
                itinerary_json = json.loads(text_response)
            except Exception:
                itinerary_json = {"raw_text": text_response}

            # Save itinerary
            trip.itinerary = itinerary_json
            trip.save()

            return Response(
                {"itinerary": trip.itinerary, "cached": False},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    #Weather API integration
    @action(detail=True, methods=["get"])
    def weather(self, request, pk=None):
        """
        Returns current + daily forecast for this trip's destination,
        clipped to the trip date range.
        """
        trip = self.get_object()
        dest = trip.destination

        try:
            data = get_trip_forecast(
                city=dest.name,
                country=dest.country,
                start=trip.start_date,
                end=trip.end_date
            )
            return Response(data, status=status.HTTP_200_OK)
        except WeatherError as we:
            return Response({"error": str(we)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Weather service error"}, status=status.HTTP_502_BAD_GATEWAY)
