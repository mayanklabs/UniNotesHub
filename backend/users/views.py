# views.py
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserProfileSerializer
from .models import UserProfile
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=401)
        
        try:
            # Try to get or create the UserProfile
            user_profile, created = UserProfile.objects.get_or_create(user=user)
            serializer = UserProfileSerializer(user_profile)
            return Response(serializer.data, status=200)
        except UserProfile.DoesNotExist:
            # This shouldn’t happen with get_or_create, but keep for safety
            return Response({"detail": "Profile not found"}, status=404)

    def put(self, request, *args, **kwargs):
        """Update user profile details (including name) and upload profile picture"""
        user_profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(user_profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully!", "data": serializer.data}, status=200)
        
        return Response(serializer.errors, status=400)