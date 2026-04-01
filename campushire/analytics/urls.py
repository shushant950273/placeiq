from django.urls import path
from .views import DashboardView, StudentReadinessView, NAACReportView, CompanyDashboardView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('company-dashboard/', CompanyDashboardView.as_view(), name='company-dashboard'),
    path('readiness/', StudentReadinessView.as_view(), name='readiness'),
    path('naac-report/', NAACReportView.as_view(), name='naac-report'),
]
