import React, { useState, useEffect, useMemo, useRef } from "react";
import debounce from "lodash.debounce";
import "./App.css";

function GitHubIcon({ size = 28 }) {
  return (
    <svg
      height={size}
      width={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
        0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
        -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
        .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
        -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
        1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82
        1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
        1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

const MIN_CHARS = 3;

export default function App() {
  const [text, setText] = useState("");
  const [type, setType] = useState("users");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const cacheRef = useRef(new Map());

  const fetchResults = async (searchText, searchType) => {
    const key = `${searchType}:${searchText.toLowerCase()}`;

    if (cacheRef.current.has(key)) {
      setResults(cacheRef.current.get(key));
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/search?text=${encodeURIComponent(searchText)}&type=${searchType}`,
      );
      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.error || "Failed to fetch data");
      }

      const items = resultData.data.items || [];
      cacheRef.current.set(key, items);
      setResults(items);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useMemo(
    () => debounce((q, t) => fetchResults(q, t), 500),
    [],
  );

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed.length >= MIN_CHARS) {
      debouncedFetch(trimmed, type);
    } else {
      debouncedFetch.cancel();
      setLoading(false);
      setError(null);
      setResults(null);
    }
  }, [text, type, debouncedFetch]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = text.trim().length >= MIN_CHARS;

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

        <div className="gs-search-row">
          <input
            className="gs-input"
            type="text"
            placeholder="Start typing to search .."
            value={text}
            onChange={(e) => setText(e.target.value)}
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
                      setDropdownOpen(false);
                    }}
                  >
                    {opt === "users" ? "Users" : "Repositories"}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isActive && loading && (
          <div className="gs-status">
            <span className="gs-spinner" />
            Loading...
          </div>
        )}

        {isActive && !loading && error && (
          <div className="gs-status gs-error">{error}</div>
        )}

        {isActive && !loading && !error && results && results.length === 0 && (
          <div className="gs-status">No results found</div>
        )}

        {isActive && !loading && !error && results && results.length > 0 && (
          <div className="gs-grid">
            {type === "users"
              ? results.map((user) => <UserCard key={user.id} user={user} />)
              : results.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user }) {
  return (
    <a
      href={user.html_url}
      target="_blank"
      rel="noreferrer"
      className="gs-card"
    >
      <img src={user.avatar_url} alt={user.login} className="gs-avatar" />
      <div className="gs-card-body">
        <h3 className="gs-card-title">{user.login}</h3>
        {user.location && <p className="gs-card-desc">{user.location}</p>}
        <span className="gs-card-link">View Profile</span>
      </div>
    </a>
  );
}

function RepoCard({ repo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="gs-card"
    >
      <div className="gs-card-body">
        <h3 className="gs-card-title">{repo.name}</h3>
        <p className="gs-card-desc">
          {repo.description
            ? repo.description.length > 60
              ? `${repo.description.substring(0, 60)}...`
              : repo.description
            : "No description"}
        </p>
        <p className="gs-card-stars">⭐ {repo.stargazers_count}</p>
        <span className="gs-card-link">View Repository</span>
      </div>
    </a>
  );
}
