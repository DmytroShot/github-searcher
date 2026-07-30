import React from "react";
import SaveButton from "./SaveButton";
import ProviderBadge from "./ProviderBadge";
import AnalyzeButton from "./AnalyzeButton";

export default function UserCard({ user, onSave, saved, saving, onAnalyze }) {
  const login = user.login || user.title || user.name || "Unknown user";
  const href = user.html_url || user.url || "#";

  return (
    <div className="gs-card">
      <SaveButton
        saved={saved}
        saving={saving}
        onClick={() => onSave(user)}
        label={saved ? "Remove saved item" : "Save item"}
      />
      <img src={user.avatar_url} alt={login} className="gs-avatar" />
      <div className="gs-card-body">
        <div className="gs-card-title-row">
          <h3 className="gs-card-title">{login}</h3>
          <ProviderBadge provider={user.provider} />
        </div>
        {user.location && <p className="gs-card-desc">{user.location}</p>}
        <div className="gs-card-actions">
          <a href={href} target="_blank" rel="noreferrer" className="gs-card-link">
            View Profile
          </a>
          <AnalyzeButton onClick={() => onAnalyze("user", user)} />
        </div>
      </div>
    </div>
  );
}