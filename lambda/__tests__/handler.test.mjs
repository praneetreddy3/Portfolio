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
  dynamodbMocks.checkRateLimit.mockReset().mockResolvedValue(0);
  dynamodbMocks.incrementRateLimit.mockReset().mockResolvedValue(undefined);
  dynamodbMocks.checkCache.mockReset().mockResolvedValue(null);
  dynamodbMocks.writeCache.mockReset().mockResolvedValue(undefined);
  providerMocks.callGroq.mockReset().mockResolvedValue("Groq answer");
  providerMocks.callOpenRouter.mockReset().mockResolvedValue("OpenRouter answer");
});

describe("normalizeQuestion", () => {
  it("lowercases and trims", () => {
    expect(normalizeQuestion("  Hello WORLD  ")).toBe("hello world");
  });

  it("strips special characters but keeps hyphens", () => {
    expect(normalizeQuestion("What's your RAG-based project?!")).toBe(
      "whats your rag-based project"
    );
  });

  it("is idempotent on an already-normalized string", () => {
    const n = normalizeQuestion("already normalized-string");
    expect(normalizeQuestion(n)).toBe(n);
  });

  it("returns an empty string for an empty input", () => {
    expect(normalizeQuestion("")).toBe("");
  });
});

describe("handler guard layer", () => {
  it.each(["GET", "PUT", "PATCH", "DELETE", "HEAD"])("returns 405 for %s", async (method) => {
    const res = await handler(mockEvent({ method }));
    expect(res.statusCode).toBe(405);
  });

  it("returns 403 when origin does not match CORS_ORIGIN", async () => {
    const res = await handler(mockEvent({ origin: "https://evil.example.com" }));
    expect(res.statusCode).toBe(403);
  });

  it("returns 400 when message is missing", async () => {
    const res = await handler(mockEvent({ body: {} }));
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when message is whitespace-only", async () => {
    const res = await handler(mockEvent({ body: { message: "   " } }));
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 on invalid JSON body", async () => {
    const event = mockEvent({ body: { message: "hi" } });
    event.body = "{not valid json";
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
  });
});

describe("rate limiting", () => {
  it("returns 429 when count meets the daily limit, without calling any provider", async () => {
    dynamodbMocks.checkRateLimit.mockResolvedValue(20);
    const res = await handler(mockEvent({ body: { message: "hello" } }));
    expect(res.statusCode).toBe(429);
    expect(providerMocks.callGroq).not.toHaveBeenCalled();
    expect(providerMocks.callOpenRouter).not.toHaveBeenCalled();
  });

  it("proceeds (200) when count is one below the daily limit", async () => {
    dynamodbMocks.checkRateLimit.mockResolvedValue(19);
    const res = await handler(mockEvent({ body: { message: "hello" } }));
    expect(res.statusCode).toBe(200);
  });
});

describe("answer cache", () => {
  it("returns the cached answer without calling any AI provider", async () => {
    dynamodbMocks.checkCache.mockResolvedValue("Cached answer");
    const res = await handler(mockEvent({ body: { message: "hello" } }));
    const parsed = JSON.parse(res.body);
    expect(parsed.answer).toBe("Cached answer");
    expect(providerMocks.callGroq).not.toHaveBeenCalled();
    expect(providerMocks.callOpenRouter).not.toHaveBeenCalled();
  });
});

describe("provider fallback", () => {
  it("falls through to OpenRouter when Groq fails", async () => {
    providerMocks.callGroq.mockRejectedValue(new Error("groq down"));
    const res = await handler(mockEvent({ body: { message: "hello" } }));
    const parsed = JSON.parse(res.body);
    expect(parsed.answer).toBe("OpenRouter answer");
  });

  it("returns a graceful static fallback when both providers fail, and does not cache it", async () => {
    providerMocks.callGroq.mockRejectedValue(new Error("groq down"));
    providerMocks.callOpenRouter.mockRejectedValue(new Error("openrouter down"));
    const res = await handler(mockEvent({ body: { message: "hello" } }));
    const parsed = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(parsed.answer).toMatch(/praneetreddy66@gmail\.com|linkedin\.com/);
    expect(dynamodbMocks.writeCache).not.toHaveBeenCalled();
  });

  it("caches a real AI-generated answer under a prompt-versioned key", async () => {
    await handler(mockEvent({ body: { message: "hello" } }));
    expect(dynamodbMocks.writeCache).toHaveBeenCalledWith("v2:hello", "Groq answer");
  });
});

describe("response headers", () => {
  it("never includes API key env values in the response body", async () => {
    process.env.GROQ_API_KEY = "secret-groq-key";
    process.env.OPENROUTER_API_KEY = "secret-openrouter-key";
    const res = await handler(mockEvent({ body: { message: "hello" } }));
    expect(res.body).not.toContain("secret-groq-key");
    expect(res.body).not.toContain("secret-openrouter-key");
  });

  // Access-Control-Allow-Origin is deliberately NOT set by response() in
  // index.mjs — the Lambda Function URL's own FunctionUrlConfig.Cors block
  // (template.yaml) injects it at the AWS infra layer, outside this
  // handler. Asserting it here was testing something this function was
  // never supposed to do; the real CORS guard this suite covers is the
  // 403 in "returns 403 when origin does not match CORS_ORIGIN" above.
});

describe("message length limits", () => {
  it("returns 400 when message exceeds MAX_MESSAGE_LENGTH", async () => {
    const res = await handler(mockEvent({ body: { message: "a".repeat(2001) } }));
    expect(res.statusCode).toBe(400);
  });

  it("accepts a message exactly at MAX_MESSAGE_LENGTH", async () => {
    const res = await handler(mockEvent({ body: { message: "a".repeat(2000) } }));
    expect(res.statusCode).toBe(200);
  });

  it("silently drops oversized history items instead of failing the request", async () => {
    const res = await handler(
      mockEvent({
        body: {
          message: "hello",
          history: [
            { role: "user", content: "a".repeat(2001) },
            { role: "assistant", content: "a reasonable prior answer" },
          ],
        },
      })
    );
    expect(res.statusCode).toBe(200);
  });
});
