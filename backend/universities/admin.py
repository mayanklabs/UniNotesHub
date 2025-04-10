# universities/admin.py
from django.contrib import admin
from .models import University, Program, Branch, Course

# Inline classes for hierarchical editing
class CourseInline(admin.TabularInline):
    model = Course
    extra = 1  # Number of empty rows to display
    fields = ('name', 'image')

class BranchInline(admin.TabularInline):
    model = Branch
    extra = 1
    fields = ('name', 'image')
    inlines = [CourseInline]

class ProgramInline(admin.TabularInline):
    model = Program
    extra = 1
    fields = ('name', 'image')
    inlines = [BranchInline]

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'image')
    fields = ('name', 'image')
    inlines = [ProgramInline]  # Show Programs inline under University
    search_fields = ('name',)  # Allow searching by university name

@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'university', 'image')
    fields = ('name', 'university', 'image')
    list_filter = ('university',)  # Filter by university
    inlines = [BranchInline]  # Show Branches inline under Program
    search_fields = ('name', 'university__name')  # Search by program name or university name

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'program', 'university_name', 'image')
    fields = ('name', 'program', 'image')
    list_filter = ('program', 'program__university')  # Filter by program and university
    inlines = [CourseInline]  # Show Courses inline under Branch
    search_fields = ('name', 'program__name', 'program__university__name')  # Search by branch, program, or university name

    def university_name(self, obj):
        return obj.program.university.name
    university_name.short_description = 'University'

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'program_name', 'university_name', 'image')
    fields = ('name', 'branch', 'image')
    list_filter = ('branch', 'branch__program', 'branch__program__university')  # Filter by branch, program, and university
    search_fields = ('name', 'branch__name', 'branch__program__name', 'branch__program__university__name')  # Search across all levels

    def program_name(self, obj):
        return obj.branch.program.name
    program_name.short_description = 'Program'

    def university_name(self, obj):
        return obj.branch.program.university.name
    university_name.short_description = 'University'