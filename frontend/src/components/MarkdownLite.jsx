import React from "react";

function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
  });
}

export default function MarkdownLite({ text }) {
  const lines = text.split("\n");
  const blocks = [];
  let currentList = null;

  lines.forEach((line, idx) => {
    const listMatch = line.match(/^\s*[*-]\s+(.*)/);

    if (listMatch) {
      if (!currentList) {
        currentList = [];
        blocks.push(currentList);
      }
      currentList.push(listMatch[1]);
    } else {
      currentList = null;
      blocks.push(line);
    }
  });

  return (
    <>
      {blocks.map((block, i) => {
        if (Array.isArray(block)) {
          return (
            <ul className="gs-chat-list" key={`list-${i}`}>
              {block.map((item, j) => (
                <li key={`item-${i}-${j}`}>{renderInline(item, `li-${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.trim() === "") {
          return null;
        }
        return (
          <p className="gs-chat-line" key={`line-${i}`}>
            {renderInline(block, `line-${i}`)}
          </p>
        );
      })}
    </>
  );
}