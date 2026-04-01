import os

BASE_DIR = r"c:\Users\aayud\Dropbox\My PC (LAPTOP-G96H3MML)\Desktop\project sp\campushire"

files = {
    # ---------------- accounts ----------------
    "accounts/permissions.py": """from rest_framework.permissions import BasePermission

class IsTPO(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'tpo')

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'student')

class IsCompany(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'company')
""",

    "accounts/serializers.py": """from rest_framework import serializers
from django.contrib.auth import get_user_model
from students.models import StudentProfile
from companies.models import Company

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role', 'college_name')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'name', 'password', 'role', 'college_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data['role'],
            college_name=validated_data.get('college_name', '')
        )
        if user.role == 'student':
            StudentProfile.objects.create(user=user, usn=f"TEMP_{user.id}", branch="Unknown", semester=1, gpa=0.0)
        elif user.role == 'company':
            Company.objects.create(user=user, name=user.name)
        return user
""",

    "accounts/views.py": """from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(email=response.data['email'])
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class UserMeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
""",

    "accounts/urls.py": """from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserMeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('me/', UserMeView.as_view(), name='me'),
]
""",

    # ---------------- students ----------------
    "students/serializers.py": """from rest_framework import serializers
from .models import StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ('user', 'profile_score', 'is_placed')
""",

    "students/views.py": """import csv
from django.contrib.auth import get_user_model
from rest_framework import generics, status, views
from rest_framework.response import Response
from accounts.permissions import IsStudent, IsTPO
from .models import StudentProfile
from .serializers import StudentProfileSerializer

User = get_user_model()

class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsStudent]

    def get_object(self):
        profile, created = StudentProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'usn': f"TEMP_{self.request.user.id}", 'branch': 'Unknown', 'semester': 1, 'gpa': 0.0}
        )
        return profile

class TPOBulkUploadView(views.APIView):
    permission_classes = [IsTPO]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        
        success_count = 0
        failed_rows = []

        for row in reader:
            try:
                email = row['email']
                if not User.objects.filter(email=email).exists():
                    user = User.objects.create_user(
                        email=email, name=row['name'], role='student', 
                        password=row['usn'], college_name=request.user.college_name
                    )
                    StudentProfile.objects.create(
                        user=user,
                        usn=row['usn'],
                        branch=row['branch'],
                        semester=int(row['semester']),
                        gpa=float(row['gpa']),
                        backlogs=int(row['backlogs'])
                    )
                    success_count += 1
                else:
                    failed_rows.append({"row": row, "reason": "Email already exists"})
            except Exception as e:
                failed_rows.append({"row": row, "reason": str(e)})

        return Response({"success_count": success_count, "failed_rows": failed_rows})

class ProfileScoreView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request, *args, **kwargs):
        profile = request.user.student_profile
        score = 0
        suggestions = []

        if profile.resume_url: score += 20
        else: suggestions.append("Upload a resume to boost your score by 20%.")

        if profile.skills: score += 20
        else: suggestions.append("Add skills to boost your score by 20%.")

        if profile.certifications: score += 20
        else: suggestions.append("Add certifications to boost your score by 20%.")

        if profile.linkedin_url: score += 10
        else: suggestions.append("Add LinkedIn profile to boost your score by 10%.")

        if profile.github_url: score += 10
        else: suggestions.append("Add GitHub profile to boost your score by 10%.")

        if profile.gpa >= 7.0: score += 20
        else: suggestions.append("Maintain a GPA >= 7.0 for the remaining 20%.")

        profile.profile_score = score
        profile.save(update_fields=['profile_score'])

        return Response({"score": score, "suggestions": suggestions})
""",

    "students/urls.py": """from django.urls import path
from .views import StudentProfileView, TPOBulkUploadView, ProfileScoreView

urlpatterns = [
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
    path('bulk-upload/', TPOBulkUploadView.as_view(), name='bulk-upload'),
    path('profile-score/', ProfileScoreView.as_view(), name='profile-score'),
]
""",

    # ---------------- drives ----------------
    "drives/serializers.py": """from rest_framework import serializers
from .models import PlacementDrive

class DriveSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    is_applied = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = PlacementDrive
        fields = '__all__'
""",

    "drives/views.py": """from rest_framework import viewsets, generics, permissions
from django.db.models import Exists, OuterRef
from .models import PlacementDrive
from .serializers import DriveSerializer
from accounts.permissions import IsTPO, IsStudent

class DriveViewSet(viewsets.ModelViewSet):
    serializer_class = DriveSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsTPO()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = PlacementDrive.objects.all()

        if user.role == 'tpo':
            return qs.filter(college_name=user.college_name)
        
        elif user.role == 'student':
            profile = user.student_profile
            from applications.models import DriveApplication
            qs = qs.annotate(
                is_applied=Exists(DriveApplication.objects.filter(drive=OuterRef('pk'), student=profile))
            )
            qs = qs.filter(
                eligibility_gpa__lte=profile.gpa,
                max_backlogs__gte=profile.backlogs,
                status__in=['upcoming', 'ongoing']
            )
            return [d for d in qs if (not d.eligible_branches) or (profile.branch in getattr(d, 'eligible_branches', []))]
        
        return qs

class UpcomingDrivesView(generics.ListAPIView):
    serializer_class = DriveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PlacementDrive.objects.filter(status='upcoming').order_by('drive_date')
""",

    "drives/urls.py": """from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DriveViewSet, UpcomingDrivesView

router = DefaultRouter()
router.register(r'', DriveViewSet, basename='drive')

urlpatterns = [
    path('upcoming/', UpcomingDrivesView.as_view(), name='upcoming-drives'),
    path('', include(router.urls)),
]
""",

    # ---------------- applications ----------------
    "applications/serializers.py": """from rest_framework import serializers
from .models import DriveApplication, DriveRound, RoundResult
from drives.serializers import DriveSerializer

class DriveApplicationSerializer(serializers.ModelSerializer):
    drive_details = DriveSerializer(source='drive', read_only=True)
    student_name = serializers.CharField(source='student.user.name', read_only=True)

    class Meta:
        model = DriveApplication
        fields = '__all__'

class DriveRoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriveRound
        fields = '__all__'
""",

    "applications/views.py": """from rest_framework import views, generics, status
from rest_framework.response import Response
from django.utils import timezone
from .models import DriveApplication, DriveRound, RoundResult
from drives.models import PlacementDrive
from accounts.permissions import IsStudent, IsTPO
from .serializers import DriveApplicationSerializer

class ApplyDriveView(views.APIView):
    permission_classes = [IsStudent]

    def post(self, request, id, *args, **kwargs):
        try:
            drive = PlacementDrive.objects.get(id=id)
        except PlacementDrive.DoesNotExist:
            return Response({"error": "Drive not found"}, status=status.HTTP_404_NOT_FOUND)
        
        profile = request.user.student_profile
        
        if DriveApplication.objects.filter(drive=drive, student=profile).exists():
            return Response({"error": "Already applied"}, status=status.HTTP_400_BAD_REQUEST)
        
        if drive.registration_deadline < timezone.now():
            return Response({"error": "Deadline passed"}, status=status.HTTP_400_BAD_REQUEST)

        if profile.gpa < drive.eligibility_gpa or profile.backlogs > drive.max_backlogs:
            return Response({"error": "Not eligible"}, status=status.HTTP_400_BAD_REQUEST)

        app = DriveApplication.objects.create(drive=drive, student=profile)
        return Response({"message": "Successfully applied", "id": app.id}, status=status.HTTP_201_CREATED)

class StudentApplicationsView(generics.ListAPIView):
    serializer_class = DriveApplicationSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return DriveApplication.objects.filter(student=self.request.user.student_profile)

class DriveApplicantsView(generics.ListAPIView):
    serializer_class = DriveApplicationSerializer
    permission_classes = [IsTPO]

    def get_queryset(self):
        drive_id = self.kwargs.get('id')
        return DriveApplication.objects.filter(drive_id=drive_id)

class TPOShortlistView(views.APIView):
    permission_classes = [IsTPO]

    def post(self, request, id, *args, **kwargs):
        student_ids = request.data.get('student_ids', [])
        DriveApplication.objects.filter(drive_id=id, student_id__in=student_ids).update(status='shortlisted')
        return Response({"message": f"{len(student_ids)} students shortlisted."})

class DeclareRoundResultView(views.APIView):
    permission_classes = [IsTPO]

    def post(self, request, id, *args, **kwargs):
        results = request.data.get('results', [])
        round_inst = DriveRound.objects.get(id=id)
        for r in results:
            RoundResult.objects.update_or_create(
                round=round_inst, student_id=r['student_id'],
                defaults={'status': r['status'], 'feedback': r.get('feedback', '')}
            )
        return Response({"message": "Results updated"})

class StudentPipelineView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request, *args, **kwargs):
        profile = request.user.student_profile
        apps = DriveApplication.objects.filter(student=profile)
        data = []
        for app in apps:
            stages = []
            rounds = DriveRound.objects.filter(drive=app.drive)
            for r in rounds:
                result = RoundResult.objects.filter(round=r, student=profile).first()
                stages.append({
                    "name": r.get_round_name_display(),
                    "status": result.status if result else "pending",
                    "date": r.scheduled_at
                })
            data.append({
                "drive_name": app.drive.role_name,
                "company": app.drive.company.name,
                "stages": stages
            })
        return Response(data)
""",

    "applications/urls.py": """from django.urls import path
from .views import ApplyDriveView, StudentApplicationsView, DriveApplicantsView, TPOShortlistView, DeclareRoundResultView, StudentPipelineView

urlpatterns = [
    path('student/applications/', StudentApplicationsView.as_view(), name='student-applications'),
    path('student/pipeline/', StudentPipelineView.as_view(), name='student-pipeline'),
    path('drives/<int:id>/apply/', ApplyDriveView.as_view(), name='apply-drive'),
    path('drives/<int:id>/applicants/', DriveApplicantsView.as_view(), name='drive-applicants'),
    path('drives/<int:id>/shortlist/', TPOShortlistView.as_view(), name='tpo-shortlist'),
    path('rounds/<int:id>/result/', DeclareRoundResultView.as_view(), name='round-result'),
]
""",

    # ---------------- experiences ----------------
    "experiences/serializers.py": """from rest_framework import serializers
from .models import InterviewExperience
from drives.serializers import DriveSerializer

class InterviewExperienceSerializer(serializers.ModelSerializer):
    drive_details = DriveSerializer(source='drive', read_only=True)

    class Meta:
        model = InterviewExperience
        exclude = ('student',)
""",

    "experiences/views.py": """from rest_framework import generics, views, status
from rest_framework.response import Response
from .models import InterviewExperience
from .serializers import InterviewExperienceSerializer
from accounts.permissions import IsStudent, IsTPO
from applications.models import DriveApplication

class ExperienceFeedView(generics.ListAPIView):
    serializer_class = InterviewExperienceSerializer

    def get_queryset(self):
        qs = InterviewExperience.objects.filter(is_approved=True)
        company = self.request.query_params.get('company')
        difficulty = self.request.query_params.get('difficulty')
        if company:
            qs = qs.filter(drive__company__name__icontains=company)
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        return qs

class PendingExperienceView(generics.ListAPIView):
    serializer_class = InterviewExperienceSerializer
    permission_classes = [IsTPO]

    def get_queryset(self):
        return InterviewExperience.objects.filter(is_approved=False, drive__college_name=self.request.user.college_name)

class SubmitExperienceView(generics.CreateAPIView):
    serializer_class = InterviewExperienceSerializer
    permission_classes = [IsStudent]

    def perform_create(self, serializer):
        profile = self.request.user.student_profile
        drive_id = self.request.data.get('drive')
        if not DriveApplication.objects.filter(drive_id=drive_id, student=profile).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You must have applied to this drive to submit an experience.")
        serializer.save(student=profile, is_approved=False)

class ApproveExperienceView(views.APIView):
    permission_classes = [IsTPO]

    def put(self, request, id, *args, **kwargs):
        InterviewExperience.objects.filter(id=id).update(is_approved=True)
        return Response({"message": "Approved"})
""",

    "experiences/urls.py": """from django.urls import path
from .views import ExperienceFeedView, PendingExperienceView, SubmitExperienceView, ApproveExperienceView

urlpatterns = [
    path('feed/', ExperienceFeedView.as_view(), name='exp-feed'),
    path('pending/', PendingExperienceView.as_view(), name='exp-pending'),
    path('', SubmitExperienceView.as_view(), name='exp-submit'),
    path('<int:id>/approve/', ApproveExperienceView.as_view(), name='exp-approve'),
]
""",

    # ---------------- analytics ----------------
    "analytics/views.py": """from rest_framework import views
from rest_framework.response import Response
from accounts.permissions import IsTPO, IsStudent
from students.models import StudentProfile
from drives.models import PlacementDrive
from applications.models import DriveApplication
from django.db.models import Count, Q

class DashboardView(views.APIView):
    permission_classes = [IsTPO]

    def get(self, request, *args, **kwargs):
        total_students = StudentProfile.objects.count()
        placed_students = StudentProfile.objects.filter(is_placed=True).count()
        placement_percentage = (placed_students / total_students * 100) if total_students > 0 else 0
        active_drives = PlacementDrive.objects.filter(status__in=['ongoing', 'upcoming']).count()

        branch_stats = StudentProfile.objects.values('branch').annotate(
            total=Count('id'),
            placed=Count('id', filter=Q(is_placed=True))
        )
        
        branch_wise_stats = []
        for b in branch_stats:
            percentage = (b['placed'] / b['total'] * 100) if b['total'] > 0 else 0
            branch_wise_stats.append({
                "branch": b['branch'],
                "total": b['total'],
                "placed": b['placed'],
                "percentage": round(percentage, 2)
            })

        top_companies = PlacementDrive.objects.filter(status='completed').values('company__name').annotate(
            hired_count=Count('applications', filter=Q(applications__status='selected'))
        ).order_by('-hired_count')[:5]
        
        company_wise_stats = [
            {"company_name": c['company__name'] if c['company__name'] else "Unknown", "hired_count": c['hired_count']}
            for c in top_companies
        ]

        return Response({
            "total_students": total_students,
            "placed_students": placed_students,
            "placement_percentage": round(placement_percentage, 2),
            "active_drives": active_drives,
            "branch_wise_stats": branch_wise_stats,
            "company_wise_stats": company_wise_stats,
            "top_companies": company_wise_stats
        })

class StudentReadinessView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request, *args, **kwargs):
        company = request.query_params.get('company')
        if not company:
            return Response({"error": "Company parameter is required"}, status=400)
        
        score = getattr(request.user.student_profile, 'profile_score', 0)
        readiness_score = min(score + 10, 100)
        return Response({
            "company": company,
            "readiness_score": readiness_score,
            "verdict": "Ready" if readiness_score > 70 else "Needs Preparation"
        })
""",

    "analytics/urls.py": """from django.urls import path
from .views import DashboardView, StudentReadinessView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('readiness/', StudentReadinessView.as_view(), name='readiness'),
]
""",

    # ---------------- notifications ----------------
    "notifications/serializers.py": """from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
""",

    "notifications/views.py": """from rest_framework import generics, views
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.permissions import IsAuthenticated

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class MarkReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, id, *args, **kwargs):
        Notification.objects.filter(id=id, user=request.user).update(is_read=True)
        return Response({"message": "Marked as read"})

class UnreadCountView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})
""",

    "notifications/urls.py": """from django.urls import path
from .views import NotificationListView, MarkReadView, UnreadCountView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:id>/read/', MarkReadView.as_view(), name='notification-read'),
    path('unread-count/', UnreadCountView.as_view(), name='notification-unread-count'),
]
""",

    "notifications/utils.py": """from .models import Notification

def send_notification(user, title, message, type='general'):
    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=type
    )
    print(f"[NOTIFICATION] To {user.email}: {title} - {message}")
""",

    "notifications/signals.py": """from django.db.models.signals import post_save
from django.dispatch import receiver
from drives.models import PlacementDrive
from applications.models import DriveApplication
from students.models import StudentProfile
from .utils import send_notification

@receiver(post_save, sender=PlacementDrive)
def notify_new_drive(sender, instance, created, **kwargs):
    if created and instance.status == 'upcoming':
        students = StudentProfile.objects.filter(
            gpa__gte=instance.eligibility_gpa,
            backlogs__lte=instance.max_backlogs
        )
        for student in students:
            if not instance.eligible_branches or student.branch in instance.eligible_branches:
                send_notification(
                    user=student.user,
                    title=f"New Drive: {instance.company.name}",
                    message=f"{instance.company.name} is hiring for {instance.role_name}.",
                    type='drive_alert'
                )

@receiver(post_save, sender=DriveApplication)
def notify_application_update(sender, instance, created, **kwargs):
    if not created and instance.status == 'shortlisted':
        send_notification(
            user=instance.student.user,
            title="Application Shortlisted!",
            message=f"You have been shortlisted for {instance.drive.company.name}!",
            type='status_update'
        )
""",

    "notifications/apps.py": """from django.apps import AppConfig

class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'

    def ready(self):
        import notifications.signals
""",

    # ---------------- main urls & settings ----------------
    "campushire/urls.py": """from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/student/', include('students.urls')),
    path('api/drives/', include('drives.urls')),
    path('api/', include('applications.urls')),
    path('api/experiences/', include('experiences.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/notifications/', include('notifications.urls')),
]
"""
}

for filepath, content in files.items():
    full_path = os.path.join(BASE_DIR, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + chr(10))

settings_path = os.path.join(BASE_DIR, "campushire/settings.py")
with open(settings_path, 'r', encoding='utf-8') as f:
    settings_code = f.read()

if "EMAIL_BACKEND" not in settings_code:
    settings_code += chr(10) + "EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'" + chr(10)
    with open(settings_path, 'w', encoding='utf-8') as f:
        f.write(settings_code)

print("Generated all APIs successfully")
