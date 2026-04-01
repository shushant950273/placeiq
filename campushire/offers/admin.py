from django.contrib import admin
from .models import Offer

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('student', 'drive', 'ctc_offered', 'status', 'responded_at')
    list_filter = ('status',)
