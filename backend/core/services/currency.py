import requests
from typing import Dict, Any

BASE_URL = "https://open.er-api.com/v6/latest/"

class CurrencyError(Exception):
    pass


def convert_currency(amount: float, from_currency: str, to_currency: str) -> Dict[str, Any]:
    """
    Convert currency using ExchangeRate API (free).
    Example: convert_currency(100, "USD", "PKR")
    """
    try:
        url = f"{BASE_URL}{from_currency.upper()}"
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()

        if data.get("result") != "success":
            raise CurrencyError(data.get("error-type", "API Error"))

        rates = data.get("rates", {})
        if to_currency.upper() not in rates:
            raise CurrencyError(f"Unsupported currency: {to_currency}")

        converted = round(amount * rates[to_currency.upper()], 2)
        return {
            "from": from_currency.upper(),
            "to": to_currency.upper(),
            "amount": amount,
            "converted": converted,
            "rate": rates[to_currency.upper()],
        }
    except Exception as e:
        raise CurrencyError(str(e))
