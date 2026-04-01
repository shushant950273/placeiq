from django.urls import path
from .views import ApplyDriveView, StudentApplicationsView, DriveApplicantsView, TPOShortlistView, DeclareRoundResultView, StudentPipelineView

urlpatterns = [
    path('student/applications/', StudentApplicationsView.as_view(), name='student-applications'),
    path('student/pipeline/', StudentPipelineView.as_view(), name='student-pipeline'),
    path('drives/<int:id>/apply/', ApplyDriveView.as_view(), name='apply-drive'),
    path('drives/<int:id>/applicants/', DriveApplicantsView.as_view(), name='drive-applicants'),
    path('drives/<int:id>/shortlist/', TPOShortlistView.as_view(), name='tpo-shortlist'),
    path('rounds/<int:id>/result/', DeclareRoundResultView.as_view(), name='round-result'),
]
