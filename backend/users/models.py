from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

def upload_to(instance, filename):
    return f'profile_pictures/{instance.user.id}/{filename}'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_picture = models.ImageField(upload_to=upload_to, blank=True, null=True)

    def __str__(self):
        return self.user.email
