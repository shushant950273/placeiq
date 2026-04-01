from django.db.models.signals import post_save
from django.dispatch import receiver
from drives.models import PlacementDrive
from applications.models import DriveApplication, RoundResult
from students.models import StudentProfile
from .utils import send_notification

@receiver(post_save, sender=PlacementDrive)
def notify_new_drive(sender, instance, created, **kwargs):
    if created and instance.status == 'upcoming':
        students = StudentProfile.objects.filter(
            gpa__gte=instance.eligibility_gpa,
            backlogs__lte=instance.max_backlogs
        )
        for student in students:
            if not instance.eligible_branches or student.branch in instance.eligible_branches:
                send_notification(
                    user=student.user,
                    title=f"New Drive: {instance.company.name}",
                    message=f"{instance.company.name} is hiring for {instance.role_name}.",
                    type='drive_alert'
                )

@receiver(post_save, sender=DriveApplication)
def notify_application_update(sender, instance, created, **kwargs):
    if not created and instance.status == 'shortlisted':
        send_notification(
            user=instance.student.user,
            title="Application Shortlisted!",
            message=f"You have been shortlisted for {instance.drive.company.name}!",
            type='status_update'
        )

@receiver(post_save, sender=RoundResult)
def notify_round_result(sender, instance, created, **kwargs):
    if instance.status != 'pending':
        send_notification(
            user=instance.student.user,
            title=f"Result for {instance.round.get_round_name_display()} declared!",
            message=f"You have '{instance.get_status_display()}' the {instance.round.get_round_name_display()} round for {instance.round.drive.company.name}.",
            type='status_update'
        )
