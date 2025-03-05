from django.urls import path
from .views import PYQListCreateView, UploadPYQView, UserPYQListView, EditDeletePYQView, UniversityPYQListView, RatePYQView, PYQRatingsView, ManagePYQRatingView

urlpatterns = [
    path('pyqs/', PYQListCreateView.as_view(), name='pyq-list-create'),
    path('pyqs/upload/', UploadPYQView.as_view(), name='pyqs_uploaded'),
    path('pyqs/myuploads/', UserPYQListView.as_view(), name='user-pyqs'),
    path('pyqs/<int:pk>/', EditDeletePYQView.as_view(), name='edit-delete-pyq'), 
    path(
        "pyqs/university/<int:university_id>/program/<int:program_id>/branch/<int:branch_id>/courses/<int:course_id>/",
        UniversityPYQListView.as_view(),
        name="university-pyqs",
    ),
    path("pyq/<int:pyq_id>/ratings/", PYQRatingsView.as_view(), name="pyq-ratings"),
    path("pyq/<int:pyq_id>/rate/", RatePYQView.as_view(), name="rate-pyq"),
    path("pyq/<int:pyq_id>/rate/<int:pk>/", ManagePYQRatingView.as_view(), name="manage-pyq-rating"),
]
