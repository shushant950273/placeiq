from django.contrib import admin
from .models import InterviewExperience

@admin.register(InterviewExperience)
class InterviewExperienceAdmin(admin.ModelAdmin):
    list_display = ('drive', 'student', 'difficulty', 'overall_rating', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'difficulty', 'overall_rating')
