from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
import os

# Secure the admin URL
ADMIN_URL = os.getenv("DJANGO_ADMIN_URL", "secureadmin/")


# Simple homepage view
def home(request):
    return HttpResponse("Welcome to UniNotesHub!")


urlpatterns = [
    path(ADMIN_URL, admin.site.urls),
    path('api/', include('authentication.urls')),
    path('api/', include('search.urls')),
    path('api/', include('users.urls')),
    path('api/', include('pyqs.urls')),
    path('api/', include('universities.urls')),
    path("", home, name="home"),
]

# Serve static & media files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)