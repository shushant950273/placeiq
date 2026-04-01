from rest_framework import generics, views
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.permissions import IsAuthenticated

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class MarkReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, id, *args, **kwargs):
        Notification.objects.filter(id=id, user=request.user).update(is_read=True)
        return Response({"message": "Marked as read"})

class UnreadCountView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})
