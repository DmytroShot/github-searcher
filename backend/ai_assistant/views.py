from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .serializers import AIChatResponseSerializer, RepoAnalyticsRequestSerializer, AIChatRequestSerializer
from .services import analyze_item_with_grok, ask_grok_chat
from rest_framework import status

class RepoAnalyticsView(APIView):
    @extend_schema(request=RepoAnalyticsRequestSerializer)
    def post(self, request):
        serializer = RepoAnalyticsRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        repo_data = serializer.validated_data
        analysis = analyze_item_with_grok(repo_data)
        return Response({"analysis": analysis})

# class AIChatView(APIView):
#     @extend_schema(request=AIChatRequestSerializer)
#     def post(self, request):
#         serializer = AIChatRequestSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         message = serializer.validated_data.get("message")
#         history = serializer.validated_data.get("history", [])
        
#         reply = ask_grok_chat(message, history)
#         return Response({"reply": reply})

class AIChatView(APIView):
    @extend_schema(
        request=AIChatRequestSerializer,
        responses={200: AIChatResponseSerializer},  # або {200: inline_serializer(...)}
        description="Загальний чат з AI-помічником Groq (Llama 3.3 70B) з підтримкою історії",
    )
    def post(self, request):
        serializer = AIChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.validated_data.get("message")
        history = serializer.validated_data.get("history", [])

        try:
            reply = ask_grok_chat(message, history)
            return Response({"reply": reply}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Помилка при виконанні запиту до AI: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )