import React from "react";

function buildPageList(current, totalPages) {
  const delta = 1;
  const range = [];
  const withDots = [];
  let last;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (last) {
      if (i - last === 2) withDots.push(last + 1);
      else if (i - last > 2) withDots.push("...");
    }
    withDots.push(i);
    last = i;
  });

  return withDots;
}

export default function Pagination({ page, totalPages, onPageChange, disabled }) {
  if (totalPages <= 1) {
    return <div className="gs-pagination gs-pagination--placeholder" />;
  }

  const pages = buildPageList(page, totalPages);

  return (
    <nav className="gs-pagination" aria-label="Pagination">
      <button
        type="button"
        className="gs-page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page === 1}
      >
        ← Prev
      </button>

      <div className="gs-page-numbers">
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="gs-page-dots">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`gs-page-num ${p === page ? "active" : ""}`}
              onClick={() => onPageChange(p)}
              disabled={disabled}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="gs-page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page === totalPages}
      >
        Next →
      </button>
    </nav>
  );
}