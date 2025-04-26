# pyqs/serializers.py
from rest_framework import serializers
from .models import PYQ, PYQRating


class PYQRatingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.name")
    user_id = serializers.ReadOnlyField(source="user.id")
    user_profile_picture = serializers.SerializerMethodField()

    def get_user_profile_picture(self, obj):
        if hasattr(obj.user, 'auth_profile') and obj.user.auth_profile and obj.user.auth_profile.picture:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.user.auth_profile.picture.url) if request else obj.user.auth_profile.picture.url
        return None

    class Meta:
        model = PYQRating
        fields = ["id", "user", "user_id", "user_profile_picture", "pyq", "rating", "comment", "created_at"]
        read_only_fields = ["user", "user_id", "user_profile_picture", "created_at"]

class PYQSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    university_name = serializers.CharField(source='university.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    ratings = PYQRatingSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    user_id = serializers.ReadOnlyField(source="uploader.id")

    def get_file_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request and obj.file else None

    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        return sum(r.rating for r in ratings) / ratings.count() if ratings.exists() else None

    class Meta:
        model = PYQ
        fields = [
            'id', 'university', 'university_name', 'program', 'branch', 'branch_name',
            'course', 'course_name', 'semester', 'year', 'file', 'file_url',
            'uploader', 'user_id', 'uploaded_at', 'ratings', 'average_rating',
        ]
        read_only_fields = ['uploader', 'user_id', 'uploaded_at', 'ratings', 'average_rating']