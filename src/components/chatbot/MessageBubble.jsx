const URL_RE = /https?:\/\/[^\s<>"]+/g;
const BOLD_RE = /\*\*(.+?)\*\*/g;

// Renders a single line of text, turning **bold** spans and bare URLs into
// real elements. Assistant replies are plain conversational text with light
// markdown (bold, links) — no need for a full markdown parser.
function renderInline(text, keyPrefix) {
  const boldParts = text.split(BOLD_RE);
  return boldParts.flatMap((chunk, i) => {
    // split() on a capturing group alternates: [plain, bold, plain, bold, ...]
    const isBold = i % 2 === 1;
    const urlParts = chunk.split(URL_RE);
    const urls = chunk.match(URL_RE) ?? [];
    const pieces = urlParts.flatMap((part, j) =>
      urls[j]
        ? [
            part,
            <a
              key={`${keyPrefix}-${i}-${j}`}
              href={urls[j]}
              target="_blank"
              rel="noreferrer noopener"
              className="underline text-accent break-all"
            >
              {urls[j]}
            </a>,
          ]
        : [part]
    );
    return isBold ? [<strong key={`${keyPrefix}-b-${i}`}>{pieces}</strong>] : pieces;
  });
}

// Renders assistant text as a sequence of paragraphs and bullet lists,
// so "- item" lines from the model become real <ul><li> markup instead of
// showing a literal leading dash.
function renderFormatted(text) {
  const lines = text.split("\n");
  const blocks = [];
  let bulletBuffer = [];

  function flushBullets(key) {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`} className="list-disc pl-4 space-y-1.5">
        {bulletBuffer.map((line, i) => (
          <li key={i}>{renderInline(line, `li-${key}-${i}`)}</li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  }

  lines.forEach((line, i) => {
    const bulletMatch = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bulletMatch) {
      bulletBuffer.push(bulletMatch[1]);
      return;
    }
    flushBullets(i);
    if (line.trim().length > 0) {
      blocks.push(<p key={`p-${i}`}>{renderInline(line, `p-${i}`)}</p>);
    }
  });
  flushBullets("end");

  return blocks;
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div data-testid="message-bubble" className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2.5 text-sm leading-relaxed break-words space-y-2.5 ${
          isUser ? "bg-accent text-bg whitespace-pre-wrap" : "bg-surface-2 border border-border text-text"
        }`}
      >
        {isUser ? message.text : renderFormatted(message.text)}
      </div>
    </div>
  );
}
