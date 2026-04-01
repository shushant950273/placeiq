from django.db import models
from django.conf import settings


class Company(models.Model):
    INDUSTRY_CHOICES = (
        ('IT', 'IT / Software'),
        ('Finance', 'Finance / Banking'),
        ('Core', 'Core Engineering'),
        ('Consulting', 'Consulting'),
        ('Other', 'Other'),
    )
    EMPLOYEE_CHOICES = (
        ('<100', 'Less than 100'),
        ('100-1000', '100 – 1,000'),
        ('1000-10000', '1,000 – 10,000'),
        ('10000+', 'More than 10,000'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='company_profile')
    name = models.CharField(max_length=255)           # Used for drive matching — must match user.name
    company_full_name = models.CharField(max_length=255, blank=True, null=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    website = models.URLField(max_length=500, blank=True, null=True)
    industry = models.CharField(max_length=150, blank=True, null=True, choices=INDUSTRY_CHOICES)
    about = models.TextField(blank=True, null=True)
    avg_ctc = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    headquarters = models.CharField(max_length=255, blank=True, null=True)
    employee_count = models.CharField(max_length=20, blank=True, null=True, choices=EMPLOYEE_CHOICES)

    def __str__(self):
        return self.name
