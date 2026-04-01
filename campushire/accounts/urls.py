from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserMeView, TPOProfileView, CompanyProfileView, ChangePasswordView

urlpatterns = [
    path('register/',         RegisterView.as_view(),       name='register'),
    path('login/',            TokenObtainPairView.as_view(), name='login'),
    path('refresh/',          TokenRefreshView.as_view(),    name='refresh'),
    path('me/',               UserMeView.as_view(),          name='me'),
    path('tpo/profile/',      TPOProfileView.as_view(),      name='tpo-profile'),
    path('company/profile/',  CompanyProfileView.as_view(),  name='company-profile'),
    path('change-password/',  ChangePasswordView.as_view(),  name='change-password'),
]
