import csv
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, status, views
from rest_framework.response import Response
from accounts.permissions import IsStudent, IsTPO
from .models import StudentProfile
from .serializers import StudentProfileSerializer

User = get_user_model()


class StudentListView(generics.ListAPIView):
    """GET /api/student/list/ — TPO only. Returns all students with optional ?search= filter."""
    serializer_class = StudentProfileSerializer
    permission_classes = [IsTPO]

    def get_queryset(self):
        qs = StudentProfile.objects.filter(user__college_name=self.request.user.college_name).select_related('user').order_by('user__name')
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(user__name__icontains=search) | Q(usn__icontains=search)
            )
        return qs


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

from django.shortcuts import get_object_or_404
from drives.models import PlacementDrive

class ReadinessScoreView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request, drive_id, *args, **kwargs):
        profile = request.user.student_profile
        drive = get_object_or_404(PlacementDrive, id=drive_id)
        
        score = 0
        suggestions = []

        # 1. GPA (30%)
        if float(profile.gpa) >= float(drive.eligibility_gpa):
            score += 30
        else:
            diff = float(drive.eligibility_gpa) - float(profile.gpa)
            if diff <= 0.5:
                score += 15
                suggestions.append(f"Improve your GPA by {diff:.2f} to meet the drive average for a 15% boost.")
            else:
                score += 0
                suggestions.append(f"Your GPA is significantly below the required {drive.eligibility_gpa}. Focus heavily on projects and skill-building.")

        # 2. Skills Match (25%)
        role_keywords = set(drive.role_name.lower().replace(',', ' ').split())
        profile_skills = [s.lower() for s in (profile.skills or [])]
        if len(profile_skills) >= 3:
            score += 25
        elif len(profile_skills) > 0:
            score += 15
            suggestions.append(f"Add more skills specifically mentioned in the {drive.role_name} job description to boost readiness by 10%.")
        else:
            suggestions.append(f"Add your technical skills tailored to the {drive.role_name} role for a 25% readiness boost.")

        # 3. Certifications (20%)
        if len(profile.certifications or []) >= 1:
            score += 20
        else:
            suggestions.append(f"Add a certification relevant to {drive.role_name} to improve readiness by 20%.")

        # 4. Projects Alignment (15%) - Proxy via Github URL
        if profile.github_url:
            score += 15
        else:
            suggestions.append("Add your GitHub or Portfolio link to showcase your projects for a 15% boost.")

        # 5. Communication/Completeness (10%)
        if profile.linkedin_url and profile.resume_url:
            score += 10
        elif profile.resume_url:
            score += 5
            suggestions.append("Update your LinkedIn profile URL to prove communication readiness (5% boost).")
        else:
            suggestions.append("Upload your latest Resume and LinkedIn to complete your professional profile (10% boost).")

        return Response({
            "score": score,
            "message": f"You are {score}% ready for the {drive.company.name} {drive.role_name} role.",
            "suggestions": suggestions
        })
