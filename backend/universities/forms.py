# universities/forms.py

from dal import autocomplete
from django import forms
from .models import Course, Branch

class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ('name', 'branch', 'image')
        widgets = {
            'branch': autocomplete.ModelSelect2(url='branch-autocomplete')
        }
