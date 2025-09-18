from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer, LoginResponseSerializer
from django.contrib.auth import get_user_model
from rest_framework import permissions
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from django.contrib.auth import logout
from .serializers import ProfileSerializer

User = get_user_model()

# JWT Login
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# Google Auth
class GoogleAuthView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token")
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID  # replace with actual client ID
            )

            email = idinfo["email"]

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email.split("@")[0],
                    "is_google_user": True,
                    "google_id": idinfo["sub"],
                }
            )

            refresh = RefreshToken.for_user(user)
            serializer = UserSerializer(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": serializer.data
            })

        except Exception as e:
            return Response({"error": str(e)}, status=400)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data
        }
        return Response(data)
    
# Logout
class LogoutView(generics.GenericAPIView):
    def post(self, request):
        try:
            logout(request)
            return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile