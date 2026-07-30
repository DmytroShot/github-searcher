import requests
from django.conf import settings

GITHUB_SEARCH_URL = "https://api.github.com/search"
GITLAB_API_URL = "https://gitlab.com/api/v4"


class ExternalSearchService:
    @staticmethod
    def _fetch_github(search_type, query, page=1, per_page=12):
        endpoint = "users" if search_type == "users" else "repositories"
        url = f"{GITHUB_SEARCH_URL}/{endpoint}"
        headers = {"Accept": "application/vnd.github.v3+json"}
        params = {"q": query, "page": page, "per_page": per_page}

        try:
            res = requests.get(url, headers=headers, params=params, timeout=5)
            if res.status_code != 200:
                return {"items": [], "total": 0}

            json_data = res.json()
            raw_items = json_data.get("items", [])
            total = int(json_data.get("total_count", 0))
            items = []
            for item in raw_items:
                items.append({
                    "id": str(item["id"]),
                    "title": item.get("login") if search_type == "users" else item.get("name"),
                    "type": search_type,
                    "provider": "github",
                    "url": item["html_url"],
                    "avatar_url": item.get("avatar_url") or (item.get("owner", {}).get("avatar_url")),
                    # include star counts for repositories (GitHub uses `stargazers_count`)
                    "stargazers_count": item.get("stargazers_count", 0) if search_type != "users" else None,
                    "star_count": item.get("stargazers_count", 0) if search_type != "users" else None,
                    
                })
            return {"items": items, "total": total}
        except requests.RequestException:
            return {"items": [], "total": 0}

    @staticmethod
    def _fetch_gitlab(search_type, query, page=1, per_page=12):
        endpoint = "users" if search_type == "users" else "projects"
        url = f"{GITLAB_API_URL}/{endpoint}"

        headers = {"User-Agent": "Django-App"}
        gitlab_token = getattr(settings, "GITLAB_TOKEN", None)
        if gitlab_token:
            headers["Authorization"] = f"Bearer {gitlab_token}"
            headers["PRIVATE-TOKEN"] = gitlab_token
        params = {"search": query, "page": page, "per_page": per_page}

        try:
            res = requests.get(url, headers=headers, params=params, timeout=5)
            if res.status_code != 200:
                return {"items": [], "total": 0}

            raw_items = res.json()
            if not isinstance(raw_items, list):
                return {"items": [], "total": 0}

            total_header = res.headers.get("X-Total") or res.headers.get("x-total")
            total = int(total_header) if total_header and total_header.isdigit() else len(raw_items)

            items = []
            for item in raw_items:
                is_user = endpoint == "users"
                items.append({
                    "id": str(item["id"]),
                    "title": item.get("username") if is_user else item.get("name"),
                    "type": search_type,
                    "provider": "gitlab",
                    "url": item.get("web_url"),
                    "avatar_url": item.get("avatar_url"),
                    # GitLab projects expose `star_count`
                    "star_count": item.get("star_count", 0) if not is_user else None,
                    "stargazers_count": item.get("star_count", 0) if not is_user else None,
                })
            return {"items": items, "total": total}
        except requests.RequestException:
            return {"items": [], "total": 0}

    @classmethod
    def search(cls, search_type, query, provider="all", page=1, per_page=10):
        total = 0
        items = []

        if provider in ["github", "all"]:
            github_data = cls._fetch_github(search_type, query, page, per_page)
            items.extend(github_data["items"])
            total += github_data["total"]

        if provider in ["gitlab", "all"]:
            gitlab_data = cls._fetch_gitlab(search_type, query, page, per_page)
            items.extend(gitlab_data["items"])
            total += gitlab_data["total"]

        return {
            "total": total,
            "page": page,
            "per_page": per_page,
            "items": items,
        }