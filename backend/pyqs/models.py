from django.db import models
from django.contrib.auth import get_user_model
from universities.models import University, Program, Branch, Course

User = get_user_model()

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


    YEAR_CHOICES = [(str(year), str(year)) for year in range(2000, 2031)]

    university = models.ForeignKey(University, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    year = models.CharField(max_length=4, choices=YEAR_CHOICES, default='2024')
    semester = models.CharField(max_length=1, choices=SEMESTER_CHOICES, default='1')
    file = models.FileField(upload_to='pyqs/')
    uploader = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pyqs_uploaded")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.name} - {self.year}"




class PYQRating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Only logged-in users
    pyq = models.ForeignKey(PYQ, on_delete=models.CASCADE, related_name="ratings")
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])  # 1-5 stars
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} rated {self.pyq.course.name} ({self.rating}⭐)"