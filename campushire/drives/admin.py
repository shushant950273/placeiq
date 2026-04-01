from django.contrib import admin
from .models import PlacementDrive

@admin.register(PlacementDrive)
class PlacementDriveAdmin(admin.ModelAdmin):
    list_display = ('company', 'role_name', 'drive_date', 'status')
    search_fields = ('company__name', 'role_name', 'college_name')
    list_filter = ('status', 'drive_date')
