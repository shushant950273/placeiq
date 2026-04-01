from django.urls import path
from .views import (
    StudentProfileView, TPOBulkUploadView, ProfileScoreView,
    ReadinessScoreView, StudentListView
)

urlpatterns = [
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
    path('profile-score/', ProfileScoreView.as_view(), name='profile-score'),
    path('list/', StudentListView.as_view(), name='student-list'),
    path('bulk-upload/', TPOBulkUploadView.as_view(), name='bulk-upload'),
    path('readiness/<int:drive_id>/', ReadinessScoreView.as_view(), name='readiness-score'),
]
