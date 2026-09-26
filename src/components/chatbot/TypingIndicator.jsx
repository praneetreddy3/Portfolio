export default function TypingIndicator() {
  return (
    <div aria-hidden="true" className="flex items-center gap-1 px-3 py-2">
      <span className="chatbot-dot" style={{ animationDelay: "0ms" }} />
      <span className="chatbot-dot" style={{ animationDelay: "150ms" }} />
      <span className="chatbot-dot" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
