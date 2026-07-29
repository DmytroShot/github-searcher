from unittest.mock import patch
from django.urls import reverse
from django.core.cache import cache
from rest_framework.test import APITestCase
from rest_framework import status


class SearchAPITests(APITestCase):
    def setUp(self):
        cache.clear()
        self.search_url = reverse('search')
        self.clear_cache_url = reverse('clear-cache')

    def test_search_validation_short_query(self):
        """Перевірка помилки, якщо текст пошуку менше 3 символів"""
        response = self.client.get(self.search_url, {"type": "users", "text": "ab"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("text", response.data)
        self.assertEqual(
            response.data["text"][0].code,
            "min_length",
        )

    def test_search_validation_invalid_type(self):
        """Перевірка помилки для некоректного типу entities"""
        response = self.client.get(self.search_url, {"type": "invalid_type", "text": "django"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("type", response.data)

    @patch('requests.get')
    def test_search_caching_behavior(self, mock_get):
        """Перевірка кешування в Redis: 1-й запит з мережі, 2-й запит з кешу"""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"items": [{"id": 1, "login": "octocat"}]}

        res1 = self.client.get(self.search_url, {"type": "users", "text": "octocat"})
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(res1.data["source"], "network")
        self.assertEqual(mock_get.call_count, 1)

        res2 = self.client.get(self.search_url, {"type": "users", "text": "octocat"})
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data["source"], "cache")

        self.assertEqual(mock_get.call_count, 1)

    def test_clear_cache_endpoint(self):
        """Перевірка очищення кешу"""
        cache.set("github_search:users:test", {"items": []})
        response = self.client.post(self.clear_cache_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(cache.get("github_search:users:test"))