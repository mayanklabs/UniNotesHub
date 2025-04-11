from django.urls import path
from .views import (
    PYQListCreateView,
    UploadPYQView,
    UserPYQListView,
    EditDeletePYQView,
    UniversityPYQListView,
    RatePYQView,
    PYQRatingsView,
    ManagePYQRatingView,
    UniversityListView,
    UniversityProgramsListView,
    ProgramBranchesListView,
    BranchCoursesListView,
)

urlpatterns = [
    path('pyqs/', PYQListCreateView.as_view(), name='pyq-list-create'),
    path('pyqs/upload/', UploadPYQView.as_view(), name='pyqs-uploaded'),
    path('pyqs/myuploads/', UserPYQListView.as_view(), name='user-pyqs'),
    path('pyqs/myuploads/<int:pk>/', EditDeletePYQView.as_view(), name='edit-delete-pyq'),
    # Updated to 'courses' (plural) for consistency
    path(
        'pyqs/university/<int:university_id>/program/<int:program_id>/branch/<int:branch_id>/courses/<int:course_id>/',
        UniversityPYQListView.as_view(),
        name='university-pyqs',
    ),
    path('pyq/<int:pyq_id>/rate/', RatePYQView.as_view(), name='rate-pyq'),
    path('pyq/<int:pyq_id>/ratings/', PYQRatingsView.as_view(), name='pyq-ratings'),
    path('pyq/ratings/<int:pk>/', ManagePYQRatingView.as_view(), name='manage-pyq-rating'),
    path('universities/', UniversityListView.as_view(), name='university-list'),
    path('universities/<int:university_id>/programs/', UniversityProgramsListView.as_view(), name='university-programs'),
    path('programs/<int:program_id>/branches/', ProgramBranchesListView.as_view(), name='program-branches'),
    path('branches/<int:branch_id>/courses/', BranchCoursesListView.as_view(), name='branch-courses'),
]