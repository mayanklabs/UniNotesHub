# serializers.py
from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name', required=False)  # From User model
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'name', 'email', 'profile_picture']  # Adjust fields as needed
        read_only_fields = ['id', 'name', 'email']

    def update(self, instance, validated_data):
        # Extract user-related data
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Update User name field
        if 'name' in user_data:
            user.name = user_data['name']
            user.save()

        # Update UserProfile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance