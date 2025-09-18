# core/services/weather.py
import requests
from datetime import datetime, timezone, date
from typing import Optional, Dict, Any, List
from django.conf import settings

GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct"
ONECALL_URL = "https://api.openweathermap.org/data/3.0/onecall"
FORECAST_5DAY_URL = "https://api.openweathermap.org/data/2.5/forecast"
ICON_BASE = "https://openweathermap.org/img/wn/"

class WeatherError(Exception):
    pass

def _require_key():
    if not settings.OPENWEATHER_API_KEY:
        raise WeatherError("Missing OPENWEATHER_API_KEY.")
    
def geocode_city(city: str, country: Optional[str] = None) -> Dict[str, float]:
    """
    Returns {'lat': float, 'lon': float} for a given city/country using OpenWeather Geocoding API.
    Tries multiple query formats with fallbacks and auto-cleans names (e.g., 'Valley', 'District', etc.).
    """
    _require_key()

    # Common suffixes to strip if no match is found
    CLEAN_SUFFIXES = [
        " Valley",
        " District",
        " City",
        " Province",    
        " Region",
        " Division",
        " State",
        " Area",
        " Zone"
    ]

    queries = []

    # Raw queries
    if country:
        queries.append(f"{city},{country}")       # full country name
        queries.append(f"{city},{country[:2]}")  # ISO-2 fallback
    queries.append(city)

    # Cleaned queries (strip suffixes)
    for suffix in CLEAN_SUFFIXES:
        if city.endswith(suffix):
            cleaned = city.replace(suffix, "").strip()
            if country:
                queries.append(f"{cleaned},{country}")
                queries.append(f"{cleaned},{country[:2]}")
            queries.append(cleaned)

    # Try all queries in order
    for q in queries:
        params = {"q": q, "limit": 1, "appid": settings.OPENWEATHER_API_KEY}
        r = requests.get(GEOCODE_URL, params=params, timeout=10)
        r.raise_for_status()
        results = r.json()
        if results:
            return {"lat": results[0]["lat"], "lon": results[0]["lon"]}

    raise WeatherError(f"Location not found: {city}, {country}")


def _onecall_daily(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Daily forecast (up to 7–8 days)."""
    _require_key()
    params = {
        "lat": lat,
        "lon": lon,
        "exclude": "minutely,hourly,alerts",
        "units": "metric",
        "appid": settings.OPENWEATHER_API_KEY,
    }
    r = requests.get(ONECALL_URL, params=params, timeout=10)
    if r.status_code == 200:
        return r.json()
    return None

def _forecast_5day(lat: float, lon: float) -> Dict[str, Any]:
    """Fallback: 5-day/3-hour forecast."""
    _require_key()
    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "appid": settings.OPENWEATHER_API_KEY,
    }
    r = requests.get(FORECAST_5DAY_URL, params=params, timeout=10)
    r.raise_for_status()
    return r.json()

def _icon_url(icon_code: str) -> str:
    return f"{ICON_BASE}{icon_code}@2x.png"

def get_weather(lat: float, lon: float) -> Dict[str, Any]:
    """
    Simple wrapper to fetch *current weather snapshot* for Trip creation.
    """
    _require_key()
    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "appid": settings.OPENWEATHER_API_KEY,
    }
    url = "https://api.openweathermap.org/data/2.5/weather"
    r = requests.get(url, params=params, timeout=10)
    r.raise_for_status()
    data = r.json()
    w = data["weather"][0] if data.get("weather") else {}
    return {
        "temp": round(data["main"].get("temp", 0), 1),
        "feels_like": round(data["main"].get("feels_like", 0), 1),
        "condition": w.get("main"),
        "description": w.get("description"),
        "icon": _icon_url(w.get("icon", "")),
    }

def get_trip_forecast(city: str, country: Optional[str], start: date, end: date,
                      lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
    """
    Returns daily forecast clipped to [start, end].
    Falls back to 5-day/3-hour forecast if needed.
    """
    _require_key()
    if lat is None or lon is None:
        loc = geocode_city(city, country)
        lat, lon = loc["lat"], loc["lon"]

    data = _onecall_daily(lat, lon)
    if data and "daily" in data:
        daily: List[Dict[str, Any]] = []
        for d in data["daily"]:
            dt = date.fromtimestamp(d["dt"])
            if start <= dt <= end:
                w = d["weather"][0] if d.get("weather") else {}
                daily.append({
                    "date": str(dt),
                    "temp_min": round(d["temp"]["min"], 1),
                    "temp_max": round(d["temp"]["max"], 1),
                    "condition": w.get("main"),
                    "description": w.get("description"),
                    "icon": _icon_url(w.get("icon", "")),
                })
        curr = data.get("current")
        current = None
        if curr:
            w = curr["weather"][0] if curr.get("weather") else {}
            current = {
                "temp": round(curr.get("temp", 0), 1),
                "feels_like": round(curr.get("feels_like", 0), 1),
                "condition": w.get("main"),
                "description": w.get("description"),
                "icon": _icon_url(w.get("icon", "")),
            }
        return {"lat": lat, "lon": lon, "current": current, "daily": daily}

    # Fallback: aggregate 5-day forecast
    f = _forecast_5day(lat, lon)
    by_date: Dict[date, Dict[str, Any]] = {}
    for item in f.get("list", []):
        dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc).date()
        if start <= dt <= end:
            slot = by_date.setdefault(dt, {"temps": [], "conditions": [], "icons": []})
            slot["temps"].append(item["main"]["temp"])
            w = item["weather"][0] if item.get("weather") else {}
            if w.get("description"):
                slot["conditions"].append(w["description"])
            if w.get("icon"):
                slot["icons"].append(_icon_url(w["icon"]))

    daily = []
    for dt in sorted(by_date.keys()):
        slot = by_date[dt]
        temps = slot["temps"]
        temp_avg = round(sum(temps) / len(temps), 1) if temps else None
        daily.append({
            "date": str(dt),
            "temp_avg": temp_avg,
            "notes": slot["conditions"][0] if slot["conditions"] else None,
            "icon": slot["icons"][0] if slot["icons"] else None,
        })

    return {"lat": lat, "lon": lon, "daily": daily}
