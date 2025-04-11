from django.db import models
from django.contrib.auth import get_user_model
import os
import uuid

User = get_user_model()

def upload_to(instance, filename):
    ext = filename.split('.')[-1]  # Get file extension
    unique_filename = f"{uuid.uuid4()}.{ext}"  # Generate unique filename
    path = os.path.join('profile_pics', str(instance.user.id), unique_filename)
    print("Upload path:", path)
    print(f"Upload path for user {instance.user.id}: {path}")
    return path

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_picture = models.ImageField(upload_to = upload_to, blank=True, null=True)

    def __str__(self):
        return self.user.email if self.user else "No User"
