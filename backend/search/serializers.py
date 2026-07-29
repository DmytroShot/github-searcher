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

class SearchResponseSerializer(serializers.Serializer):
    data = serializers.DictField(
        help_text="Raw payload returned from GitHub API"
    )
    source = serializers.ChoiceField(
        choices=["cache", "network"],
        help_text="Source of the data: 'cache' (Redis) or 'network' (GitHub API)"
    )

class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField()
    details = serializers.DictField(required=False, help_text="Additional error context if available")