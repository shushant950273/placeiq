import os

BASE_DIR = r"c:\Users\aayud\Dropbox\My PC (LAPTOP-G96H3MML)\Desktop\project sp\campushire"

files_to_create = {
    "requirements.txt": """django
djangorestframework
djangorestframework-simplejwt
django-cors-headers
Pillow""",
    ".env": "",
    "manage.py": """#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campushire.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django."
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
""",
    "campushire/__init__.py": "",
    "campushire/wsgi.py": """import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campushire.settings')

application = get_wsgi_application()
""",
    "campushire/urls.py": """from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
]
""",
    "campushire/settings.py": """import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-replace-this-key'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    'accounts.apps.AccountsConfig',
    'students.apps.StudentsConfig',
    'companies.apps.CompaniesConfig',
    'drives.apps.DrivesConfig',
    'applications.apps.ApplicationsConfig',
    'experiences.apps.ExperiencesConfig',
    'notifications.apps.NotificationsConfig',
    'analytics.apps.AnalyticsConfig',
    'offers.apps.OffersConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'campushire.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'campushire.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
""",

    # ACCOUNTS APP
    "accounts/__init__.py": "",
    "accounts/apps.py": """from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
""",
    "accounts/admin.py": """from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'is_active', 'is_staff')
    search_fields = ('email', 'name')
    list_filter = ('role', 'is_active', 'is_staff')
""",
    "accounts/models.py": """from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, name, role, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, role, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, role, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('tpo', 'TPO'),
        ('student', 'Student'),
        ('company', 'Company'),
    )
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    college_name = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role']

    def __str__(self):
        return self.email
""",

    # STUDENTS APP
    "students/__init__.py": "",
    "students/apps.py": """from django.apps import AppConfig

class StudentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'students'
""",
    "students/admin.py": """from django.contrib import admin
from .models import StudentProfile

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'usn', 'branch', 'semester', 'gpa', 'is_placed')
    search_fields = ('user__email', 'user__name', 'usn')
    list_filter = ('branch', 'semester', 'is_placed')
""",
    "students/models.py": """from django.db import models
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
""",

    # COMPANIES APP
    "companies/__init__.py": "",
    "companies/apps.py": """from django.apps import AppConfig

class CompaniesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'companies'
""",
    "companies/admin.py": """from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'website')
    search_fields = ('name', 'industry')
""",
    "companies/models.py": """from django.db import models
from django.conf import settings

class Company(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='company_profile')
    name = models.CharField(max_length=255)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    website = models.URLField(max_length=500, blank=True, null=True)
    industry = models.CharField(max_length=150)
    about = models.TextField(blank=True, null=True)
    avg_ctc = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    headquarters = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name
""",

    # DRIVES APP
    "drives/__init__.py": "",
    "drives/apps.py": """from django.apps import AppConfig

class DrivesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'drives'
""",
    "drives/admin.py": """from django.contrib import admin
from .models import PlacementDrive

@admin.register(PlacementDrive)
class PlacementDriveAdmin(admin.ModelAdmin):
    list_display = ('company', 'role_name', 'drive_date', 'status')
    search_fields = ('company__name', 'role_name', 'college_name')
    list_filter = ('status', 'drive_date')
""",
    "drives/models.py": """from django.db import models
from companies.models import Company

class PlacementDrive(models.Model):
    STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='drives')
    college_name = models.CharField(max_length=255)
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
""",

    # APPLICATIONS APP
    "applications/__init__.py": "",
    "applications/apps.py": """from django.apps import AppConfig

class ApplicationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'applications'
""",
    "applications/admin.py": """from django.contrib import admin
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
""",
    "applications/models.py": """from django.db import models
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

    def __str__(self):
        return f"{self.student.user.name} - {self.round.get_round_name_display()} - {self.status}"
""",

    # EXPERIENCES APP
    "experiences/__init__.py": "",
    "experiences/apps.py": """from django.apps import AppConfig

class ExperiencesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'experiences'
""",
    "experiences/admin.py": """from django.contrib import admin
from .models import InterviewExperience

@admin.register(InterviewExperience)
class InterviewExperienceAdmin(admin.ModelAdmin):
    list_display = ('drive', 'student', 'difficulty', 'overall_rating', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'difficulty', 'overall_rating')
""",
    "experiences/models.py": """from django.db import models
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
""",

    # NOTIFICATIONS APP
    "notifications/__init__.py": "",
    "notifications/apps.py": """from django.apps import AppConfig

class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'
""",
    "notifications/admin.py": """from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'type', 'is_read', 'created_at')
    list_filter = ('is_read', 'type')
""",
    "notifications/models.py": """from django.db import models
from django.conf import settings

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=100)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification to {self.user.name}: {self.title}"
""",

    # ANALYTICS APP
    "analytics/__init__.py": "",
    "analytics/apps.py": """from django.apps import AppConfig

class AnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'analytics'
""",
    "analytics/admin.py": """from django.contrib import admin
""",
    "analytics/models.py": """from django.db import models
""",

    # OFFERS APP
    "offers/__init__.py": "",
    "offers/apps.py": """from django.apps import AppConfig

class OffersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'offers'
""",
    "offers/admin.py": """from django.contrib import admin
from .models import Offer

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('student', 'drive', 'ctc_offered', 'status', 'responded_at')
    list_filter = ('status',)
""",
    "offers/models.py": """from django.db import models
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
"""
}

for filepath, content in files_to_create.items():
    full_path = os.path.join(BASE_DIR, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\\n")

print("Django project generated successfully!")
