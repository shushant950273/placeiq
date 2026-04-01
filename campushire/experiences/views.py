from rest_framework import generics, views, status
from rest_framework.response import Response
from .models import InterviewExperience
from .serializers import InterviewExperienceSerializer
from accounts.permissions import IsStudent, IsTPO
from applications.models import DriveApplication


class ExperienceFeedView(generics.ListAPIView):
    serializer_class = InterviewExperienceSerializer

    def get_queryset(self):
        qs = InterviewExperience.objects.filter(is_approved=True).order_by('-created_at')
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
        return InterviewExperience.objects.filter(
            is_approved=False,
            student__user__college_name=self.request.user.college_name
        ).order_by('-created_at')


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
        try:
            exp = InterviewExperience.objects.get(id=id, student__user__college_name=request.user.college_name)
        except InterviewExperience.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        exp.is_approved = True
        exp.save(update_fields=['is_approved'])
        return Response({'message': 'Approved and published.'})


class RejectExperienceView(views.APIView):
    """DELETE /api/experiences/:id/reject/ — TPO permanently removes a pending experience."""
    permission_classes = [IsTPO]

    def delete(self, request, id, *args, **kwargs):
        deleted_count, _ = InterviewExperience.objects.filter(id=id, student__user__college_name=request.user.college_name, is_approved=False).delete()
        if deleted_count == 0:
            return Response({'error': 'Experience not found or already approved.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Experience rejected and deleted.'}, status=status.HTTP_204_NO_CONTENT)
