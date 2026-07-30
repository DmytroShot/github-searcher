import React from "react";

function GitHubGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function GitLabGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M8 14.75l2.85-8.77H5.15L8 14.75z" opacity="0" />
      <path d="M8 14.75l-2.85-8.77H1.5L8 14.75zM8 14.75l2.85-8.77h4.65L8 14.75z" />
      <path d="M1.5 5.98L.14 10.1a.6.6 0 00.22.68L8 14.75 1.5 5.98z" />
      <path d="M1.5 5.98h3.65L3.72.9a.32.32 0 00-.6 0L1.5 5.98z" />
      <path d="M14.5 5.98L15.86 10.1a.6.6 0 01-.22.68L8 14.75l6.5-8.77z" />
      <path d="M14.5 5.98h-3.65L12.28.9a.32.32 0 01.6 0l1.62 5.08z" />
    </svg>
  );
}

const LABELS = {
  github: "GitHub",
  gitlab: "GitLab",
};

export default function ProviderBadge({ provider }) {
  if (!provider) return null;

  const label = LABELS[provider] || provider;

  return (
    <span className={`gs-provider-badge gs-provider-badge--${provider}`} title={label}>
      {provider === "gitlab" ? <GitLabGlyph /> : <GitHubGlyph />}
      <span className="gs-provider-badge-label">{label}</span>
    </span>
  );
}