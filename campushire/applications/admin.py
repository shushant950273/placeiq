from django.contrib import admin
from .models import DriveApplication, DriveRound, RoundResult

@admin.register(DriveApplication)
class DriveApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'drive', 'current_round', 'status', 'applied_at')
    search_fields = ('student__user__name', 'drive__company__name')
    list_filter = ('status',)

@admin.register(DriveRound)
class DriveRoundAdmin(admin.ModelAdmin):
    list_display = ('drive', 'round_number', 'round_name', 'scheduled_at')
    list_filter = ('round_name', 'scheduled_at')

@admin.register(RoundResult)
class RoundResultAdmin(admin.ModelAdmin):
    list_display = ('student', 'round', 'status')
    list_filter = ('status',)
