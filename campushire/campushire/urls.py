from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/student/', include('students.urls')),
    path('api/drives/', include('drives.urls')),
    path('api/', include('applications.urls')),
    path('api/experiences/', include('experiences.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/notifications/', include('notifications.urls')),
]
