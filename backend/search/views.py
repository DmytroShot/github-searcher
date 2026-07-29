from django.shortcuts import render

# Create your views here.
import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiTypes, extend_schema

GITHUB_SEARCH_URL = "https://api.github.com/search"

from .serializers import (
    SearchQuerySerializer,
    SearchResponseSerializer,
    ErrorResponseSerializer,
)

class SearchAPIView(APIView):
    serializer_class = SearchQuerySerializer

    @extend_schema(
        summary="Search GitHub users or repositories",
        description="Search the GitHub Search API for users or repositories. Use query parameters `text` and `type`.",
        parameters=[SearchQuerySerializer],
        responses={
            200: SearchResponseSerializer,
            400: ErrorResponseSerializer,
            503: ErrorResponseSerializer,
        },
    )
    def get(self, request):
        serializer = self.serializer_class(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        search_type = serializer.validated_data["type"]
        query = serializer.validated_data["text"]
        clean_query = str(query).strip().lower()

        cache_key = f"github_search:{search_type}:{clean_query}"
        cached_data = cache.get(cache_key)

        if cached_data is not None:
            return Response(
                {"data": cached_data, "source": "cache"},
                status=status.HTTP_200_OK,
            )

        url = f"{GITHUB_SEARCH_URL}/{search_type}?q={clean_query}"
        headers = {
            "Accept": "application/vnd.github.v3+json",
        }

        try:
            response = requests.get(url, headers=headers, timeout=5)

            if response.status_code != 200:
                return Response(
                    {
                        "error": "Failed to fetch data from GitHub API",
                        "details": response.json() if response.content else response.text,
                    },
                    status=response.status_code,
                )

            data = response.json()

            ttl = getattr(settings, "CACHE_TTL", 7200)
            cache.set(cache_key, data, timeout=ttl)

            return Response(
                {"data": data, "source": "network"},
                status=status.HTTP_200_OK,
            )

        except requests.exceptions.RequestException as e:
            return Response(
                {"error": "Connection error to GitHub API", "details": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class ClearCacheAPIView(APIView):
    @extend_schema(
        summary="Clear cached GitHub search results",
        description="Deletes all cached search responses from Redis.",
        responses={200: OpenApiTypes.OBJECT},
    )
    def post(self, request):
        cache.clear()
        return Response(
            {"message": "Cache successfully cleared."},
            status=status.HTTP_200_OK,
        )
