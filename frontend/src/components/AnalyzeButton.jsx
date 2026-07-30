import React from "react";

export default function AnalyzeButton({ onClick }) {
  return (
    <button
      type="button"
      className="gs-analyze-btn"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="13"
        height="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M7 15l4-5 3 3 5-7" />
      </svg>
      Analyze
    </button>
  );
}