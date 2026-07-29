# Frontend Documentation

This directory contains the React + Vite frontend for GitHub Searcher.

## What it does

- Provides a search interface for GitHub users and repositories
- Uses debounced input to avoid excessive requests
- Displays live results in a responsive card layout
- Uses local in-memory cache for repeated queries

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open the app at:

```text
http://127.0.0.1:5173
```

## Backend dependency

The frontend fetches data from the backend API at:

```text
http://127.0.0.1:8000/api/search
```

Make sure the backend server is running before using the UI.

## Search behavior

- Minimum search length: 3 characters
- Search types: `users`, `repositories`
- Network request sent after 500ms of inactivity

## Build

```bash
npm run build
```

## Linting

```bash
npm run lint
```
