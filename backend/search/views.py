from django.conf import settings
from django.core.cache import cache
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiTypes, extend_schema

from .models import SavedItem
from .serializers import (
    SearchQuerySerializer,
    SearchResponseSerializer,
    ErrorResponseSerializer,
    SavedItemSerializer,
)
from .services import ExternalSearchService


class SearchAPIView(APIView):
    serializer_class = SearchQuerySerializer

    @extend_schema(
        summary="Search users or repositories across providers",
        parameters=[SearchQuerySerializer],
        responses={200: SearchResponseSerializer, 400: ErrorResponseSerializer},
    )
    def get(self, request):
        serializer = self.serializer_class(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        search_type = serializer.validated_data["type"]
        query = str(serializer.validated_data["text"]).strip().lower()
        provider = serializer.validated_data.get("provider", "all")
        page = serializer.validated_data.get("page", 1)
        per_page = serializer.validated_data.get("per_page", 12)

        # Кеш включає всі параметри пошуку
        cache_key = f"search:{provider}:{search_type}:{query}:p{page}:s{per_page}"
        cached_data = cache.get(cache_key)

        if cached_data is not None:
            return Response(
                {"data": cached_data, "source": "cache"},
                status=status.HTTP_200_OK,
            )

        # Викликаємо сервіс замість написання requests тут
        data = ExternalSearchService.search(
            search_type=search_type,
            query=query,
            provider=provider,
            page=page,
            per_page=per_page,
        )

        ttl = getattr(settings, "CACHE_TTL", 7200)
        cache.set(cache_key, data, timeout=ttl)

        return Response(
            {"data": data, "source": "network"},
            status=status.HTTP_200_OK,
        )


class SavedItemViewSet(viewsets.ModelViewSet):
    """
    GET /api/saved/          -> отримати всі збережені
    POST /api/saved/         -> додати в збережені
    DELETE /api/saved/{id}/  -> видалити зі збережених
    """
    queryset = SavedItem.objects.all().order_by('-created_at')
    serializer_class = SavedItemSerializer


class ClearCacheAPIView(APIView):
    @extend_schema(
        summary="Clear search cache",
        responses={200: OpenApiTypes.OBJECT},
    )
    def post(self, request):
        cache.clear()
        return Response({"message": "Cache successfully cleared."}, status=status.HTTP_200_OK)