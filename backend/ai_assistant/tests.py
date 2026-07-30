from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


class RepoAnalyticsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('ai-analytics')
        self.payload = {
            "id": "27778839",
            "title": "AnomalyDetection",
            "type": "repositories",
            "provider": "github",
            "url": "https://github.com/twitter/AnomalyDetection",
            "avatar_url": "https://avatars.githubusercontent.com/u/50278?v=4",
            "stargazers_count": 3606,
            "star_count": 3606,
        }

    def test_repo_analytics_accepts_flat_payload(self):
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('analysis', response.data)
