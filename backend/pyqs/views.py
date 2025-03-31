import os
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from .models import PYQ, PYQRating
from universities.models import University, Program, Branch, Course
from .serializers import (
    PYQSerializer, PYQRatingSerializer, UniversitySerializer,
    ProgramSerializer, BranchSerializer, CourseSerializer
)
from .permissions import IsUploaderOrReadOnly

class PYQListCreateView(generics.ListCreateAPIView):
    queryset = PYQ.objects.all()
    serializer_class = PYQSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)

class UploadPYQView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        print(f"Received Data: {request.data}")
        serializer = PYQSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(uploader=request.user)
            print("Upload successful!")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(f"Errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPYQListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all PYQs uploaded by the current user, excluding those with missing files."""
        pyqs = PYQ.objects.filter(uploader=request.user)
        valid_pyqs = [pyq for pyq in pyqs if os.path.exists(pyq.file.path)]
        serializer = PYQSerializer(valid_pyqs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class EditDeletePYQView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PYQSerializer
    permission_classes = [IsAuthenticated, IsUploaderOrReadOnly]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return PYQ.objects.filter(uploader=self.request.user)

    def perform_destroy(self, instance):
        """Delete the file from the filesystem before deleting the record."""
        if os.path.exists(instance.file.path):
            os.remove(instance.file.path)
        instance.delete()

    def perform_update(self, serializer):
        """Handle file replacement during update."""
        instance = self.get_object()
        if 'file' in self.request.data and instance.file and os.path.exists(instance.file.path):
            os.remove(instance.file.path)  # Remove old file if a new one is uploaded
        serializer.save()

class UniversityPYQListView(generics.ListAPIView):
    serializer_class = PYQSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        university_id = self.kwargs.get("university_id")
        program_id = self.kwargs.get("program_id")
        branch_id = self.kwargs.get("branch_id")
        course_id = self.kwargs.get("course_id")
        return PYQ.objects.filter(
            course__branch__program__university_id=university_id,
            course__branch__program_id=program_id,
            course__branch_id=branch_id,
            course_id=course_id,
        )



class PYQRatingsView(generics.ListAPIView):
    serializer_class = PYQRatingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        pyq_id = self.kwargs["pyq_id"]
        if not PYQ.objects.filter(id=pyq_id).exists():
            return PYQRating.objects.none()
        return PYQRating.objects.filter(pyq_id=pyq_id).order_by("-created_at")
    

class RatePYQView(generics.CreateAPIView):
    serializer_class = PYQRatingSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        pyq_id = self.kwargs["pyq_id"]
        pyq = PYQ.objects.get(id=pyq_id)
        serializer.save(user=self.request.user, pyq=pyq)

    def create(self, request, *args, **kwargs):
        pyq_id = self.kwargs["pyq_id"]
        try:
            pyq = PYQ.objects.get(id=pyq_id)
        except PYQ.DoesNotExist:
            return Response({"detail": "PYQ not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Merge pyq into the data
        data = request.data.copy()  # Copy to avoid mutating original
        data['pyq'] = pyq_id  # Add pyq to satisfy serializer
        serializer = self.get_serializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ManagePYQRatingView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PYQRatingSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        """Only allow access to the user's own ratings."""
        return PYQRating.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        """Ensure only the owner can update their rating/comment."""
        instance = self.get_object()
        if instance.user != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own ratings.")
        serializer.save()

    def perform_destroy(self, instance):
        """Ensure only the owner can delete their rating/comment."""
        if instance.user != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own ratings.")
        instance.delete()

# Views for University, Program, Branch, Course
class UniversityListView(generics.ListAPIView):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [AllowAny]

class UniversityProgramsListView(generics.ListAPIView):
    serializer_class = ProgramSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        university_id = self.kwargs['university_id']
        return Program.objects.filter(university_id=university_id)

class ProgramBranchesListView(generics.ListAPIView):
    serializer_class = BranchSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        program_id = self.kwargs['program_id']
        return Branch.objects.filter(program_id=program_id)

class BranchCoursesListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        branch_id = self.kwargs['branch_id']
        return Course.objects.filter(branch_id=branch_id)