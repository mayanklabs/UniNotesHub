from rest_framework import serializers
from universities.models import University, Program, Branch, Course


class UniversitySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = University
        fields = ['id', 'name', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        print(f"Serializer - Image: {obj.image}, Request: {request}")
        if obj.image and request:
            try:
                url = request.build_absolute_uri(obj.image.url)
                print(f"Generated URL: {url}")
                return url
            except Exception as e:
                print(f"Error generating URL: {e}")
                return None
        print("Returning None - No image or no request")
        return None


class ProgramSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(), source='university', write_only=True
    )
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = ['id', 'name', 'university', 'university_id', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class BranchSerializer(serializers.ModelSerializer):
    program = ProgramSerializer(read_only=True)
    program_id = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(), source='program', write_only=True
    )
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = ['id', 'name', 'program', 'program_id', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        try:
            if obj.image and hasattr(obj.image, 'url') and request:
                return request.build_absolute_uri(obj.image.url)
        except Exception as e:
            print(f"Error generating image URL: {e}")
        return None



class CourseSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(), source='branch', write_only=True
    )
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'name', 'branch', 'branch_id', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
