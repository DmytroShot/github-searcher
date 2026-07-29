# GitHub Searcher

GitHub Searcher is a small full-stack app that lets you search GitHub users and repositories.

The project combines:

- **React + Vite** frontend in `frontend/`
- **Django REST Framework** backend in `backend/`
- **Redis caching** via `docker-compose.yml`

## Features

- Search GitHub users or repositories
- Minimum query length: 3 characters
- Response caching using Redis
- API documentation available via Swagger

## Quick start

### 1. Start Redis

Use Docker Compose to run Redis:

```bash
cd /Users/eqtech/Desktop/github-searcher
docker compose up -d redis
```

### 2. Start the backend

```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver
```

Then open the backend docs at:

```text
http://127.0.0.1:8000/api/docs/
```

The Swagger UI there allows interactive testing of requests and response examples.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the app at:

```text
http://127.0.0.1:5173
```

## Backend API

### Search endpoint

`GET /api/search?text=<query>&type=<type>&provider=<provider>`

Query parameters:

- `text` — search term, must be at least 3 characters
- `type` — one of `users`, `repositories`
- `provider` — one of `github`, `gitlab`, `all` (default: `all`)

Example:

```bash
curl "http://127.0.0.1:8000/api/search?text=react&type=users&provider=gitlab"
```

Note: GitLab user search may require a personal access token. Without `GITLAB_TOKEN`, GitLab user results can be empty or return no data.

### Clear cache

`POST /api/clear-cache`

This endpoint clears Redis cache for all search results.

### API docs

`GET /api/docs/` — Swagger UI

`GET /api/schema/` — OpenAPI schema JSON

## Project structure

- `backend/` — Django project and REST API
- `frontend/` — React app built with Vite
- `docker-compose.yml` — Redis service for caching

## Notes

- Backend uses GitHub Search API with unauthenticated requests. Rate limits apply.
- GitLab repository search works without auth, but GitLab user search may require `GITLAB_TOKEN`.
- Add `GITLAB_TOKEN` in `backend/core/settings.py` from environment to enable authenticated GitLab requests.
- Cache TTL is configured in `backend/core/settings.py` as `CACHE_TTL`.
- Frontend uses `http://127.0.0.1:8000/api/search` for backend calls.

If you want, I can also add a `requirements.txt` for the backend and a `package-lock.json` version note for the frontend.
