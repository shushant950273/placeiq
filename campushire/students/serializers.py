from rest_framework import serializers
from .models import StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name')
    email = serializers.EmailField(source='user.email', read_only=True)
    college_name = serializers.CharField(source='user.college_name')

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'name', 'email', 'college_name', 
            'usn', 'branch', 'semester', 'gpa', 'backlogs',
            'skills', 'certifications', 'resume_url', 'linkedin_url', 'github_url',
            'profile_score', 'is_placed'
        ]
        read_only_fields = ('id', 'user', 'profile_score', 'is_placed')

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        
        # Update user fields
        if user_data:
            user = instance.user
            user.name = user_data.get('name', user.name)
            user.college_name = user_data.get('college_name', user.college_name)
            user.save()
            
        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance
