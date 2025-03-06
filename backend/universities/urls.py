from django.urls import path
from .views import UniversityListCreateView, ProgramListCreateView, BranchListCreateView, CourseListCreateView

urlpatterns = [
    path("universities/", UniversityListCreateView.as_view(), name="university-list-create"),
    path("programs/", ProgramListCreateView.as_view(), name="program-list-create"),
    path("branches/", BranchListCreateView.as_view(), name="branch-list-create"),
    path("courses/", CourseListCreateView.as_view(), name="course-list-create"),
]
