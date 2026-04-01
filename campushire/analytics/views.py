from rest_framework import views, permissions as drf_permissions
from rest_framework.response import Response
from rest_framework import status as drf_status
from accounts.permissions import IsTPO, IsStudent
from students.models import StudentProfile
from drives.models import PlacementDrive
from applications.models import DriveApplication
from django.db.models import Count, Q, Avg
from django.db.models.functions import TruncMonth
import io
from django.http import FileResponse


class DashboardView(views.APIView):
    permission_classes = [IsTPO]

    def get(self, request, *args, **kwargs):
        college = request.user.college_name
        total_students = StudentProfile.objects.filter(user__college_name=college).count()
        placed_students = StudentProfile.objects.filter(user__college_name=college, is_placed=True).count()
        placement_percentage = (placed_students / total_students * 100) if total_students > 0 else 0
        active_drives = PlacementDrive.objects.filter(college_name=college, status__in=['ongoing', 'upcoming']).count()

        branch_stats = StudentProfile.objects.filter(user__college_name=college).values('branch').annotate(
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

        top_companies = PlacementDrive.objects.filter(college_name=college, status='completed').values('company__name').annotate(
            hired_count=Count('applications', filter=Q(applications__status='selected'))
        ).order_by('-hired_count')[:5]

        company_wise_stats = [
            {"company_name": c['company__name'] if c['company__name'] else "Unknown", "hired_count": c['hired_count']}
            for c in top_companies
        ]

        # Average CTC
        avg_ctc_dict = PlacementDrive.objects.filter(college_name=college, status='completed').aggregate(Avg('ctc'))
        average_ctc = round(avg_ctc_dict['ctc__avg'] or 0, 2)

        return Response({
            "total_students": total_students,
            "placed_students": placed_students,
            "placement_percentage": round(placement_percentage, 2),
            "active_drives": active_drives,
            "average_ctc": average_ctc,
            "branch_wise_stats": branch_wise_stats,
            "top_companies": company_wise_stats,
            "month_wise_stats": []
        })


class CompanyDashboardView(views.APIView):
    """GET /api/analytics/company-dashboard/
    Returns per-company stats: total drives, applicants, and hired (status='selected') count.
    FIX 3: Hired count = DriveApplication where drive.company matches logged-in company
            AND application.status = 'selected'
    """
    permission_classes = [drf_permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'company':
            return Response({'detail': 'Company access only.'}, status=drf_status.HTTP_403_FORBIDDEN)

        company_name = getattr(user, 'name', '').strip()

        total_drives = PlacementDrive.objects.filter(
            company__name__iexact=company_name
        ).count()

        total_applicants = DriveApplication.objects.filter(
            drive__company__name__iexact=company_name
        ).count()

        # FIX 3: Count only 'selected' applications for this company's drives
        total_hired = DriveApplication.objects.filter(
            drive__company__name__iexact=company_name,
            status='selected'
        ).count()

        return Response({
            "total_drives": total_drives,
            "total_applicants": total_applicants,
            "total_hired": total_hired,
        })


class NAACReportView(views.APIView):
    permission_classes = [IsTPO]

    def get(self, request, *args, **kwargs):
        # Lazy import so server starts even if reportlab is not installed
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet
        except ImportError:
            return Response(
                {"error": "PDF generation library (reportlab) is not installed. Please run: pip install reportlab"},
                status=drf_status.HTTP_503_SERVICE_UNAVAILABLE
            )

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph("College NAAC Placement Report", styles['Title']))
        elements.append(Spacer(1, 12))

        # Basic Stats
        college = request.user.college_name
        total_st = StudentProfile.objects.filter(user__college_name=college).count()
        placed_st = StudentProfile.objects.filter(user__college_name=college, is_placed=True).count()
        placement_pct = (placed_st / total_st * 100) if total_st > 0 else 0
        avg_ctc = PlacementDrive.objects.filter(college_name=college, status='completed').aggregate(Avg('ctc'))['ctc__avg'] or 0

        elements.append(Paragraph(f"Total Students: {total_st}", styles['Normal']))
        elements.append(Paragraph(f"Total Placed: {placed_st}", styles['Normal']))
        elements.append(Paragraph(f"Placement Percentage: {placement_pct:.2f}%", styles['Normal']))
        elements.append(Paragraph(f"Average CTC Offered: {avg_ctc:.2f} LPA", styles['Normal']))
        elements.append(Spacer(1, 24))

        # Branch Data Table
        elements.append(Paragraph("Placement Summary (Branch-wise)", styles['Heading2']))
        branch_stats = StudentProfile.objects.filter(user__college_name=college).values('branch').annotate(
            total=Count('id'), placed=Count('id', filter=Q(is_placed=True))
        )
        data = [["Branch", "Total Students", "Placed Students", "Placement %"]]
        for b in branch_stats:
            pct = (b['placed'] / b['total'] * 100) if b['total'] > 0 else 0
            data.append([b['branch'], str(b['total']), str(b['placed']), f"{pct:.2f}%"])

        t = Table(data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(t)

        doc.build(elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename='NAAC_Placement_Report.pdf')


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

# Reload Django Server
