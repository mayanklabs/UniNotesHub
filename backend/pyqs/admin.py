from django.contrib import admin
from .models import University, Program, Branch, Course

admin.site.register(University)
admin.site.register(Program)
admin.site.register(Branch)
admin.site.register(Course)