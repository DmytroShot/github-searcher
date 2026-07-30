import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import MarkdownLite from "../components/MarkdownLite";

export default function ChatPage() {
  const { messages, sending, sendMessage, clearHistory } = useChatStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="gs-chat">
      <div className="gs-chat-toolbar">
        <span className="gs-chat-toolbar-title">Chat</span>
        {messages.length > 0 && (
          <button type="button" className="gs-chat-clear" onClick={clearHistory}>
            Clear history
          </button>
        )}
      </div>

      <div className="gs-chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="gs-status gs-chat-empty">Ask anything to start the conversation.</div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`gs-chat-bubble-row ${m.role === "user" ? "gs-chat-bubble-row--user" : ""}`}
          >
            <div
              className={`gs-chat-bubble ${m.role === "user" ? "gs-chat-bubble--user" : ""} ${
                m.error ? "gs-chat-bubble--error" : ""
              }`}
            >
              {m.role === "assistant" && !m.error ? (
                <MarkdownLite text={m.content} />
              ) : (
                <p className="gs-chat-line">{m.content}</p>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="gs-chat-bubble-row">
            <div className="gs-chat-bubble gs-chat-bubble--typing">
              <span className="gs-spinner" />
              Typing...
            </div>
          </div>
        )}
      </div>

      <form className="gs-chat-input-row" onSubmit={handleSubmit}>
        <input
          className="gs-input"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="gs-chat-send" disabled={sending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}