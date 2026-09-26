import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({ messages, isLoading }) {
  const bottomRef = useRef(null);
  const topRef = useRef(null);

  useEffect(() => {
    // Only the canned greeting is present (nothing sent yet) — keep the
    // view pinned to the top so its opening line is readable immediately,
    // instead of auto-scrolling straight to its last line.
    if (messages.length <= 1 && !isLoading) {
      topRef.current?.scrollIntoView({ behavior: "auto" });
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      data-testid="message-list"
      className="chatbot-scroll flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2"
    >
      <div ref={topRef} />
      <div aria-live="polite" aria-atomic="false" className="flex flex-col gap-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
