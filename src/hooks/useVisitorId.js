import { useState } from "react";

const KEY = "portfolio_chatbot_visitor_id";

/**
 * Generates (or reuses) a stable, anonymous UUID v4 for the current browser,
 * persisted in localStorage. Used for analytics only — never for rate limiting.
 */
export function useVisitorId() {
  const [visitorId] = useState(() => {
    if (typeof window === "undefined") return "";
    const stored = window.localStorage.getItem(KEY);
    if (stored) return stored;
    const id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
    return id;
  });
  return visitorId;
}
