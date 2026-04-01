from django.db import models
from django.conf import settings

class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    usn = models.CharField(max_length=50, unique=True)
    branch = models.CharField(max_length=100)
    semester = models.IntegerField(choices=[(i, str(i)) for i in range(1, 9)])
    gpa = models.DecimalField(max_digits=4, decimal_places=2)
    backlogs = models.IntegerField(default=0)
    skills = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    resume_url = models.URLField(max_length=500, blank=True, null=True)
    linkedin_url = models.URLField(max_length=500, blank=True, null=True)
    github_url = models.URLField(max_length=500, blank=True, null=True)
    profile_score = models.IntegerField(default=0)
    is_placed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.name} ({self.usn})"
