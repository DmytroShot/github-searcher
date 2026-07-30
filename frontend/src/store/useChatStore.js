import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

let messageCounter = 0;
const nextId = () => `msg-${Date.now()}-${messageCounter++}`;

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [], // { id, role: 'user' | 'assistant', content, error? }
      sending: false,
      error: null,

      sendMessage: async (text) => {
        const trimmed = text.trim();
        if (!trimmed || get().sending) return;

        const userMessage = { id: nextId(), role: "user", content: trimmed };
        set((state) => ({
          messages: [...state.messages, userMessage],
          sending: true,
          error: null,
        }));

        const history = get()
          .messages.filter((m) => !m.error)
          .map((m) => ({ role: m.role, content: m.content }));

        try {
          const response = await fetch(`${BACKEND_BASE_URL}/api/ai/chat/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: trimmed, history }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to get a response");
          }

          const assistantMessage = {
            id: nextId(),
            role: "assistant",
            content: data.reply,
          };
          set((state) => ({
            messages: [...state.messages, assistantMessage],
            sending: false,
          }));
        } catch (err) {
          set((state) => ({
            messages: [
              ...state.messages,
              {
                id: nextId(),
                role: "assistant",
                content: err.message,
                error: true,
              },
            ],
            sending: false,
            error: err.message,
          }));
        }
      },

      clearHistory: () => set({ messages: [], error: null }),
    }),
    {
      name: "gs-chat-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);
