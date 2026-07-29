from django.urls import path
from .views import SearchAPIView, ClearCacheAPIView

urlpatterns = [
    path('search', SearchAPIView.as_view(), name='search'),
    path('clear-cache', ClearCacheAPIView.as_view(), name='clear-cache'),
]