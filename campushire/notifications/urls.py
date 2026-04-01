from django.urls import path
from .views import NotificationListView, MarkReadView, UnreadCountView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:id>/read/', MarkReadView.as_view(), name='notification-read'),
    path('unread-count/', UnreadCountView.as_view(), name='notification-unread-count'),
]
