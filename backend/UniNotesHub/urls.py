from django.contrib import admin
from django.urls import path
from django.urls import path, include
import os

ADMIN_URL = os.getenv("DJANGO_ADMIN_URL", "secureadmin/")  # Default to "secureadmin/" if not set


urlpatterns = [
    path(ADMIN_URL, admin.site.urls),  # Real admin
    path('', include('users.urls')),
]
