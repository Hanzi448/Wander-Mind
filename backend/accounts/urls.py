from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProfileView
from .views import CustomTokenObtainPairView, GoogleAuthView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("google/", GoogleAuthView.as_view(), name="google_auth"),
]

urlpatterns += [
    path("me/", ProfileView.as_view(), name="profile"),
]