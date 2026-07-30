import React from "react";

export default function RepositorySkeleton() {
  return (
    <div className="gs-card gs-skeleton-card" aria-hidden="true">
      <div className="gs-skeleton-circle" />
      <div className="gs-skeleton-body">
        <div className="gs-skeleton-line gs-skeleton-title" />
        <div className="gs-skeleton-line gs-skeleton-desc" />
        <div className="gs-skeleton-line gs-skeleton-desc gs-skeleton-desc--short" />
      </div>
    </div>
  );
}