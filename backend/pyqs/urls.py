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
        UniversityPYQListView.as_view(),
        name="university-pyqs",
    ),
    path("pyq/<int:pyq_id>/ratings/", PYQRatingsView.as_view(), name="pyq-ratings"),
    path("pyq/<int:pyq_id>/rate/", RatePYQView.as_view(), name="rate-pyq"),
    path("ratings/<int:pk>/", ManagePYQRatingView.as_view(), name="manage-pyq-rating"),
    path('pyqs/suggestions/', SearchSuggestionsView.as_view(), name='search-suggestions'),
]