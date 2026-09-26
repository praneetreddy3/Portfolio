export default function ChatHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-2">
      <span className="font-display text-sm text-text">Ask me anything</span>
      <button
        type="button"
        aria-label="Close chat"
        onClick={onClose}
        className="text-text-dim hover:text-accent transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
