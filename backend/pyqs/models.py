from django.db import models
from django.contrib.auth import get_user_model
import os
from django.utils import timezone
from universities.models import University, Program, Branch, Course
from datetime import datetime

User = get_user_model()

def pyq_file_path(instance, filename):
    # Extract file extension
    ext = filename.split('.')[-1]
    # Create a unique filename using uploader ID and timestamp
    unique_name = f"{instance.uploader.id}_{timezone.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    # Return the full path
    return os.path.join('pyqs', unique_name)

class PYQ(models.Model):
    SEMESTER_CHOICES = [
        ('1', 'Semester 1'),
        ('2', 'Semester 2'),
        ('3', 'Semester 3'),
        ('4', 'Semester 4'),
        ('5', 'Semester 5'),
        ('6', 'Semester 6'),
        ('7', 'Semester 7'),
        ('8', 'Semester 8'),
    ]

    current_year = datetime.now().year
    YEAR_CHOICES = [(str(year), str(year)) for year in range(2000, current_year + 1)]

    university = models.ForeignKey(University, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    year = models.CharField(max_length=4, choices=YEAR_CHOICES, default=current_year)
    semester = models.CharField(max_length=1, choices=SEMESTER_CHOICES, default='1')
    file = models.FileField(upload_to=pyq_file_path)  # Updated to use custom function
    uploader = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pyqs_uploaded")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.name} - {self.year} - Sem {self.semester}"

class PYQRating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pyq = models.ForeignKey(PYQ, on_delete=models.CASCADE, related_name="ratings")
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])  # 1-5 stars
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'pyq')  # Ensure a user can rate a PYQ only once

    def __str__(self):
        return f"{self.user.username} rated {self.pyq.course.name} ({self.rating}⭐)"

    class Meta:
        unique_together = [['user', 'pyq']]
        ordering = ['-created_at']
