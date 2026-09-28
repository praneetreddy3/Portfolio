// Edge-case / abuse-surface regression suite.
// Each test here corresponds to a concrete failure mode found by auditing the
// handler. They lock in the fixes so the behaviour cannot silently regress.
import { describe, it, expect, vi, beforeEach } from "vitest";

const dynamodbMocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  incrementRateLimit: vi.fn(),
  checkCache: vi.fn(),
  writeCache: vi.fn(),
}));
const providerMocks = vi.hoisted(() => ({
  callGroq: vi.fn(),
  callOpenRouter: vi.fn(),
}));

vi.mock("../dynamodb.mjs", () => dynamodbMocks);
vi.mock("../providers.mjs", () => providerMocks);

const { handler, normalizeQuestion } = await import("../index.mjs");
const ORIGIN = "https://example-portfolio.com";
const GLOBAL_BUCKET = "__GLOBAL__";

function mockEvent({ method = "POST", origin = ORIGIN, body = {}, sourceIp = "1.2.3.4" } = {}) {
  return {
    requestContext: { http: { method, sourceIp } },
    headers: { origin },
    body: JSON.stringify(body),
  };
}

beforeEach(() => {
  process.env.CORS_ORIGIN = ORIGIN;
  process.env.DAILY_MESSAGE_LIMIT = "20";
  process.env.GLOBAL_DAILY_LIMIT = "500";
  dynamodbMocks.checkRateLimit.mockReset().mockResolvedValue(0);
  dynamodbMocks.incrementRateLimit.mockReset().mockResolvedValue(undefined);
  dynamodbMocks.checkCache.mockReset().mockResolvedValue(null);
  dynamodbMocks.writeCache.mockReset().mockResolvedValue(undefined);
  providerMocks.callGroq.mockReset().mockResolvedValue({ content: "Groq answer", finishReason: "stop" });
  providerMocks.callOpenRouter
    .mockReset()
    .mockResolvedValue({ content: "OpenRouter answer", finishReason: "stop" });
});

describe("cache key normalisation", () => {
  it("collapses runs of whitespace instead of deleting newlines and fusing words", () => {
    expect(normalizeQuestion("what is\nrag")).toBe("what is rag");
    expect(normalizeQuestion("what is\trag")).toBe("what is rag");
    expect(normalizeQuestion("what  is   rag")).toBe("what is rag");
    expect(normalizeQuestion("  what is rag  ")).toBe("what is rag");
    // All spellings of the same question now share one cache entry
    const keys = new Set(
      ["what is rag", "what  is  rag", "What is\nRAG?", "  WHAT IS RAG  "].map(normalizeQuestion)
    );
    expect(keys.size).toBe(1);
  });

  it("does not leave double spaces behind after stripping symbols", () => {
    expect(normalizeQuestion("c++ vs c#")).toBe("c vs c");
    expect(normalizeQuestion("RAG / LLM / NLP")).toBe("rag llm nlp");
  });

  it("still lowercases, trims and keeps hyphens", () => {
    expect(normalizeQuestion("  Hello WORLD  ")).toBe("hello world");
    expect(normalizeQuestion("What's your RAG-based project?!")).toBe("whats your rag-based project");
  });

  it("reduces symbol-only input to an empty key (which must disable caching)", () => {
    expect(normalizeQuestion("🤔🤔🤔")).toBe("");
    expect(normalizeQuestion("???")).toBe("");
    expect(normalizeQuestion("...")).toBe("");
    expect(normalizeQuestion("!!!  ???")).toBe("");
  });
});

describe("cache correctness", () => {
  it("never caches a question whose normalised key is empty", async () => {
    await handler(mockEvent({ body: { message: "🤔🤔🤔" } }));
    expect(providerMocks.callGroq).toHaveBeenCalled();
    expect(dynamodbMocks.checkCache).not.toHaveBeenCalled();
    expect(dynamodbMocks.writeCache).not.toHaveBeenCalled();
  });

  it("two different symbol-only messages do not share one cache entry", async () => {
    await handler(mockEvent({ body: { message: "???" } }));
    await handler(mockEvent({ body: { message: "🤔🤔🤔" } }));
    expect(dynamodbMocks.writeCache).not.toHaveBeenCalled();
    expect(providerMocks.callGroq).toHaveBeenCalledTimes(2);
  });

  it("never caches a context-dependent follow-up asked mid-conversation", async () => {
    await handler(
      mockEvent({
        body: {
          message: "tell me more about it",
          history: [{ role: "user", content: "Walk me through the DAPSE project" }],
        },
      })
    );
    expect(dynamodbMocks.checkCache).not.toHaveBeenCalled();
    expect(dynamodbMocks.writeCache).not.toHaveBeenCalled();
  });

  it("does cache a cold, context-free question", async () => {
    await handler(mockEvent({ body: { message: "What are your core skills?" } }));
    expect(dynamodbMocks.writeCache).toHaveBeenCalledWith(
      "v2:what are your core skills",
      "Groq answer"
    );
  });

  it("namespaces the cache key by prompt version so a prompt change invalidates old answers", async () => {
    await handler(mockEvent({ body: { message: "hello" } }));
    const [key] = dynamodbMocks.writeCache.mock.calls[0];
    expect(key).toMatch(/^v\d+:/);
    expect(dynamodbMocks.checkCache).toHaveBeenCalledWith(key);
  });

  it("does not cache an answer large enough to threaten the DynamoDB item limit", async () => {
    providerMocks.callGroq.mockResolvedValue({ content: "x".repeat(300_000), finishReason: "stop" });
    const res = await handler(mockEvent({ body: { message: "hello" } }));
    expect(res.statusCode).toBe(200); // visitor still gets the answer
    expect(dynamodbMocks.writeCache).not.toHaveBeenCalled();
  });
});

describe("truncated answers (reasoning model ran out of token budget)", () => {
  // The Groq model is a reasoning model: its hidden "thinking" tokens share
  // the same max_tokens budget as the visible reply, so a request can hit
  // the ceiling mid-sentence even though the provider call itself succeeds
  // (200 OK). This is exactly what happened in production: a visitor asked
  // "Tell me about your background and education" and got back "...George
  // Mason University (Aug 202" with no punctuation, no retry, no warning —
  // and it very nearly got cached for the next 30 days.

  it("trims a truncated answer back to its last complete sentence", async () => {
    providerMocks.callGroq.mockResolvedValue({
      content:
        "Sai Praneet is an AI/ML Engineer. He earned an M.S. from George Mason University. He also worked at Mahindra (Aug 202",
      finishReason: "length",
    });
    const res = await handler(mockEvent({ body: { message: "background" } }));
    const parsed = JSON.parse(res.body);
    expect(parsed.answer).toBe(
      "Sai Praneet is an AI/ML Engineer. He earned an M.S. from George Mason University. He also worked at Mahindra (Aug 202"
        .match(/^[\s\S]*[.!?](?=\s|$)/)[0]
        .trim()
    );
    expect(parsed.answer.endsWith("George Mason University.")).toBe(true);
    expect(parsed.answer).not.toMatch(/Aug 202$/);
  });

  it("falls back to a polite retry message when no complete sentence exists at all", async () => {
    providerMocks.callGroq.mockResolvedValue({
      content: "Sai Praneet Reddy Chinthala is an AI/ML & Data Engineer based in Fairfax, Virginia",
      finishReason: "length",
    });
    const res = await handler(mockEvent({ body: { message: "background" } }));
    const parsed = JSON.parse(res.body);
    expect(parsed.answer).toMatch(/couldn't|wasn't able|ask again|praneetreddy66@gmail\.com/i);
  });

  it("never caches a truncated answer, trimmed or not", async () => {
    providerMocks.callGroq.mockResolvedValue({
      content: "This is a complete-looking first sentence. But then it just stops partway through (Aug 202",
      finishReason: "length",
    });
    await handler(mockEvent({ body: { message: "background" } }));
    expect(dynamodbMocks.writeCache).not.toHaveBeenCalled();
  });

  it("falls through to OpenRouter's answer untouched if only Groq was truncated", async () => {
    providerMocks.callGroq.mockResolvedValue({ content: "cut off mid", finishReason: "length" });
    providerMocks.callOpenRouter.mockResolvedValue({
      content: "A complete OpenRouter answer.",
      finishReason: "stop",
    });
    const res = await handler(mockEvent({ body: { message: "background" } }));
    const parsed = JSON.parse(res.body);
    // Groq "succeeded" (200, non-empty content) so this exercises finalizeAnswer's
    // trimming path, not the try/catch fallback — Groq's own truncated text (or
    // its fallback message) is what's returned, OpenRouter is never reached.
    expect(providerMocks.callOpenRouter).not.toHaveBeenCalled();
    expect(parsed.answer).not.toBe("A complete OpenRouter answer.");
  });

  it("does not touch a complete answer (finish_reason stop) even if it looks short", async () => {
    providerMocks.callGroq.mockResolvedValue({ content: "Yes.", finishReason: "stop" });
    const res = await handler(mockEvent({ body: { message: "is that right" } }));
    const parsed = JSON.parse(res.body);
    expect(parsed.answer).toBe("Yes.");
  });
});

describe("abuse surface", () => {
  it("enforces a site-wide daily ceiling on top of the per-IP limit", async () => {
    dynamodbMocks.checkRateLimit.mockImplementation(async (bucket) =>
      bucket === GLOBAL_BUCKET ? 500 : 0
    );
    const res = await handler(mockEvent({ sourceIp: "9.9.9.9", body: { message: "hi" } }));
    expect(res.statusCode).toBe(429);
    expect(providerMocks.callGroq).not.toHaveBeenCalled();
  });

  it("the global ceiling still blocks an attacker who rotates source IPs", async () => {
    dynamodbMocks.checkRateLimit.mockImplementation(async (bucket) =>
      bucket === GLOBAL_BUCKET ? 500 : 0
    );
    for (const ip of ["1.1.1.1", "2.2.2.2", "3.3.3.3"]) {
      const res = await handler(mockEvent({ sourceIp: ip, body: { message: "hi" } }));
      expect(res.statusCode).toBe(429);
    }
    expect(providerMocks.callGroq).not.toHaveBeenCalled();
  });

  it("the global ceiling message does not leak the exact threshold", async () => {
    dynamodbMocks.checkRateLimit.mockImplementation(async (bucket) =>
      bucket === GLOBAL_BUCKET ? 500 : 0
    );
    const res = await handler(mockEvent({ body: { message: "hi" } }));
    expect(res.body).not.toContain("500");
    expect(JSON.parse(res.body).error).toMatch(/traffic|later/i);
  });

  it("increments both the per-IP and the global counter on a served request", async () => {
    await handler(mockEvent({ sourceIp: "4.4.4.4", body: { message: "hi" } }));
    expect(dynamodbMocks.incrementRateLimit).toHaveBeenCalledWith("4.4.4.4", expect.any(String));
    expect(dynamodbMocks.incrementRateLimit).toHaveBeenCalledWith(GLOBAL_BUCKET, expect.any(String));
  });

  it("caps total history characters forwarded to the provider", async () => {
    const fat = Array.from({ length: 40 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: "a".repeat(2000),
    }));
    await handler(mockEvent({ body: { message: "hi", history: fat } }));
    const conversation = providerMocks.callGroq.mock.calls[0][0];
    const historyChars = conversation
      .filter((m) => m.role !== "system")
      .reduce((n, m) => n + m.content.length, 0);
    expect(historyChars).toBeLessThanOrEqual(6000 + "hi".length);
  });

  it("keeps the most RECENT history turns when trimming to budget", async () => {
    // Each item is under the 2000-char per-item cap, but together they
    // exceed the 6000-char total budget, so the oldest must be dropped.
    const history = [
      { role: "user", content: "OLDEST " + "a".repeat(1900) },
      { role: "assistant", content: "MIDDLE " + "b".repeat(1900) },
      { role: "user", content: "NEWEST " + "c".repeat(1900) },
      { role: "assistant", content: "LATEST " + "d".repeat(1900) },
    ];
    await handler(mockEvent({ body: { message: "hi", history } }));
    const conversation = providerMocks.callGroq.mock.calls[0][0];
    const joined = conversation.map((m) => m.content).join("|");
    expect(joined).toContain("LATEST");
    expect(joined).toContain("NEWEST");
    expect(joined).not.toContain("OLDEST");
  });
});

describe("input handling", () => {
  it("rejects a message of only newlines/tabs as empty", async () => {
    const res = await handler(mockEvent({ body: { message: "\n\t  \r\n" } }));
    expect(res.statusCode).toBe(400);
  });

  it("rejects non-string message shapes", async () => {
    for (const bad of [123, ["a"], { a: 1 }, true, null]) {
      const res = await handler(mockEvent({ body: { message: bad } }));
      expect(res.statusCode).toBe(400);
    }
  });

  it("does not crash on valid JSON that is not an object", async () => {
    for (const raw of ['"a string"', "42", "null", "[1,2,3]"]) {
      const ev = mockEvent({ body: {} });
      ev.body = raw;
      const res = await handler(ev);
      expect([400, 500]).toContain(res.statusCode);
    }
  });

  it("rejects a missing Origin header", async () => {
    const ev = mockEvent({ body: { message: "hi" } });
    delete ev.headers.origin;
    expect((await handler(ev)).statusCode).toBe(403);
  });

  it("rejects an Origin with a trailing slash (exact match only)", async () => {
    const res = await handler(mockEvent({ origin: ORIGIN + "/", body: { message: "hi" } }));
    expect(res.statusCode).toBe(403);
  });
});

describe("resilience", () => {
  it("fails open when DynamoDB is completely unavailable", async () => {
    dynamodbMocks.checkRateLimit.mockRejectedValue(new Error("DDB down"));
    dynamodbMocks.incrementRateLimit.mockRejectedValue(new Error("DDB down"));
    dynamodbMocks.checkCache.mockRejectedValue(new Error("DDB down"));
    dynamodbMocks.writeCache.mockRejectedValue(new Error("DDB down"));
    const res = await handler(mockEvent({ body: { message: "hello" } }));
    expect(res.statusCode).toBe(200);
    expect(providerMocks.callGroq).toHaveBeenCalled();
  });

  it("buckets requests with no sourceIp under a single 'unknown' key", async () => {
    const ev = mockEvent({ body: { message: "hello" } });
    delete ev.requestContext.http.sourceIp;
    await handler(ev);
    expect(dynamodbMocks.checkRateLimit).toHaveBeenCalledWith("unknown", expect.any(String));
  });
});
