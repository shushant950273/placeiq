from rest_framework import viewsets, generics, permissions, exceptions, views, status
from rest_framework.response import Response
from django.db.models import Exists, OuterRef
from .models import PlacementDrive
from .serializers import DriveSerializer
from accounts.permissions import IsTPO, IsStudent, IsCompany


class DriveViewSet(viewsets.ModelViewSet):
    serializer_class = DriveSerializer

    def get_permissions(self):
        # Only TPO can create/edit/delete drives
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsTPO()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'tpo':
            serializer.save(college_name=user.college_name)
        else:
            raise exceptions.PermissionDenied("Only TPOs can create drives.")

    def get_queryset(self):
        user = self.request.user
        qs = PlacementDrive.objects.all().order_by('-created_at')

        if user.role == 'tpo':
            return qs.filter(college_name=user.college_name)

        elif user.role == 'company':
            company_name = getattr(user, 'name', '').strip()
            if company_name:
                return qs.filter(company__name__iexact=company_name)
            return qs.none()

        elif user.role == 'student':
            profile = getattr(user, 'student_profile', None)
            from applications.models import DriveApplication
            if profile:
                qs = qs.annotate(
                    is_applied=Exists(
                        DriveApplication.objects.filter(drive=OuterRef('pk'), student=profile)
                    )
                )

            # Drive detail page — always accessible
            if self.action == 'retrieve':
                return qs

            if profile:
                qs = qs.filter(
                    eligibility_gpa__lte=profile.gpa,
                    max_backlogs__gte=profile.backlogs,
                    status__in=['upcoming', 'ongoing']
                )

            return qs

        return qs


class DriveStatusUpdateView(views.APIView):
    """PATCH /api/drives/<id>/status/ — TPO only, update drive status field."""
    permission_classes = [IsTPO]

    def patch(self, request, id, *args, **kwargs):
        try:
            drive = PlacementDrive.objects.get(id=id, college_name=request.user.college_name)
        except PlacementDrive.DoesNotExist:
            return Response({'error': 'Drive not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid_statuses = ['upcoming', 'ongoing', 'completed']
        if new_status not in valid_statuses:
            return Response(
                {'error': f"Invalid status. Choose from: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        drive.status = new_status
        drive.save(update_fields=['status'])
        return Response({'message': f"Drive status updated to '{new_status}'.", 'status': new_status})


class UpcomingDrivesView(generics.ListAPIView):
    serializer_class = DriveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PlacementDrive.objects.filter(status='upcoming').order_by('drive_date')
