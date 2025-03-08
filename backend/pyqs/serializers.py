from rest_framework import serializers
from .models import PYQ
from .models import PYQRating

class PYQSerializer(serializers.ModelSerializer):
    class Meta:
        model = PYQ
        fields = ['id', 'university', 'program', 'branch', 'course', 'semester', 'year', 'file', 'uploader', 'uploaded_at']
        read_only_fields = ['uploader']



class PYQRatingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")  # Show username instead of ID

    class Meta:
        model = PYQRating
        fields = ["id", "user", "pyq", "rating", "comment", "created_at"]