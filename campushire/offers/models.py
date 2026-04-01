from django.db import models
from drives.models import PlacementDrive
from students.models import StudentProfile

class Offer(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    )
    drive = models.ForeignKey(PlacementDrive, on_delete=models.CASCADE, related_name='offers')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='offers')
    ctc_offered = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    responded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Offer: {self.student.user.name} from {self.drive.company.name} ({self.status})"
