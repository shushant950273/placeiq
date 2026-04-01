from django.contrib import admin
from .models import StudentProfile

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'usn', 'branch', 'semester', 'gpa', 'is_placed')
    search_fields = ('user__email', 'user__name', 'usn')
    list_filter = ('branch', 'semester', 'is_placed')
