from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DriveViewSet, UpcomingDrivesView, DriveStatusUpdateView

router = DefaultRouter()
router.register(r'', DriveViewSet, basename='drive')

urlpatterns = [
    path('upcoming/', UpcomingDrivesView.as_view(), name='upcoming-drives'),
    path('<int:id>/status/', DriveStatusUpdateView.as_view(), name='drive-status-update'),
    path('', include(router.urls)),
]
