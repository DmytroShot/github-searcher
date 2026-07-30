from django.urls import path
from .views import RepoAnalyticsView, AIChatView

urlpatterns = [
    path('analytics/', RepoAnalyticsView.as_view(), name='ai-analytics'),
    path('chat/', AIChatView.as_view(), name='ai-chat'),
]