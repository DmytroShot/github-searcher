import React, { useEffect } from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import MarkdownLite from "../components/MarkdownLite";

function getSubjectInfo(kind, item) {
  if (kind === "repo") {
    return {
      title: item.name || item.title || "Untitled repository",
      subtitle: item.description || item.tagline || "No description",
      href: item.html_url || item.url || "#",
      avatar: null,
      badge: item.language || null,
    };
  }
  return {
    title: item.login || item.title || item.name || "Unknown user",
    subtitle: item.location || "",
    href: item.html_url || item.url || "#",
    avatar: item.avatar_url || null,
    badge: null,
  };
}

export default function AnalyticsPage({ kind, item, onBack }) {
  const { loading, error, data, fetchAnalytics, reset } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics(kind, item);
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, item]);

  const subject = getSubjectInfo(kind, item);

  const analysis = data?.analysis || data;

  const summaryText = analysis?.summary || data?.reply || null;
  const metrics = Array.isArray(analysis?.metrics) ? analysis.metrics : [];
  const strengths = Array.isArray(analysis?.strengths) ? analysis.strengths : [];
  const risks = Array.isArray(analysis?.risks) ? analysis.risks : [];
  const recommendations = Array.isArray(analysis?.recommendations) ? analysis.recommendations : [];

  return (
    <div className="gs-analytics">
      <button type="button" className="gs-back-btn" onClick={onBack}>
        ← Back
      </button>

      <div className="gs-analytics-subject">
        {subject.avatar ? (
          <img src={subject.avatar} alt={subject.title} className="gs-analytics-avatar" />
        ) : (
          <div className="gs-analytics-avatar gs-analytics-avatar--repo">
            <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
              <path d="M2 2.5A2.5 2.5 0 014.5 0h8A2.5 2.5 0 0115 2.5v11a2.5 2.5 0 01-2.5 2.5h-8A2.5 2.5 0 012 13.5v-11zm2.5-1A1 1 0 003.5 2.5v11a1 1 0 001 1h8a1 1 0 001-1v-11a1 1 0 00-1-1h-8z" />
            </svg>
          </div>
        )}

        <div className="gs-analytics-subject-body">
          <div className="gs-analytics-subject-title-row">
            <h2 className="gs-analytics-title">{subject.title}</h2>
            {subject.badge && <span className="gs-analytics-lang-badge">{subject.badge}</span>}
          </div>
          {subject.subtitle && <p className="gs-analytics-subtitle">{subject.subtitle}</p>}
          <a href={subject.href} target="_blank" rel="noreferrer" className="gs-card-link">
            {kind === "repo" ? "View Repository" : "View Profile"}
          </a>
        </div>
      </div>

      {loading && (
        <div className="gs-status">
          <span className="gs-spinner" />
          Analyzing...
        </div>
      )}

      {!loading && error && <div className="gs-status gs-error">{error}</div>}

      {!loading && !error && data && (
        <div className="gs-analytics-content">
          {metrics.length > 0 && (
            <div className="gs-metrics-grid">
              {metrics.map((m, i) => (
                <div className="gs-metric-card" key={`${m.label}-${i}`}>
                  <span className="gs-metric-value">{m.value}</span>
                  <span className="gs-metric-label">{m.label}</span>
                </div>
              ))}
            </div>
          )}

          {summaryText && (
            <div className="gs-analytics-block">
              <h3 className="gs-analytics-block-title">Summary</h3>
              <div className="gs-analytics-block-body">
                <MarkdownLite text={summaryText} />
              </div>
            </div>
          )}

          {(strengths.length > 0 || risks.length > 0) && (
            <div className="gs-analytics-columns">
              {strengths.length > 0 && (
                <div className="gs-analytics-block gs-analytics-block--strengths">
                  <h3 className="gs-analytics-block-title">Strengths</h3>
                  <ul className="gs-analytics-pill-list">
                    {strengths.map((s, i) => (
                      <li key={i} className="gs-pill gs-pill--good">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-6.5 6.5a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06L6.75 10.19l5.97-5.97a.75.75 0 011.06 0z" />
                        </svg>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {risks.length > 0 && (
                <div className="gs-analytics-block gs-analytics-block--risks">
                  <h3 className="gs-analytics-block-title">Risks</h3>
                  <ul className="gs-analytics-pill-list">
                    {risks.map((r, i) => (
                      <li key={i} className="gs-pill gs-pill--warn">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                          <path d="M8.98 1.57a1.13 1.13 0 00-1.96 0L.34 13.5A1.13 1.13 0 001.32 15.25h13.36a1.13 1.13 0 00.98-1.75L8.98 1.57zM8 5.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5.5zm.01 5.5a.85.85 0 110 1.7.85.85 0 010-1.7z" />
                        </svg>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="gs-analytics-block">
              <h3 className="gs-analytics-block-title">Recommendations</h3>
              <ul className="gs-analytics-rec-list">
                {recommendations.map((r, i) => (
                  <li key={i} className="gs-analytics-rec-item">
                    <span className="gs-analytics-rec-index">{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {metrics.length === 0 &&
            !summaryText &&
            strengths.length === 0 &&
            risks.length === 0 &&
            recommendations.length === 0 && (
              <pre className="gs-analytics-raw">{JSON.stringify(data, null, 2)}</pre>
            )}
        </div>
      )}
    </div>
  );
}