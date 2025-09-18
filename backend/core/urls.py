from django.contrib import admin
from django.urls import path, include
from core.views import CurrencyConvertView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/trips/", include("trips.urls")),
    path("api/destinations/", include("destinations.urls")),
    path("currency/convert/", CurrencyConvertView.as_view(), name="currency_convert"),
]
