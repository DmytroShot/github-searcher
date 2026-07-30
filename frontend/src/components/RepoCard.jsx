import React from "react";
import SaveButton from "./SaveButton";
import ProviderBadge from "./ProviderBadge";
import AnalyzeButton from "./AnalyzeButton";

export default function RepoCard({ repo, onSave, saved, saving, onAnalyze }) {
  const name = repo.name || repo.title || "Untitled repository";
  const href = repo.html_url || repo.url || "#";
  const stars = repo.stargazers_count ?? repo.star_count ?? 0;

  return (
    <div className="gs-card">
      <SaveButton
        saved={saved}
        saving={saving}
        onClick={() => onSave(repo)}
        label={saved ? "Remove saved item" : "Save item"}
      />
      <div className="gs-card-body">
        <div className="gs-card-title-row">
          <h3 className="gs-card-title">{name}</h3>
          <ProviderBadge provider={repo.provider} />
        </div>
        <p className="gs-card-stars">⭐ {stars}</p>
        <div className="gs-card-actions">
          <a href={href} target="_blank" rel="noreferrer" className="gs-card-link">
            View Repository
          </a>
          <AnalyzeButton onClick={() => onAnalyze("repo", repo)} />
        </div>
      </div>
    </div>
  );
}