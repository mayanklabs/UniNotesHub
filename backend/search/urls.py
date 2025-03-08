from django.urls import path
from .views import SearchPYQView

urlpatterns = [
    path('search/', SearchPYQView.as_view(), name='search-pyq'),
]
