import { useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import ChatPanel from "./ChatPanel";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import SuggestedQuestions from "./SuggestedQuestions";
import MessageInput from "./MessageInput";
import { useVisitorId } from "../../hooks/useVisitorId";
import { useChatApi, RateLimitError } from "../../hooks/useChatApi";

const MAX_MESSAGES = 20; // 10 visitor+assistant pairs (Requirement 5.1/5.2)

const GREETING = {
  id: "greeting",
  role: "assistant",
  text:
    "Hi, I'm an assistant that can help you find information about Sai Praneet's background, skills, projects, and experience. What would you like to know?",
  timestamp: 0,
};

function toHistory(messages) {
  // The greeting is a canned local message, not a real turn — never send it
  // to the backend as conversation history.
  return messages
    .filter((m) => m.id !== "greeting")
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.text }));
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");

  const toggleButtonRef = useRef(null);
  const inputRef = useRef(null);

  const visitorId = useVisitorId();
  const { send, isLoading } = useChatApi();

  const appendMessage = useCallback((message) => {
    setMessages((prev) => {
      const next = [...prev, message];
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (rawText) => {
      const text = rawText.trim();
      if (text.length === 0) return; // Requirement 4.6 — reject whitespace-only

      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text,
        timestamp: Date.now(),
      };
      appendMessage(userMessage);
      setInput("");

      try {
        const answer = await send({
          message: text,
          history: toHistory(messages),
          visitorId,
        });
        appendMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          text: answer,
          timestamp: Date.now(),
        });
      } catch (err) {
        const fallbackText =
          err instanceof RateLimitError
            ? err.message
            : "Couldn't reach the server. Check your connection and try again.";
        appendMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          text: fallbackText,
          timestamp: Date.now(),
        });
      } finally {
        inputRef.current?.focus();
      }
    },
    [appendMessage, messages, send, visitorId]
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!next) toggleButtonRef.current?.focus();
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    toggleButtonRef.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={toggleButtonRef}
        type="button"
        onClick={toggleOpen}
        aria-label={isOpen ? "Minimize chat" : "Open chat"}
        className="fixed bottom-4 right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-full border border-accent/60 bg-surface text-accent shadow-2xl glow-border hover:bg-accent/10 transition-colors"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 5h16v10H8l-4 4V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <ChatPanel isOpen={isOpen} isLoading={isLoading}>
            <ChatHeader onClose={handleClose} />
            <MessageList messages={messages} isLoading={isLoading} />
            <SuggestedQuestions
              visible={!messages.some((m) => m.role === "user")}
              onSelect={handleSubmit}
            />
            <MessageInput
              value={input}
              onChange={setInput}
              onSubmit={() => handleSubmit(input)}
              disabled={isLoading}
              inputRef={inputRef}
            />
          </ChatPanel>
        )}
      </AnimatePresence>
    </>
  );
}
