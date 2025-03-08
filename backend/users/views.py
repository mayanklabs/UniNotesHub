from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserProfileSerializer
from .models import UserProfile
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from rest_framework.response import Response



User = get_user_model()



class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        try:
            user = User.objects.get(email=request.data['email'])
            response.data['user'] = {
                "email": user.email,
                "name": user.name,
                "profile_picture": None  # Adjust based on your model
            }
        except User.DoesNotExist:
            response.data['user'] = {'email': request.data['email'], 'name': '', 'profile_picture': None}
        return response


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=401)

        user_profile, _ = UserProfile.objects.get_or_create(user=user)
        serializer = UserProfileSerializer(user_profile)

        # Include user data along with profile
        return Response({
            "id": user.id,
            "name": user.name,  # Assuming user has first_name for display
            "email": user.email,
            "profile": serializer.data
        }, status=200)

    def put(self, request, *args, **kwargs):
        user = request.user
        user_profile, _ = UserProfile.objects.get_or_create(user=user)

        # Extract profile picture if present
        profile_picture = request.FILES.get("profile_picture")

        # Extract name if present
        name = request.data.get("name", user.name)

        # Update user model
        user.name = name
        user.save()

        # Update user profile
        serializer = UserProfileSerializer(user_profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save(profile_picture=profile_picture if profile_picture else user_profile.profile_picture)
            return Response({
                "message": "Profile updated successfully!",
                "data": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "profile": serializer.data
                }
            }, status=200)

        return Response(serializer.errors, status=400)
