import { buildSystemPrompt } from "./systemPrompt.mjs";
import { checkRateLimit, incrementRateLimit, checkCache, writeCache } from "./dynamodb.mjs";
import { callGroq, callOpenRouter } from "./providers.mjs";

// Built once at cold start, reused across warm invocations.
const SYSTEM_PROMPT = buildSystemPrompt();

// Frontend caps the textarea at 500 chars (MessageInput.jsx), but that's a
// client-side convenience only — anyone can POST directly to the Function
// URL with curl/Postman and skip it entirely. This is the real, enforced
// ceiling: generous enough for a legitimate long question, tight enough to
// bound per-request LLM token cost and DynamoDB item size.
const MAX_MESSAGE_LENGTH = 2000;

// Total characters of caller-supplied history forwarded to the LLM. Without
// this, 20 history items x 2000 chars = ~40k chars (~10k tokens) of
// attacker-controlled payload on every single request.
const MAX_HISTORY_CHARS = 6000;

// Answers longer than this are returned to the visitor but never cached —
// keeps DynamoDB items far below the 400KB hard limit.
const MAX_CACHEABLE_ANSWER = 8000;

// Bumped whenever systemPrompt.mjs changes in a way that should invalidate
// previously cached answers. Without it, a prompt fix (e.g. correcting the
// assistant's voice) keeps serving 30-day-old answers written under the OLD
// prompt. Cheaper and safer than truncating the cache table by hand.
const PROMPT_VERSION = process.env.PROMPT_VERSION ?? "2";

// Site-wide daily ceiling. Per-IP limiting alone does nothing against an
// attacker rotating source IPs, which is the realistic way this endpoint
// would be driven into real money on the AI providers.
const GLOBAL_BUCKET = "__GLOBAL__";

// Matches everything up to and including the LAST sentence-ending
// punctuation mark. Used to salvage a truncated answer (see finalizeAnswer).
const LAST_SENTENCE_RE = /^[\s\S]*[.!?](?=\s|$)/;

// A short, complete sentence is still a usable answer; anything shorter than
// this after trimming isn't worth showing (it reads as a non-sequitur), so
// we fall back to the polite retry message instead.
const MIN_USABLE_TRIM_LENGTH = 20;

const TRUNCATION_FALLBACK_MESSAGE =
  "I wasn't able to finish putting that answer together. Could you ask again, " +
  "or rephrase it a bit? You can also reach Sai Praneet directly at " +
  "praneetreddy66@gmail.com.";

// The Groq model is a reasoning model, so a request can legitimately run out
// of its token budget mid-sentence (see the note in providers.mjs) — the
// provider still returns 200 with whatever partial text it had, so this is
// NOT caught by the try/catch around callGroq/callOpenRouter. Left alone,
// that half-sentence gets shown to the visitor verbatim and then cached for
// everyone else who asks something similar for the next 30 days.
//
// finalizeAnswer() is the safety net: a truncated (finishReason "length")
// answer gets trimmed back to its last complete sentence, or replaced by a
// short, honest fallback message if it never completed one — and either way
// it's marked non-cacheable, so the next visitor gets a fresh attempt
// instead of the same cut-off text.
function finalizeAnswer({ content, finishReason }) {
  if (finishReason !== "length") {
    return { text: content, cacheable: true };
  }
  const match = content.match(LAST_SENTENCE_RE);
  const trimmed = match ? match[0].trim() : "";
  if (trimmed.length >= MIN_USABLE_TRIM_LENGTH) {
    return { text: trimmed, cacheable: false };
  }
  return { text: TRUNCATION_FALLBACK_MESSAGE, cacheable: false };
}

export async function handler(event) {
  // 1. Method guard
  const method = event?.requestContext?.http?.method;
  if (method !== "POST") {
    return response(405, { error: "Method not allowed" });
  }

  // 2. CORS guard
  const origin = event?.headers?.origin ?? event?.headers?.Origin ?? "";
  const allowedOrigin = process.env.CORS_ORIGIN;
  if (origin !== allowedOrigin) {
    return response(403, { error: "Forbidden" });
  }

  // 3. Body parse
  let body;
  try {
    body = JSON.parse(event?.body ?? "{}");
  } catch {
    return response(400, { error: "Invalid JSON body" });
  }

  // 4. Validate message
  const { message, history, visitorId } = body ?? {};
  if (typeof message !== "string" || message.trim().length === 0) {
    return response(400, { error: "Field 'message' must be a non-empty string" });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return response(400, {
      error: `Field 'message' must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
    });
  }

  // History items come from the caller too, so they get the same length
  // guard — but as a silent filter rather than a 400, consistent with how
  // malformed items (bad role, non-string content) are already dropped
  // rather than rejecting the whole request.
  const filteredHistory = Array.isArray(history)
    ? history
        .filter(
          (item) =>
            item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string" &&
            item.content.length <= MAX_MESSAGE_LENGTH
        )
        .slice(-20)
        .map((item) => ({ role: item.role, content: item.content }))
    : [];

  // Walk backwards from the most recent turn, keeping history under a total
  // character budget. Newest context is the most useful, so it wins.
  const safeHistory = [];
  let historyChars = 0;
  for (let i = filteredHistory.length - 1; i >= 0; i--) {
    const item = filteredHistory[i];
    if (historyChars + item.content.length > MAX_HISTORY_CHARS) break;
    historyChars += item.content.length;
    safeHistory.unshift(item);
  }

  if (visitorId !== undefined && typeof visitorId !== "string") {
    console.error("visitorId received in an unexpected shape (analytics-only field, ignored)");
  }

  // 5. Rate limit — fail open on DynamoDB errors
  const sourceIp = event?.requestContext?.http?.sourceIp ?? "unknown";
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const limit = parseInt(process.env.DAILY_MESSAGE_LIMIT ?? "20", 10);

  const globalLimit = parseInt(process.env.GLOBAL_DAILY_LIMIT ?? "500", 10);

  const [count, globalCount] = await Promise.all([
    checkRateLimit(sourceIp, date).catch((err) => {
      console.error("Rate table read failed:", err.message);
      return 0;
    }),
    checkRateLimit(GLOBAL_BUCKET, date).catch((err) => {
      console.error("Global rate read failed:", err.message);
      return 0;
    }),
  ]);

  if (count >= limit) {
    return response(429, {
      error: `Daily limit of ${limit} messages reached. Try again tomorrow.`,
    });
  }

  // Site-wide circuit breaker. Deliberately a vaguer message than the per-IP
  // one — a legitimate visitor shouldn't be told the exact abuse threshold.
  if (globalCount >= globalLimit) {
    return response(429, {
      error:
        "The assistant is getting more traffic than usual right now. " +
        "Please try again later, or email praneetreddy66@gmail.com directly.",
    });
  }

  await Promise.all([
    incrementRateLimit(sourceIp, date).catch((err) =>
      console.error("Rate table write failed:", err.message)
    ),
    incrementRateLimit(GLOBAL_BUCKET, date).catch((err) =>
      console.error("Global rate write failed:", err.message)
    ),
  ]);

  // 6. Cache lookup — fail open on DynamoDB errors
  //
  // Only "cold" questions are cacheable. Two guards matter here:
  //  - a question asked mid-conversation ("tell me more about it") means
  //    something different depending on what came before, so caching it
  //    globally would serve one visitor's context to everyone else;
  //  - normalizeQuestion strips every non-ASCII character, so any question
  //    written in a non-Latin script collapses to "" or "   " and every
  //    such question would otherwise share a single cache entry.
  const normalizedQuestion = normalizeQuestion(message);
  const cacheKey =
    safeHistory.length === 0 && normalizedQuestion.length > 0
      ? `v${PROMPT_VERSION}:${normalizedQuestion}`
      : null;

  const cached = cacheKey
    ? await checkCache(cacheKey).catch((err) => {
        console.error("Cache read failed:", err.message);
        return null;
      })
    : null;
  if (cached) {
    return response(200, { answer: cached });
  }

  // 7. Build conversation
  const conversation = [
    { role: "system", content: SYSTEM_PROMPT },
    ...safeHistory,
    { role: "user", content: message },
  ];

  // 8. Groq primary
  let answer = null;
  let cacheable = true;
  try {
    const result = await callGroq(conversation);
    ({ text: answer, cacheable } = finalizeAnswer(result));
  } catch (err) {
    console.error("Groq failed:", err.message);
  }

  // 9. OpenRouter fallback
  if (answer === null) {
    try {
      const result = await callOpenRouter(conversation);
      ({ text: answer, cacheable } = finalizeAnswer(result));
    } catch (err) {
      console.error("OpenRouter failed:", err.message);
    }
  }

  // 10. Graceful static fallback + cache write
  // Only real, COMPLETE AI-generated answers are cached — caching the
  // static fallback, or a truncated answer, would keep serving it for 30
  // days even after providers recover / the token budget is big enough.
  if (answer === null) {
    answer =
      "I'm having trouble connecting to my AI backend right now. " +
      "You can reach Sai Praneet directly at praneetreddy66@gmail.com " +
      "or on LinkedIn: https://www.linkedin.com/in/sai-praneet-reddy-chinthala/";
  } else if (cacheable && cacheKey && answer.length <= MAX_CACHEABLE_ANSWER) {
    await writeCache(cacheKey, answer).catch((err) =>
      console.error("Cache write failed:", err.message)
    );
  }

  return response(200, { answer });
}

export function normalizeQuestion(raw) {
  return String(raw)
    .toLowerCase()
    // Turn every run of whitespace (incl. newlines/tabs) into a single space
    // FIRST. Doing this after the strip would delete newlines outright and
    // glue the surrounding words together ("what is\nrag" -> "what israg").
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 -]/g, "")
    // Stripping characters can leave double spaces behind ("c++ vs c#").
    .replace(/\s+/g, " ")
    .trim();
}

// Note: Access-Control-Allow-Origin is intentionally NOT set here — the
// Lambda Function URL's own CORS config (see template.yaml) already adds it
// to every response automatically. Setting it here too caused the browser
// to see the header twice and reject the response entirely.
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}
