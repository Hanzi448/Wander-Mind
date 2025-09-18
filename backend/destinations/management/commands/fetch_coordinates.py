from destinations.models import Destination
from core.services.weather import geocode_city
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Fetch latitude/longitude for all destinations without coordinates"

    def handle(self, *args, **options):
        updated = 0
        for dest in Destination.objects.filter(latitude__isnull=True, longitude__isnull=True):
            try:
                loc = geocode_city(dest.name, dest.country)
                dest.latitude = loc["lat"]
                dest.longitude = loc["lon"]
                dest.save(update_fields=["latitude", "longitude"])
                self.stdout.write(self.style.SUCCESS(f"Updated {dest.name}, {dest.country}"))
                updated += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed for {dest.name}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Done! {updated} destinations updated."))
