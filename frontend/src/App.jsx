import React, { useEffect, useRef, useState } from "react";
import {
  useSearchStore,
  getItemKey,
  MIN_CHARS,
  PER_PAGE,
} from "./store/useSearchStore";
import UserCard from "./components/UserCard";
import RepoCard from "./components/RepoCard";
import RepositorySkeleton from "./components/RepositorySkeleton";
import Pagination from "./components/Pagination";
import "./App.css";
import ChatPage from "./pages/ChatPage";
import AnalyticsPage from "./pages/AnalyticsPage";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const providerDropdownRef = useRef(null);

  const [returnView, setReturnView] = useState("search");
  const [analyzeTarget, setAnalyzeTarget] = useState(null);

  const handleAnalyze = (kind, item) => {
    setReturnView(view === "analytics" ? returnView : view);
    setAnalyzeTarget({ kind, item });
    setView("analytics");
  };

  const {
    text,
    type,
    provider,
    page,
    total,
    results,
    loading,
    error,
    savedItems,
    savedMap,
    savingKey,
    setText,
    setType,
    setProvider,
    setPage,
    fetchResults,
    fetchSavedItems,
    toggleSave,
  } = useSearchStore();

  const isActive = text.trim().length >= MIN_CHARS;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  useEffect(() => {
    fetchSavedItems();
    if (isActive) fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    star_count: saved.star_count ?? saved.stargazers_count ?? 0,
  }));

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

        {view !== "analytics" && (
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
        )}

        {view === "analytics" && analyzeTarget && (
          <AnalyticsPage
            kind={analyzeTarget.kind}
            item={analyzeTarget.item}
            onBack={() => setView(returnView)}
          />
        )}

        {view === "search" && (
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
            {savedItems.length === 0 && (
              <div className="gs-status">No saved items yet.</div>
            )}
            {savedItems.length > 0 && (
              <div className="gs-grid">
                {savedList.map((item) => {
                  const key = getItemKey(item);
                  return item.type === "users" ? (
                    <UserCard
                      key={`${item.provider}-${item.id}`}
                      user={item}
                      onSave={toggleSave}
                      saved={Boolean(savedMap[key])}
                      saving={savingKey === key}
                      onAnalyze={handleAnalyze}
                    />
                  ) : (
                    <RepoCard
                      key={`${item.provider}-${item.id}`}
                      repo={item}
                      onSave={toggleSave}
                      saved={Boolean(savedMap[key])}
                      saving={savingKey === key}
                      onAnalyze={handleAnalyze}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {view === "search" && isActive && error && (
          <div className="gs-status gs-error">{error}</div>
        )}

        {view === "search" && isActive && loading && (
          <div className="gs-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <RepositorySkeleton key={i} />
            ))}
          </div>
        )}

        {view === "search" &&
          isActive &&
          !loading &&
          !error &&
          results &&
          results.length === 0 && (
            <div className="gs-status">No results found</div>
          )}

        {view === "search" &&
          isActive &&
          !loading &&
          !error &&
          results &&
          results.length > 0 && (
            <div className="gs-grid">
              {type === "users"
                ? results.map((user) => {
                    const key = getItemKey(user);
                    return (
                      <UserCard
                        key={user.id}
                        user={user}
                        onSave={toggleSave}
                        saved={Boolean(savedMap[key])}
                        saving={savingKey === key}
                        onAnalyze={handleAnalyze}
                      />
                    );
                  })
                : results.map((repo) => {
                    const key = getItemKey(repo);
                    return (
                      <RepoCard
                        key={repo.id}
                        repo={repo}
                        onSave={toggleSave}
                        saved={Boolean(savedMap[key])}
                        saving={savingKey === key}
                        onAnalyze={handleAnalyze}
                      />
                    );
                  })}
            </div>
          )}

        {view === "search" && isActive && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            disabled={loading}
          />
        )}
      </div>

      <aside className="gs-chat-sidebar">
        <ChatPage />
      </aside>
    </div>
  );
}
