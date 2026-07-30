from rest_framework import serializers

class RepoAnalyticsRequestSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    type = serializers.ChoiceField(choices=["users", "repositories"])
    provider = serializers.ChoiceField(choices=["github", "gitlab"])
    url = serializers.URLField()
    avatar_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    stargazers_count = serializers.IntegerField(required=False, allow_null=True)
    star_count = serializers.IntegerField(required=False, allow_null=True)
    language = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    forks_count = serializers.IntegerField(required=False)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class AIChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField()
    history = serializers.ListField(child=serializers.DictField(), required=False, default=[])

class AIChatResponseSerializer(serializers.Serializer):
    reply = serializers.CharField(
        help_text="Відповідь від Groq AI помічника"
    )