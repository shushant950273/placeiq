from django.db import models
from drives.models import PlacementDrive
from students.models import StudentProfile

class DriveApplication(models.Model):
    STATUS_CHOICES = (
        ('applied', 'Applied'),
        ('shortlisted', 'Shortlisted'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
    )
    drive = models.ForeignKey(PlacementDrive, on_delete=models.CASCADE, related_name='applications')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='applications')
    applied_at = models.DateTimeField(auto_now_add=True)
    current_round = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')

    def __str__(self):
        return f"{self.student.user.name} -> {self.drive.company.name} ({self.status})"

class DriveRound(models.Model):
    ROUND_CHOICES = (
        ('written', 'Written'),
        ('gd', 'Group Discussion'),
        ('technical', 'Technical'),
        ('hr', 'HR'),
    )
    drive = models.ForeignKey(PlacementDrive, on_delete=models.CASCADE, related_name='rounds')
    round_number = models.IntegerField()
    round_name = models.CharField(max_length=20, choices=ROUND_CHOICES)
    scheduled_at = models.DateTimeField()
    result_declared = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.drive.company.name} - Round {self.round_number} ({self.get_round_name_display()})"

class RoundResult(models.Model):
    STATUS_CHOICES = (
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('pending', 'Pending'),
    )
    round = models.ForeignKey(DriveRound, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='round_results')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    feedback = models.TextField(blank=True, null=True)
    declared_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.student.user.name} - {self.round.get_round_name_display()} - {self.status}"
