from .models import Notification

def send_notification(user, title, message, type='general'):
    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=type
    )
    print(f"[NOTIFICATION] To {user.email}: {title} - {message}")
