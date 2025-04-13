<<<<<<< HEAD
# pyqs/views.py
from rest_framework import generics, permissions, status
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication  # Correct import
=======
import os
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
>>>>>>> b195cecee5960a039679701d411bb6184a3058e1
from rest_framework.parsers import MultiPartParser, FormParser
from .models import PYQ, PYQRating
from universities.models import University, Program, Branch, Course
from .serializers import (
<<<<<<< HEAD
    PYQSerializer, PYQRatingSerializer
)
from universities.serializers import ( 
    UniversitySerializer,
    ProgramSerializer,
    BranchSerializer,
    CourseSerializer
)
from .permissions import IsUploaderOrReadOnly
from django.db.models import Q
from rest_framework import serializers

class SearchSuggestionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({"universities": [], "programs": [], "branches": [], "courses": []})
=======
    PYQSerializer, PYQRatingSerializer, UniversitySerializer,
    ProgramSerializer, BranchSerializer, CourseSerializer
)
from .permissions import IsUploaderOrReadOnly
>>>>>>> b195cecee5960a039679701d411bb6184a3058e1

        universities = University.objects.filter(name__icontains=query)
        programs = Program.objects.filter(name__icontains=query).select_related('university')
        branches = Branch.objects.filter(name__icontains=query).select_related('program__university')
        courses = Course.objects.filter(name__icontains=query).select_related('branch__program__university')

<<<<<<< HEAD
        print(f"Query: {query}, Universities: {list(universities)}")  # Debug log
        university_serializer = UniversitySerializer(universities, many=True)
        program_serializer = ProgramSerializer(programs, many=True)
        branch_serializer = BranchSerializer(branches, many=True)
        course_serializer = CourseSerializer(courses, many=True)

        return Response({
            "universities": university_serializer.data,
            "programs": program_serializer.data,
            "branches": branch_serializer.data,
            "courses": course_serializer.data
        })

class UniversityListView(generics.ListAPIView):
    serializer_class = UniversitySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()
        print(f"University query: {query}")  # Debug log
        if query:
            return University.objects.filter(name__icontains=query)
        return University.objects.all()



=======
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

>>>>>>> b195cecee5960a039679701d411bb6184a3058e1
class UniversityPYQListView(generics.ListAPIView):
    serializer_class = PYQSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        university_id = self.kwargs.get("university_id")
        program_id = self.kwargs.get("program_id")
        branch_id = self.kwargs.get("branch_id")
        course_id = self.kwargs.get("course_id")
<<<<<<< HEAD

        # Handle 'undefined' or invalid parameters
        if university_id in (None, 'undefined', 'all') or program_id in (None, 'undefined', 'all') or \
           branch_id in (None, 'undefined', 'all') or course_id in (None, 'undefined', 'all'):
            return PYQ.objects.none()  # Return empty queryset if any param is invalid
=======
        return PYQ.objects.filter(
            course__branch__program__university_id=university_id,
            course__branch__program_id=program_id,
            course__branch_id=branch_id,
            course_id=course_id,
        )
>>>>>>> b195cecee5960a039679701d411bb6184a3058e1

        try:
            queryset = PYQ.objects.all()
            if university_id:
                queryset = queryset.filter(course__branch__program__university_id=university_id)
            if program_id:
                queryset = queryset.filter(course__branch__program_id=program_id)
            if branch_id:
                queryset = queryset.filter(course__branch_id=branch_id)
            if course_id:
                queryset = queryset.filter(course_id=course_id)
            return queryset
        except ValueError:
            return PYQ.objects.none()  # Return empty queryset on invalid ID

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({"detail": "No PYQs found for the specified path."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

<<<<<<< HEAD
class UploadPYQView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = PYQSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(uploader=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPYQListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
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
        if os.path.exists(instance.file.path):
            os.remove(instance.file.path)
        instance.delete()

    def perform_update(self, serializer):
        instance = self.get_object()
        if 'file' in self.request.data and instance.file and os.path.exists(instance.file.path):
            os.remove(instance.file.path)
        serializer.save()
=======
class PYQRatingsView(generics.ListAPIView):
    serializer_class = PYQRatingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        pyq_id = self.kwargs["pyq_id"]
        if not PYQ.objects.filter(id=pyq_id).exists():
            return PYQRating.objects.none()
        return PYQRating.objects.filter(pyq_id=pyq_id).order_by("-created_at")
    
>>>>>>> b195cecee5960a039679701d411bb6184a3058e1

class RatePYQView(generics.CreateAPIView):
    serializer_class = PYQRatingSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        pyq_id = self.kwargs["pyq_id"]
<<<<<<< HEAD
        user = self.request.user
        if PYQRating.objects.filter(pyq_id=pyq_id, user=user).exists():
            raise serializers.ValidationError({"error": "You have already rated this PYQ."})
        pyq = PYQ.objects.get(id=pyq_id)
        serializer.save(user=user, pyq=pyq)

class PYQRatingsView(generics.ListAPIView):
    serializer_class = PYQRatingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        pyq_id = self.kwargs["pyq_id"]
        return PYQRating.objects.filter(pyq_id=pyq_id).order_by("-created_at")
=======
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
>>>>>>> b195cecee5960a039679701d411bb6184a3058e1

class ManagePYQRatingView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PYQRatingSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        """Only allow access to the user's own ratings."""
        return PYQRating.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
<<<<<<< HEAD
        instance = self.get_object()
        if "pyq" in self.request.data:
            raise serializers.ValidationError({"error": "You cannot change the PYQ for your rating."})
        serializer.save()
=======
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
>>>>>>> b195cecee5960a039679701d411bb6184a3058e1
