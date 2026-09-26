import { SUGGESTED_QUESTIONS } from "../../data/suggestedQuestions";

export default function SuggestedQuestions({ questions = SUGGESTED_QUESTIONS, onSelect, visible }) {
  if (!visible) return null;
  return (
    <div data-testid="suggested-questions" className="flex flex-wrap gap-1.5 px-3 pb-2">
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] leading-snug text-text-dim hover:text-text hover:border-accent transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
