from rest_framework import serializers
from django.contrib.auth import get_user_model
from students.models import StudentProfile
from companies.models import Company
from .models import TPOProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role', 'college_name')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'name', 'password', 'role', 'college_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data['role'],
            college_name=validated_data.get('college_name', '')
        )
        if user.role == 'student':
            StudentProfile.objects.create(user=user, usn=f"TEMP_{user.id}", branch="Unknown", semester=1, gpa=0.0)
        elif user.role == 'company':
            Company.objects.create(user=user, name=user.name)
        elif user.role == 'tpo':
            TPOProfile.objects.create(user=user)
        return user


# ─────────────────── TPO Profile ───────────────────
class TPOProfileSerializer(serializers.ModelSerializer):
    # Flatten User fields into the serializer
    name = serializers.CharField(source='user.name')
    email = serializers.EmailField(source='user.email', read_only=True)
    college_name = serializers.CharField(source='user.college_name', allow_blank=True, required=False)

    class Meta:
        model = TPOProfile
        fields = ('name', 'email', 'college_name', 'department', 'contact_number', 'college_website')

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        # Update User fields
        user = instance.user
        if 'name' in user_data:
            user.name = user_data['name']
        if 'college_name' in user_data:
            user.college_name = user_data['college_name']
        user.save()
        # Update TPOProfile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# ─────────────────── Company Profile ───────────────────
class CompanyProfileSerializer(serializers.ModelSerializer):
    # Readonly info from User
    login_email = serializers.EmailField(source='user.email', read_only=True)
    registered_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = Company
        fields = (
            'login_email', 'registered_name',
            'company_full_name', 'industry', 'headquarters',
            'website', 'about', 'employee_count',
        )

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
