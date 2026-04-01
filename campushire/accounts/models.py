from django.db import models
from django.conf import settings
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

class College(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    logo = models.URLField(max_length=500, blank=True, null=True)
    naac_grade = models.CharField(max_length=10, blank=True, null=True)
    established_year = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.name

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('tpo', 'TPO'),
        ('student', 'Student'),
        ('company', 'Company'),
    )
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True)
    college_name = models.CharField(max_length=255, blank=True, null=True) # retaining for backward compatibility temporarily
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role']

    def __str__(self):
        return self.email


class TPOProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tpo_profile'
    )
    department = models.CharField(max_length=255, blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    college_website = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"TPO Profile — {self.user.email}"
