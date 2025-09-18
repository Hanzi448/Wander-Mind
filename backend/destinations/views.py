from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date, timedelta
from core.services.weather import get_trip_forecast, WeatherError
from .models import Destination, Favorite
from .serializers import DestinationSerializer, FavoriteSerializer
from core.services.weather import geocode_city


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

class DestinationViewSet(viewsets.ModelViewSet):
    queryset = Destination.objects.all().order_by("name")
    serializer_class = DestinationSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "country", "description"]
    ordering_fields = ["name", "country"]
    ordering = ["name"]

    def perform_create(self, serializer):
        instance = serializer.save()
        if not instance.latitude or not instance.longitude:
            try:
                loc = geocode_city(instance.name, instance.country)
                instance.latitude = loc["lat"]
                instance.longitude = loc["lon"]
                instance.save(update_fields=["latitude", "longitude"])
            except Exception:
                # fail silently if geocode fails
                pass

    @action(detail=True, methods=["get"])
    def weather(self, request, pk=None):
        dest = self.get_object()
        days = max(1, min(int(request.query_params.get("days", 5)), 8))  # cap at 8
        start = date.today()
        end = start + timedelta(days=days - 1)

        if not (dest.latitude and dest.longitude):
            return Response(
                {"error": "Destination has no coordinates yet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data = get_trip_forecast(
                city=dest.name,
                country=dest.country,
                start=start,
                end=end,
                lat=dest.latitude,   # pass stored lat/lon
                lon=dest.longitude
            )
            return Response(data)
        except WeatherError as we:
            return Response({"error": str(we)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"error": "Weather service error"}, status=status.HTTP_502_BAD_GATEWAY)
        
    # ⭐ Favorite / Unfavorite
    @action(detail=True, methods=["post", "delete"], permission_classes=[permissions.IsAuthenticated])
    def favorite(self, request, pk=None):
        dest = self.get_object()
        if request.method == "POST":
            fav, created = Favorite.objects.get_or_create(user=request.user, destination=dest)
            if not created:
                fav.delete()
                return Response({"status": "removed from favorites"})
            return Response({"status": "added to favorites"})
        else:
            try:
                fav = Favorite.objects.get(user=request.user, destination=dest)
                fav.delete()
                return Response({"status": "removed from favorites"})
            except Favorite.DoesNotExist:
                return Response({"error": "not in favorites"}, status=status.HTTP_400_BAD_REQUEST)

    # ⭐ List user's favorites
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_favorites(self, request):
        favs = Favorite.objects.filter(user=request.user)
        return Response(FavoriteSerializer(favs, many=True).data)