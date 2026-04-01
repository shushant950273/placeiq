from django.urls import path
from .views import (
    ExperienceFeedView, PendingExperienceView,
    SubmitExperienceView, ApproveExperienceView,
    RejectExperienceView,
)

urlpatterns = [
    path('feed/',                ExperienceFeedView.as_view(),    name='exp-feed'),
    path('pending/',             PendingExperienceView.as_view(), name='exp-pending'),
    path('',                     SubmitExperienceView.as_view(),  name='exp-submit'),
    path('<int:id>/approve/',    ApproveExperienceView.as_view(), name='exp-approve'),
    path('<int:id>/reject/',     RejectExperienceView.as_view(),  name='exp-reject'),
]
