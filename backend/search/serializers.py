from .models import SavedItem
from rest_framework import serializers

class SearchQuerySerializer(serializers.Serializer):
    text = serializers.CharField(
        min_length=3,
        help_text="Search text (at least 3 characters long)"
    )
    type = serializers.ChoiceField(
        choices=["users", "repositories"],
        help_text="Type of GitHub entity to search for"
    )
    provider = serializers.ChoiceField(
        choices=["github", "gitlab", "all"],
        default="all",
        help_text="Provider to search in"
    )
    page = serializers.IntegerField(
        default=1,
        min_value=1,
        required=False,
        help_text="Page number for pagination",
    )
    per_page = serializers.IntegerField(
        default=12,
        min_value=1,
        max_value=100,
        required=False,
        help_text="Number of items per page",
    )

class SearchResponseSerializer(serializers.Serializer):
    data = serializers.DictField(
        help_text="Raw payload returned from GitHub API"
    )
    source = serializers.ChoiceField(
        choices=["cache", "network"],
        help_text="Source of the data: 'cache' (Redis) or 'network' (GitHub API)"
    )

class SavedItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedItem
        fields = [
            'id',
            'item_id',
            'item_type',
            'provider',
            'title',
            'url',
            'avatar_url',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField()
    details = serializers.DictField(required=False, help_text="Additional error context if available")