import { create } from "zustand";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function buildPayload(kind, item) {
  if (kind === "repo") {
    return {
      id: item.id || "",
      title: item.title || item.name || "Untitled repository",
      type: item.type || "repositories",
      provider: item.provider || "github",
      url: item.html_url || item.url || "",
      avatar_url: item.avatar_url || "",
      stargazers_count: item.stargazers_count ?? item.star_count ?? 0,
      star_count: item.stargazers_count ?? item.star_count ?? 0,
      language: item.language || "Н/Д",
      forks_count: item.forks_count ?? item.fork_count ?? 0,
      description: item.description || item.tagline || "",
    };
  }

  return {
    id: item.id || "",
    title: item.login || item.title || item.name || "Unknown user",
    type: "users",
    provider: item.provider || "github",
    url: item.html_url || item.url || "",
    avatar_url: item.avatar_url || "",
    stargazers_count: item.stargazers_count ?? item.star_count ?? null,
    star_count: item.stargazers_count ?? item.star_count ?? null,
    language: item.language || null,
    forks_count: item.forks_count ?? item.fork_count ?? 0,
    description: item.description || item.bio || "",
  };
}

export const useAnalyticsStore = create((set) => ({
  loading: false,
  error: null,
  data: null,

  fetchAnalytics: async (kind, item) => {
    set({ loading: true, error: null, data: null });

    try {
      const payload = buildPayload(kind, item);
      const response = await fetch(`${BACKEND_BASE_URL}/api/ai/analytics/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch analytics");
      }

      set({ data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  reset: () => set({ loading: false, error: null, data: null }),
}));
