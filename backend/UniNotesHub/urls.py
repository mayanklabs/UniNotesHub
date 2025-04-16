from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

# Simple homepage view
def home(request):
    return HttpResponse("Welcome to UniNotesHub!")

urlpatterns = [
    path('admin/', admin.site.urls),  # Use /admin/ directly
    path('api/', include([
        path('', include('pyqs.urls')),
        path('', include('authentication.urls')),
<<<<<<< HEAD
=======
        path('', include('search.urls')),
>>>>>>> b195cecee5960a039679701d411bb6184a3058e1
        path('', include('users.urls')),
        path('', include('universities.urls')),
    ])),
    path("", home, name="home"),
]

# Serve static & media files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)