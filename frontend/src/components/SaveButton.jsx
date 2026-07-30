import React from "react";

export default function SaveButton({ saved, saving, onClick, label }) {
  return (
    <button
      type="button"
      className={`gs-save-icon ${saved ? "saved" : ""} ${saving ? "saving" : ""}`}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={saving}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" className="gs-star-icon">
        <path
          d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.23L7 14.14 2 9.27l7.1-1.01L12 2z"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}