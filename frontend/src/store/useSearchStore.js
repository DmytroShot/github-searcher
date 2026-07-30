import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import debounce from "lodash.debounce";

export const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
export const MIN_CHARS = 3;
export const PER_PAGE = 12;

const requestCache = new Map();
let fetchToken = 0;

export function getItemKey(item) {
  const itemType = item.type === "users" ? "user" : "repo";
  return `${item.provider}:${itemType}:${item.id}`;
}

async function runSearch(searchText, searchType, searchProvider, searchPage) {
  const key = `${searchProvider}:${searchType}:${searchText.toLowerCase()}:p${searchPage}`;

  if (requestCache.has(key)) {
    return requestCache.get(key);
  }

  const response = await fetch(
    `${BACKEND_BASE_URL}/api/search?text=${encodeURIComponent(searchText)}&type=${searchType}&provider=${searchProvider}&page=${searchPage}&per_page=${PER_PAGE}`,
  );
  const resultData = await response.json();

  if (!response.ok) {
    throw new Error(resultData.error || "Failed to fetch data");
  }

  const items = resultData.data.items || [];
  const total = resultData.data.total ?? items.length;
  const payload = { items, total };
  requestCache.set(key, payload);
  return payload;
}

export const useSearchStore = create(
  persist(
    (set, get) => ({
      text: "",
      type: "users",
      provider: "all",
      page: 1,
      total: 0,
      results: null,
      loading: false,
      error: null,
      savedItems: [],
      savedMap: {},
      savingKey: null,

      setText: (text) => {
        set({ text, page: 1 });
        debouncedFetch();
      },
      setType: (type) => {
        set({ type, page: 1 });
        debouncedFetch();
      },
      setProvider: (provider) => {
        set({ provider, page: 1 });
        debouncedFetch();
      },
      setPage: (page) => {
        set({ page });
        get().fetchResults();
      },

      fetchResults: async () => {
        const { text, type, provider, page } = get();
        const trimmed = text.trim();

        if (trimmed.length < MIN_CHARS) {
          set({ results: null, total: 0, loading: false, error: null });
          return;
        }

        const token = ++fetchToken;
        set({ loading: true, error: null });

        try {
          const { items, total } = await runSearch(
            trimmed,
            type,
            provider,
            page,
          );
          if (token !== fetchToken) return;
          set({ results: items, total, loading: false });
        } catch (err) {
          if (token !== fetchToken) return;
          set({ error: err.message, results: null, total: 0, loading: false });
        }
      },

      fetchSavedItems: async () => {
        try {
          const response = await fetch(`${BACKEND_BASE_URL}/api/saved/`);
          if (!response.ok) return;
          const data = await response.json();
          const map = {};
          data.forEach((saved) => {
            map[`${saved.provider}:${saved.item_type}:${saved.item_id}`] =
              saved.id;
          });
          set({ savedItems: data, savedMap: map });
        } catch {
          // мережа недоступна — лишаємо те, що вже підтягнулось з localStorage через persist
        }
      },

      toggleSave: async (item) => {
        if (!item) return;
        const key = getItemKey(item);
        const { savedMap } = get();
        set({ savingKey: key, error: null });

        try {
          if (savedMap[key]) {
            const response = await fetch(
              `${BACKEND_BASE_URL}/api/saved/${savedMap[key]}/`,
              {
                method: "DELETE",
              },
            );
            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.detail || "Failed to remove saved item");
            }
            set((state) => {
              const nextMap = { ...state.savedMap };
              delete nextMap[key];
              return {
                savedMap: nextMap,
                savedItems: state.savedItems.filter(
                  (s) => `${s.provider}:${s.item_type}:${s.item_id}` !== key,
                ),
              };
            });
          } else {
            const response = await fetch(`${BACKEND_BASE_URL}/api/saved/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                item_id: item.id,
                item_type: item.type === "users" ? "user" : "repo",
                provider: item.provider,
                title: item.title || item.login || item.name,
                url: item.url || item.html_url,
                avatar_url: item.avatar_url || "",
                // include star count when available (GitHub: stargazers_count, GitLab: star_count)
                star_count: item.stargazers_count ?? item.star_count ?? 0,
              }),
            });
            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.detail || "Failed to save item");
            }
            const saved = await response.json();
            set((state) => ({
              savedMap: { ...state.savedMap, [key]: saved.id },
              savedItems: [...state.savedItems, saved],
            }));
          }
        } catch (err) {
          set({ error: err.message });
        } finally {
          set({ savingKey: null });
        }
      },
    }),
    {
      name: "gs-search-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        text: state.text,
        type: state.type,
        provider: state.provider,
        savedItems: state.savedItems,
        savedMap: state.savedMap,
      }),
    },
  ),
);

const debouncedFetch = debounce(() => {
  useSearchStore.getState().fetchResults();
}, 500);
