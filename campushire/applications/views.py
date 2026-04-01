from rest_framework import views, generics, status, permissions
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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        drive_id = self.kwargs.get('id')
        user = self.request.user

        if user.role == 'tpo':
            return DriveApplication.objects.filter(drive_id=drive_id).select_related('student__user')

        elif user.role == 'company':
            # Company can only see applicants for their own drives
            company_name = getattr(user, 'name', '').strip()
            return DriveApplication.objects.filter(
                drive_id=drive_id,
                drive__company__name__iexact=company_name
            ).select_related('student__user')

        return DriveApplication.objects.none()

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
                "drive_id": app.drive.id,
                "drive_name": app.drive.role_name,
                "company": app.drive.company.name,
                "application_status": app.status,
                "stages": stages
            })
        return Response(data)
