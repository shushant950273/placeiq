from rest_framework import serializers
from .models import DriveApplication, DriveRound, RoundResult
from drives.serializers import DriveSerializer

class DriveApplicationSerializer(serializers.ModelSerializer):
    drive_details = DriveSerializer(source='drive', read_only=True)
    student_name   = serializers.CharField(source='student.user.name', read_only=True)
    student_branch = serializers.CharField(source='student.branch', read_only=True)
    student_gpa    = serializers.DecimalField(source='student.gpa', max_digits=4, decimal_places=2, read_only=True)
    student_backlogs = serializers.IntegerField(source='student.backlogs', read_only=True)

    class Meta:
        model = DriveApplication
        fields = '__all__'

class DriveRoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriveRound
        fields = '__all__'
