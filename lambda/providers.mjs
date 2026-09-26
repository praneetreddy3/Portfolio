const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// An LLM's response time scales with how many tokens it GENERATES, not with
// how many it reads. Leaving max_tokens unset lets the model run until it
// decides to stop, so one rambling answer becomes a multi-second wait — and
// the visitor sits watching a typing indicator the whole time. The system
// prompt already asks for 3-5 sentences; this enforces it as a hard ceiling
// instead of a polite request, and caps the worst case rather than the average.
const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS ?? 400);

// Low but non-zero: answers are drawn from a fixed profile, so there is
// nothing to gain from creative sampling, and lower temperature also means
// fewer wandering, overlong responses.
const TEMPERATURE = Number(process.env.LLM_TEMPERATURE ?? 0.3);

// Shared fetch wrapper. Never includes the API key value in a thrown error
// message (Requirement 13.3) — only the HTTP status is surfaced.
async function callProvider({ url, apiKey, model, conversation, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: conversation,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: TEMPERATURE,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Provider request failed with status ${res.status}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      throw new Error("Provider returned an empty response");
    }
    return content;
  } finally {
    clearTimeout(timer);
  }
}

export async function callGroq(conversation) {
  return callProvider({
    url: GROQ_URL,
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    conversation,
    timeoutMs: 10_000,
  });
}

export async function callOpenRouter(conversation) {
  return callProvider({
    url: OPENROUTER_URL,
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free",
    conversation,
    timeoutMs: 15_000,
  });
}
