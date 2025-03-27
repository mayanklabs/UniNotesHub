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
        # Extract user data if present
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Update user fields (e.g., name)
        if 'name' in user_data:
            user.name = user_data['name']
            user.save()

        # Let ModelSerializer handle the profile_picture update
        if 'profile_picture' in validated_data:
            print("Received file:", validated_data['profile_picture'])
            instance.profile_picture = validated_data['profile_picture']
        instance.save()
        print("Saved profile picture path:", instance.profile_picture.path)
        return instance