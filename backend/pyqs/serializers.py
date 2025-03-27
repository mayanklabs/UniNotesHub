# pyqs/serializers.py
from rest_framework import serializers
from .models import PYQ, PYQRating
from universities.models import University, Program, Branch, Course

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ['id', 'name']

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name', 'university']

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'program']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'branch']

class PYQSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    university_name = serializers.CharField(source='university.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None

    class Meta:
        model = PYQ
        fields = [
            'id', 'university', 'university_name', 'program', 'branch', 'branch_name',
            'course', 'course_name', 'semester', 'year', 'file', 'file_url',
            'uploader', 'uploaded_at'
        ]
        read_only_fields = ['uploader', 'uploaded_at']

class PYQRatingSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    pyq = serializers.PrimaryKeyRelatedField(queryset=PYQ.objects.all())

    class Meta:
        model = PYQRating
        fields = ["id", "user", "pyq", "rating", "comment", "created_at"]
        read_only_fields = ["user", "created_at"]

    def get_user(self, obj):
        user = obj.user
        request = self.context.get('request')
        try:
            # Assuming a Profile model exists with a profile_picture field
            profile = user.profile  # Adjust based on your actual model relationship
            profile_picture = profile.profile_picture
            if profile_picture and hasattr(profile_picture, 'url'):
                # Build absolute URL if request is available, otherwise return relative path
                profile_picture_url = request.build_absolute_uri(profile_picture.url) if request else profile_picture.url
            else:
                profile_picture_url = None
        except AttributeError:
            # If no Profile model or profile_picture field exists, return None
            profile_picture_url = None

        return {
            "id": user.id,
            "email": user.email,
            "name": user.name if hasattr(user, 'name') else user.username,  # Use username if name isn't a field
            "profile_picture": profile_picture_url
        }

    def validate(self, data):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required to rate or comment.")

        pyq = data.get("pyq")
        user = request.user
        if self.instance is None and PYQRating.objects.filter(pyq=pyq, user=user).exists():
            raise serializers.ValidationError("You have already rated or commented on this question.")

        rating = data.get("rating")
        if rating is not None and (rating < 0 or rating > 5):
            raise serializers.ValidationError("Rating must be between 0 and 5.")

        return data

    def update(self, instance, validated_data):
        if instance.user != self.context["request"].user:
            raise serializers.ValidationError("You can only edit your own comments.")
        return super().update(instance, validated_data)