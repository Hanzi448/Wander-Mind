from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from datetime import date
from google import genai
from google.genai.types import Content, Part
import json
import logging
from core.services.weather import get_trip_forecast, WeatherError

logger = logging.getLogger(__name__)

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

        # Get all destinations for this trip
        destinations = trip.destinations.all()
        
        # Get weather for the first destination (or you could get all)
        if destinations.exists():
            first_dest = destinations.first()
            if first_dest.latitude and first_dest.longitude:
                try:
                    weather = get_weather(first_dest.latitude, first_dest.longitude)
                    trip.weather_snapshot = weather
                    trip.save(update_fields=["weather_snapshot"])
                except Exception as e:
                    logger.warning(f"Weather fetch failed during trip creation: {e}")

    @action(detail=True, methods=["post"])
    def generate_itinerary(self, request, pk=None):
        trip = self.get_object()

        if trip.itinerary and not request.data.get("regenerate", False):
            return Response(
                {"itinerary": trip.itinerary, "cached": True},
                status=status.HTTP_200_OK
            )

        destinations = trip.destinations.all()
        destination_names = ", ".join([d.name for d in destinations])

        prompt = f"""
        You are a professional travel planner AI.
        Create a detailed {trip.days}-day itinerary for visiting {destination_names}.
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
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            # New SDK format: Content → Part.text()
            response = client.models.generate_content(
                model="models/gemini-2.5-pro",
                contents=[
                    Content(
                        role="user",
                        parts=[Part(text=prompt)]
                    )
                ]
            )

            text_response = response.text

            # Clean markdown JSON block usually returned by Gemini
            cleaned_text = text_response.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()

            try:
                itinerary_json = json.loads(cleaned_text)
            except Exception as e:
                logger.error(f"Failed to parse Gemini output: {e}\nRaw output: {text_response}")
                itinerary_json = {"raw_text": text_response}

            trip.itinerary = itinerary_json
            trip.save()

            return Response(
                {"itinerary": trip.itinerary, "cached": False},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.exception("AI generation failed or connection timeout")
            return Response({"error": "AI service temporarily unavailable. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Weather API integration
    @action(detail=True, methods=["get"])
    def weather(self, request, pk=None):
        """
        Returns current + daily forecast for this trip's destination,
        clipped to the trip date range.
        """
        trip = self.get_object()
        
        # Get first destination (or you could combine weather for all)
        destinations = trip.destinations.all()
        if not destinations.exists():
            return Response(
                {"error": "No destinations found for this trip"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        dest = destinations.first()

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