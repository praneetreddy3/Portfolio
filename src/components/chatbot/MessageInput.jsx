export default function MessageInput({ value, onChange, onSubmit, disabled, inputRef }) {
  const remaining = 500 - value.length;

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="border-t border-border p-2">
      {remaining < 100 && (
        <div className="px-1 pb-1 text-[10px] text-text-dim">{remaining} characters remaining</div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          rows={1}
          maxLength={500}
          value={value}
          disabled={disabled}
          aria-disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          className="flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          aria-label="Send message"
          disabled={disabled}
          onClick={onSubmit}
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
