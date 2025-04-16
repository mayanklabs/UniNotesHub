from django.db import models

# Create your models here.
from django.db import models

class University(models.Model):
    name = models.CharField(max_length=255, unique=True)
    image = models.ImageField(upload_to='universities/', null=True, blank=True)

    def __str__(self):
        return self.name

class Program(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name="programs")
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='programs/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.university.name})"

class Branch(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="branches")
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='branches/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.program.name})"

class Course(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="courses")
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='courses/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.branch.name})"
