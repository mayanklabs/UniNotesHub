from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

# Simple homepage view
def home(request):
    return HttpResponse("Welcome to UniNotesHub!")

admin.site.site_header = "UniNotesHub"
admin.site.site_title = "UniNotesHub Portal"
admin.site.index_title = "Welcome to UniNotesHub Portal"
admin.site.empty_value_display = "-empty-"
admin.site.site_url = None  # Disable the admin site link in the header
admin.site.enable_nav_sidebar = True  # Disable the sidebar navigation

urlpatterns = [
    path("superadmin/", admin.site.urls),
    path("", home, name="home"),
    path("api/pyqs/", include("pyqs.urls")),
    path("api/auth/", include("authentication.urls")),
    path("api/users/", include("users.urls")),
    path("api/universities/", include("universities.urls")),
]

# Serve static & media files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
