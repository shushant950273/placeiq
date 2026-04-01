from django.db import models
from drives.models import PlacementDrive
from students.models import StudentProfile

class InterviewExperience(models.Model):
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )
    drive = models.ForeignKey(PlacementDrive, on_delete=models.CASCADE, related_name='experiences')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='experiences')
    rounds_description = models.TextField()
    questions_asked = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    tips = models.TextField(blank=True, null=True)
    overall_rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Experience: {self.drive.company.name} by {self.student.user.name}"
