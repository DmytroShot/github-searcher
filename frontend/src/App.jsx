import React, { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";
import "./App.css";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const MIN_CHARS = 3;
const PER_PAGE = 12;

function GitHubIcon({ size = 28 }) {
  return (
    <svg
      height={size}
      width={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState("search");
  const [text, setText] = useState("");
  const [type, setType] = useState("users");
  const [provider, setProvider] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState(null);
  const [savedItems, setSavedItems] = useState([]);
  const [savedMap, setSavedMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savingKey, setSavingKey] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const providerDropdownRef = useRef(null);
  const cacheRef = useRef(new Map());

  const isActive = text.trim().length >= MIN_CHARS;

  const getItemKey = (item) => {
    const itemType = item.type === "users" ? "user" : "repo";
    return `${item.provider}:${itemType}:${item.id}`;
  };

  const fetchResults = async (
    searchText,
    searchType,
    searchProvider,
    searchPage,
  ) => {
    const key = `${searchProvider}:${searchType}:${searchText.toLowerCase()}:p${searchPage}`;

    if (cacheRef.current.has(key)) {
      const cached = cacheRef.current.get(key);
      setResults(cached.items);
      setTotal(cached.total);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/search?text=${encodeURIComponent(searchText)}&type=${searchType}&provider=${searchProvider}&page=${searchPage}&per_page=${PER_PAGE}`,
      );
      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.error || "Failed to fetch data");
      }

      const items = resultData.data.items || [];
      const totalCount = resultData.data.total ?? items.length;
      cacheRef.current.set(key, { items, total: totalCount });
      setResults(items);
      setTotal(totalCount);
    } catch (err) {
      setError(err.message);
      setResults(null);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedItems = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/saved/`);
      if (!response.ok) return;
      const data = await response.json();
      const map = {};
      data.forEach((saved) => {
        const key = `${saved.provider}:${saved.item_type}:${saved.item_id}`;
        map[key] = saved.id;
      });
      setSavedMap(map);
      setSavedItems(data);
    } catch {
      // ignore load failure
    }
  };

  const debouncedFetch = useMemo(
    () => debounce((q, t, p, pg) => fetchResults(q, t, p, pg), 500),
    [],
  );

  useEffect(() => {
    fetchSavedItems();
  }, []);

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed.length >= MIN_CHARS) {
      debouncedFetch(trimmed, type, provider, page);
    } else {
      debouncedFetch.cancel();
      setLoading(false);
      setError(null);
      setResults(null);
      setTotal(0);
    }
  }, [text, type, provider, page, debouncedFetch]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        providerDropdownRef.current &&
        !providerDropdownRef.current.contains(e.target)
      ) {
        setProviderDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const savedList = savedItems.map((saved) => ({
    id: saved.item_id,
    type: saved.item_type === "user" ? "users" : "repositories",
    provider: saved.provider,
    title: saved.title,
    url: saved.url,
    avatar_url: saved.avatar_url,
  }));

  const handleToggleSave = async (item) => {
    if (!item) return;

    const key = getItemKey(item);
    setSavingKey(key);
    setError(null);

    try {
      if (savedMap[key]) {
        const response = await fetch(
          `${BACKEND_BASE_URL}/api/saved/${savedMap[key]}/`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to remove saved item");
        }

        setSavedMap((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setSavedItems((prev) =>
          prev.filter(
            (saved) =>
              `${saved.provider}:${saved.item_type}:${saved.item_id}` !== key,
          ),
        );
      } else {
        const response = await fetch(`${BACKEND_BASE_URL}/api/saved/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_id: item.id,
            item_type: item.type === "users" ? "user" : "repo",
            provider: item.provider,
            title: item.title,
            url: item.url,
            avatar_url: item.avatar_url || "",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to save item");
        }

        const saved = await response.json();
        setSavedMap((prev) => ({ ...prev, [key]: saved.id }));
        setSavedItems((prev) => [...prev, saved]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className={`gs-page ${isActive ? "gs-page--top" : "gs-page--center"}`}>
      <div className="gs-container">
        <div className="gs-header">
          <GitHubIcon />
          <div>
            <h1 className="gs-title">GitHub Searcher</h1>
            <p className="gs-subtitle">Search users or repositories below</p>
          </div>
        </div>

        <div className="gs-tab-row">
          <button
            type="button"
            className={`gs-tab-btn ${view === "search" ? "active" : ""}`}
            onClick={() => setView("search")}
          >
            Search
          </button>
          <button
            type="button"
            className={`gs-tab-btn ${view === "saved" ? "active" : ""}`}
            onClick={() => setView("saved")}
          >
            Saved
          </button>
        </div>

        {view === "search" && (
          <div className="gs-search-row">
            <input
              className="gs-input"
              type="text"
              placeholder="Start typing to search .."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setPage(1);
              }}
            />

            <div className="gs-dropdown-wrap" ref={dropdownRef}>
              <button
                type="button"
                className="gs-dropdown-btn"
                onClick={() => setDropdownOpen((o) => !o)}
              >
                {type === "users" ? "Users" : "Repositories"}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="gs-chevron"
                >
                  <path d="M4.427 6.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 6H4.604a.25.25 0 00-.177.427z" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="gs-dropdown-menu">
                  {["users", "repositories"].map((opt) => (
                    <div
                      key={opt}
                      className="gs-dropdown-item"
                      onClick={() => {
                        setType(opt);
                        setPage(1);
                        setDropdownOpen(false);
                      }}
                    >
                      {opt === "users" ? "Users" : "Repositories"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="gs-dropdown-wrap" ref={providerDropdownRef}>
              <button
                type="button"
                className="gs-dropdown-btn"
                onClick={() => setProviderDropdownOpen((o) => !o)}
              >
                {provider === "all"
                  ? "All providers"
                  : provider === "github"
                    ? "GitHub"
                    : "GitLab"}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="gs-chevron"
                >
                  <path d="M4.427 6.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 6H4.604a.25.25 0 00-.177.427z" />
                </svg>
              </button>
              {providerDropdownOpen && (
                <div className="gs-dropdown-menu">
                  {["all", "github", "gitlab"].map((opt) => (
                    <div
                      key={opt}
                      className="gs-dropdown-item"
                      onClick={() => {
                        setProvider(opt);
                        setPage(1);
                        setProviderDropdownOpen(false);
                      }}
                    >
                      {opt === "all"
                        ? "All providers"
                        : opt === "github"
                          ? "GitHub"
                          : "GitLab"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === "saved" && (
          <>
            {loading && (
              <div className="gs-status">
                <span className="gs-spinner" />
                Loading saved items...
              </div>
            )}

            {!loading && !error && savedItems.length === 0 && (
              <div className="gs-status">No saved items yet.</div>
            )}

            {!loading && !error && savedItems.length > 0 && (
              <div className="gs-grid">
                {savedList.map((item) => {
                  const key = getItemKey(item);
                  return item.type === "users" ? (
                    <UserCard
                      key={`${item.provider}-${item.id}`}
                      user={item}
                      onSave={handleToggleSave}
                      saved={Boolean(savedMap[key])}
                      saving={savingKey === key}
                    />
                  ) : (
                    <RepoCard
                      key={`${item.provider}-${item.id}`}
                      repo={item}
                      onSave={handleToggleSave}
                      saved={Boolean(savedMap[key])}
                      saving={savingKey === key}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {view === "search" && isActive && loading && (
          <div className="gs-status">
            <span className="gs-spinner" />
            Loading...
          </div>
        )}

        {view === "search" &&
          !loading &&
          !error &&
          results &&
          results.length === 0 && (
            <div className="gs-status">No results found</div>
          )}

        {view === "search" &&
          !loading &&
          !error &&
          results &&
          results.length > 0 && (
            <>
              <div className="gs-grid">
                {type === "users"
                  ? results.map((user) => {
                      const key = getItemKey(user);
                      return (
                        <UserCard
                          key={user.id}
                          user={user}
                          onSave={handleToggleSave}
                          saved={Boolean(savedMap[key])}
                          saving={savingKey === key}
                        />
                      );
                    })
                  : results.map((repo) => {
                      const key = getItemKey(repo);
                      return (
                        <RepoCard
                          key={repo.id}
                          repo={repo}
                          onSave={handleToggleSave}
                          saved={Boolean(savedMap[key])}
                          saving={savingKey === key}
                        />
                      );
                    })}
              </div>

              <div className="gs-pagination">
                <button
                  type="button"
                  className="gs-page-btn"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="gs-page-info">
                  Page {page} / {Math.max(1, Math.ceil(total / PER_PAGE))}
                </span>
                <button
                  type="button"
                  className="gs-page-btn"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= Math.ceil(total / PER_PAGE)}
                >
                  Next
                </button>
              </div>
            </>
          )}
      </div>
    </div>
  );
}

function UserCard({ user, onSave, saved, saving }) {
  const login = user.login || user.title || user.name || "Unknown user";
  const href = user.html_url || user.url || "#";

  return (
    <div className="gs-card">
      <img src={user.avatar_url} alt={login} className="gs-avatar" />
      <div className="gs-card-body">
        <div className="gs-card-header">
          <h3 className="gs-card-title">{login}</h3>
          <button
            type="button"
            className={`gs-save-icon ${saved ? "saved" : ""}`}
            aria-label={saved ? "Remove saved item" : "Save item"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave(user);
            }}
            disabled={saving}
          >
            {saving ? "…" : saved ? "★" : "☆"}
          </button>
        </div>
        {user.location && <p className="gs-card-desc">{user.location}</p>}
        <div className="gs-card-actions">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="gs-card-link"
          >
            View Profile
          </a>
        </div>
      </div>
    </div>
  );
}

function RepoCard({ repo, onSave, saved, saving }) {
  const name = repo.name || repo.title || "Untitled repository";
  const href = repo.html_url || repo.url || "#";
  const description = repo.description || repo.tagline || "No description";
  const stars = repo.stargazers_count ?? repo.star_count ?? 0;

  return (
    <div className="gs-card">
      <div className="gs-card-body">
        <div className="gs-card-header">
          <h3 className="gs-card-title">{name}</h3>
          <button
            type="button"
            className={`gs-save-icon ${saved ? "saved" : ""}`}
            aria-label={saved ? "Remove saved item" : "Save item"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave(repo);
            }}
            disabled={saving}
          >
            {saving ? "…" : saved ? "★" : "☆"}
          </button>
        </div>
        <p className="gs-card-desc">
          {description.length > 60
            ? `${description.substring(0, 60)}...`
            : description}
        </p>
        <p className="gs-card-stars">⭐ {stars}</p>
        <div className="gs-card-actions">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="gs-card-link"
          >
            View Repository
          </a>
        </div>
      </div>
    </div>
  );
}
