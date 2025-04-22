# pyqs/views.py
from rest_framework import generics, permissions, status
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication  # Correct import
from rest_framework.parsers import MultiPartParser, FormParser
from .models import PYQ, PYQRating
from universities.models import University, Program, Branch, Course
from .serializers import (
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

        universities = University.objects.filter(name__icontains=query)
        programs = Program.objects.filter(name__icontains=query).select_related('university')
        branches = Branch.objects.filter(name__icontains=query).select_related('program__university')
        courses = Course.objects.filter(name__icontains=query).select_related('branch__program__university')

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



class UniversityPYQListView(generics.ListAPIView):
    serializer_class = PYQSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        university_id = self.kwargs.get("university_id")
        program_id = self.kwargs.get("program_id")
        branch_id = self.kwargs.get("branch_id")
        course_id = self.kwargs.get("course_id")

        # Handle 'undefined' or invalid parameters
        if university_id in (None, 'undefined', 'all') or program_id in (None, 'undefined', 'all') or \
           branch_id in (None, 'undefined', 'all') or course_id in (None, 'undefined', 'all'):
            return PYQ.objects.none()  # Return empty queryset if any param is invalid

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

class RatePYQView(generics.CreateAPIView):
    serializer_class = PYQRatingSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        pyq_id = self.kwargs["pyq_id"]
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

class ManagePYQRatingView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PYQRatingSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return PYQRating.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        if "pyq" in self.request.data:
            raise serializers.ValidationError({"error": "You cannot change the PYQ for your rating."})
        serializer.save()