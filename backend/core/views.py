from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from core.services.currency import convert_currency, CurrencyError


class CurrencyConvertView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from_currency = request.query_params.get("from")
        to_currency = request.query_params.get("to")
        amount = request.query_params.get("amount")

        if not from_currency or not to_currency or not amount:
            return Response(
                {"error": "Missing parameters. Use ?from=USD&to=PKR&amount=100"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = float(amount)
        except ValueError:
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = convert_currency(amount, from_currency, to_currency)
            return Response(result)
        except CurrencyError as ce:
            return Response({"error": str(ce)}, status=status.HTTP_400_BAD_REQUEST)
