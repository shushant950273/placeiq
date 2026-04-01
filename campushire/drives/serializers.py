from rest_framework import serializers
from .models import PlacementDrive
from companies.models import Company


class DriveSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    is_applied = serializers.BooleanField(read_only=True, default=False)
    applicants_count = serializers.SerializerMethodField()
    hired_count = serializers.SerializerMethodField()

    # Write-only field: TPO types the company name, backend resolves the FK
    company_name_input = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = PlacementDrive
        fields = '__all__'
        extra_kwargs = {
            'company': {'required': False},
        }

    def get_applicants_count(self, obj):
        return obj.applications.count()

    def get_hired_count(self, obj):
        return obj.applications.filter(status='selected').count()

    def create(self, validated_data):
        company_name_input = validated_data.pop('company_name_input', None)
        if company_name_input:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            company_user = User.objects.filter(role='company', name__iexact=company_name_input).first()
            if company_user:
                company_obj, _ = Company.objects.get_or_create(
                    user=company_user,
                    defaults={'name': company_user.name}
                )
                validated_data['company'] = company_obj
            else:
                # Fallback: match by existing Company record name
                dummy_company = Company.objects.filter(name__iexact=company_name_input).first()
                if not dummy_company:
                    raise serializers.ValidationError(
                        f"No company account found with the name '{company_name_input}'. "
                        "Ensure the company has a registered account first."
                    )
                validated_data['company'] = dummy_company

        if 'company' not in validated_data:
            raise serializers.ValidationError("Company name is required to create a drive.")

        return super().create(validated_data)
