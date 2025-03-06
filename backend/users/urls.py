from django.urls import path
from .views import CustomTokenObtainPairView, UserProfileView

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
]
