from rest_framework import permissions

class IsUploaderOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:  # Allow read-only access for all
            return True
        return obj.uploader == request.user  # Only uploader can modify/delete



class IsUploaderOrReadOnly(permissions.BasePermission):
    """Allow only the uploader to modify or delete the PYQ."""

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for anyone (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the uploader
        return obj.uploader == request.user