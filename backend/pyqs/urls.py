<<<<<<< HEAD
# pyqs/urls.py
from django.urls import path, register_converter
from .views import (
    UploadPYQView, UserPYQListView, EditDeletePYQView,
    UniversityPYQListView, RatePYQView, PYQRatingsView,
    ManagePYQRatingView, SearchSuggestionsView
)

class IntOrAllConverter:
    regex = 'all|[0-9]+'
    def to_python(self, value):
        return value if value == 'all' else int(value)
    def to_url(self, value):
        return str(value)

register_converter(IntOrAllConverter, 'int_or_all')

urlpatterns = [
    path('pyqs/upload/', UploadPYQView.as_view(), name='pyqs_uploaded'),
    path('pyqs/myuploads/', UserPYQListView.as_view(), name='user-pyqs'),
    path('pyqs/myuploads/<int:pk>/', EditDeletePYQView.as_view(), name='edit-delete-pyq'),
    path(
        "pyqs/university/<int_or_all:university_id>/program/<int_or_all:program_id>/branch/<int_or_all:branch_id>/courses/<int_or_all:course_id>/",
=======
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
>>>>>>> b195cecee5960a039679701d411bb6184a3058e1
        UniversityPYQListView.as_view(),
        name='university-pyqs',
    ),
<<<<<<< HEAD
    path("pyq/<int:pyq_id>/ratings/", PYQRatingsView.as_view(), name="pyq-ratings"),
    path("pyq/<int:pyq_id>/rate/", RatePYQView.as_view(), name="rate-pyq"),
    path("ratings/<int:pk>/", ManagePYQRatingView.as_view(), name="manage-pyq-rating"),
    path('pyqs/suggestions/', SearchSuggestionsView.as_view(), name='search-suggestions'),
=======
    path('pyq/<int:pyq_id>/rate/', RatePYQView.as_view(), name='rate-pyq'),
    path('pyq/<int:pyq_id>/ratings/', PYQRatingsView.as_view(), name='pyq-ratings'),
    path('pyq/ratings/<int:pk>/', ManagePYQRatingView.as_view(), name='manage-pyq-rating'),
    path('universities/', UniversityListView.as_view(), name='university-list'),
    path('universities/<int:university_id>/programs/', UniversityProgramsListView.as_view(), name='university-programs'),
    path('programs/<int:program_id>/branches/', ProgramBranchesListView.as_view(), name='program-branches'),
    path('branches/<int:branch_id>/courses/', BranchCoursesListView.as_view(), name='branch-courses'),
>>>>>>> b195cecee5960a039679701d411bb6184a3058e1
]