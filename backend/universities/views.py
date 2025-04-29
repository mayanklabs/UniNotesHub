from rest_framework import generics
from rest_framework.response import Response
from universities.models import University, Program, Branch, Course
from universities.serializers import UniversitySerializer, ProgramSerializer, BranchSerializer, CourseSerializer



class UniversityListCreateView(generics.ListCreateAPIView):
    serializer_class = UniversitySerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        queryset = University.objects.all().order_by('name')
        if query:
            queryset = queryset.filter(name__icontains=query)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context



class ProgramListCreateView(generics.ListCreateAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

    def get_queryset(self):
        university_id = self.request.query_params.get('university', None)
        queryset = Program.objects.select_related('university').order_by('name')
        if university_id:
            return queryset.filter(university_id=university_id)
        return queryset

class BranchListCreateView(generics.ListCreateAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

    def get_queryset(self):
        program_id = self.request.query_params.get('program', None)
        queryset = Branch.objects.select_related('program').order_by('name')
        if program_id:
            return queryset.filter(program_id=program_id)
        return queryset

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        branch_id = self.request.query_params.get('branch', None)
        queryset = Course.objects.select_related('branch').order_by('name')
        if branch_id:
            return queryset.filter(branch_id=branch_id)
        return queryset
