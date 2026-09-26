import { useCallback, useState } from "react";

export class RateLimitError extends Error {}

/**
 * Thin fetch abstraction over the Lambda Function URL.
 * Returns { send, isLoading }; send() resolves to the answer string or
 * throws RateLimitError (429) / Error (any other non-ok status / network error).
 */
export function useChatApi() {
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async ({ message, history, visitorId }) => {
    setIsLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_LAMBDA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, visitorId }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        throw new RateLimitError(
          data.error ?? "Daily message limit reached. Please come back tomorrow."
        );
      }

      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      const data = await res.json();
      return data.answer;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { send, isLoading };
}
