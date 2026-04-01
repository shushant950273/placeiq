from rest_framework import serializers
from .models import InterviewExperience
from drives.serializers import DriveSerializer

class InterviewExperienceSerializer(serializers.ModelSerializer):
    drive_details = DriveSerializer(source='drive', read_only=True)

    class Meta:
        model = InterviewExperience
        exclude = ('student',)
