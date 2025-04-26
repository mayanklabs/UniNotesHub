from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name', required=False)
    email = serializers.EmailField(source='user.email', read_only=True)
    profile_picture = serializers.ImageField(use_url=True)  # Ensure full URL is returned

    class Meta:
        model = UserProfile
        fields = ['id', 'name', 'email', 'profile_picture']
        read_only_fields = ['id', 'email']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})  # Extract 'user' data if present
        user = instance.user

        # Update user model fields (e.g., name)
        if 'name' in user_data:
            user.name = user_data['name']
            user.save()

        # Explicitly handle profile picture updates
        profile_picture = validated_data.get('profile_picture', None)
        if profile_picture is not None:  # Only update if a new image is provided
            instance.profile_picture = profile_picture

        instance.save()
        return instance
