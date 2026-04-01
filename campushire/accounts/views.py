from rest_framework import generics, permissions, views, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, TPOProfileSerializer, CompanyProfileSerializer
from .models import TPOProfile
from companies.models import Company
from accounts.permissions import IsTPO, IsCompany

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(email=response.data['email'])
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class UserMeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─── Change Password ──────────────────────────────────────────
class ChangePasswordView(views.APIView):
    """POST /api/auth/change-password/
    Body: { current_password, new_password, confirm_password }
    Available to all authenticated users (student, tpo, company).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        current_password  = request.data.get('current_password', '')
        new_password      = request.data.get('new_password', '')
        confirm_password  = request.data.get('confirm_password', '')

        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 6:
            return Response(
                {'error': 'New password must be at least 6 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {'error': 'New password and confirm password do not match.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password == current_password:
            return Response(
                {'error': 'New password must be different from the current password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully.'})


# ─── TPO Profile ──────────────────────────────────────────────
class TPOProfileView(views.APIView):
    permission_classes = [IsTPO]

    def _get_or_create_profile(self, user):
        profile, _ = TPOProfile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        profile = self._get_or_create_profile(request.user)
        serializer = TPOProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = self._get_or_create_profile(request.user)
        serializer = TPOProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Company Profile ──────────────────────────────────────────
class CompanyProfileView(views.APIView):
    permission_classes = [IsCompany]

    def _get_or_create_profile(self, user):
        profile, _ = Company.objects.get_or_create(user=user, defaults={'name': user.name})
        return profile

    def get(self, request):
        profile = self._get_or_create_profile(request.user)
        serializer = CompanyProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = self._get_or_create_profile(request.user)
        serializer = CompanyProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
