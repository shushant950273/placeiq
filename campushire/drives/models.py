from django.db import models
from companies.models import Company
from accounts.models import College

class PlacementDrive(models.Model):
    STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='drives')
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='drives', null=True, blank=True)
    college_name = models.CharField(max_length=255, blank=True, null=True) # retaining for backward compatibility temporarily
    role_name = models.CharField(max_length=255)
    ctc = models.DecimalField(max_digits=10, decimal_places=2)
    eligibility_gpa = models.DecimalField(max_digits=4, decimal_places=2)
    eligible_branches = models.JSONField(default=list)
    max_backlogs = models.IntegerField(default=0)
    drive_date = models.DateField()
    registration_deadline = models.DateTimeField()
    job_location = models.CharField(max_length=255)
    rounds_count = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company.name} - {self.role_name} at {self.college_name}"
