from django.urls import include, path
from .views import SavedItemViewSet, SearchAPIView, ClearCacheAPIView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'saved', SavedItemViewSet, basename='saved-items')

urlpatterns = [
    path('search/', SearchAPIView.as_view(), name='search'),
    path('clear-cache/', ClearCacheAPIView.as_view(), name='clear-cache'),
    path('', include(router.urls)),
]