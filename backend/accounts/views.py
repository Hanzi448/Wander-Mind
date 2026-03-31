from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer
from django.contrib.auth import get_user_model
from rest_framework import permissions
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from django.contrib.auth import logout

def set_auth_cookies(response, refresh_token):
    secure = not settings.DEBUG
    response.set_cookie(
        'refresh_token',
        refresh_token,
        max_age=7 * 24 * 60 * 60,  # 7 days
        httponly=True,
        samesite='None' if secure else 'Lax',
        secure=secure
    )
    return response

def delete_auth_cookies(response):
    secure = not settings.DEBUG
    response.delete_cookie('refresh_token', samesite='None' if secure else 'Lax')
    return response

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
            
            response = Response({
                "access": str(refresh.access_token),
                "user": serializer.data
            })
            return set_auth_cookies(response, str(refresh))

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
        response = Response({
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data
        })
        return set_auth_cookies(response, str(refresh))
    
# Logout
class LogoutView(generics.GenericAPIView):
    def post(self, request):
        try:
            logout(request)
            response = Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
            return delete_auth_cookies(response)
        except Exception:
            return Response({"error": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            data = request.data.copy()
            data['refresh'] = refresh_token
            serializer = self.get_serializer(data=data)
            try:
                serializer.is_valid(raise_exception=True)
            except Exception as e:
                return Response({"detail": "Token is invalid or expired"}, status=status.HTTP_401_UNAUTHORIZED)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response({"detail": "Refresh token missing from cookies"}, status=status.HTTP_401_UNAUTHORIZED)



class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile