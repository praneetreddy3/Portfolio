# Portfolio + AI Assistant

Personal portfolio for Sai Praneet Reddy Chinthala, with an embedded AI assistant
that answers questions about my background, skills and projects.

**Live:** https://saipraneetchinthala.vercel.app

The interesting part of this repo is not the site — it is the assistant behind it,
which runs entirely inside the AWS free tier and is built to stay there under abuse.

---

## Architecture

```
Browser ──POST──► Lambda Function URL  ──►  Groq  (primary)
                        │                    └── OpenRouter (fallback)
                        │
                        ├── DynamoDB: RateTable    (per-IP + global daily counters, TTL 48h)
                        └── DynamoDB: AnswerCache  (prompt-versioned answers, TTL 30d)
```

No API Gateway — a Lambda Function URL is sufficient for a single POST route and
removes a billable component. No server, no container, no always-on cost.

### Design decisions worth explaining

**Two providers, not one.** Groq serves the request; OpenRouter takes over if Groq
errors or times out. If both fail the handler returns a static message with direct
contact details rather than an error — a visitor should never hit a dead end.

**Rate limiting is per-IP *and* global.** Per-IP alone is theatre: rotating source
addresses walks straight through it. A site-wide daily ceiling is the control that
actually bounds spend, so it exists as a separate counter in the same table.

**The cache key carries a prompt version.** Cached answers live for 30 days. Without
a version in the key, editing the system prompt leaves month-old answers in
circulation that were written under the old instructions. Bumping `PromptVersion`
on deploy invalidates them atomically.

**Only context-free questions are cached.** "Tell me more about it" means something
different depending on what preceded it, so caching it globally would serve one
visitor's context to everyone else. Questions asked mid-conversation bypass the cache.

**`max_tokens` is set.** Response latency scales with tokens generated, not tokens
read. Leaving it unset lets one rambling answer become a multi-second wait.

**Failures are open, not closed.** If DynamoDB is unavailable the request still
reaches the model. Losing rate limiting for a few minutes is better than the
assistant going down.

---

## Local development

```bash
npm install
npm run dev            # http://localhost:5173
npm test               # 69 tests
npm run lint
npm run build          # also refreshes GitHub repo data
```

Create `.env.local`:

```
VITE_LAMBDA_URL=https://<your-function-url>.lambda-url.us-east-1.on.aws/
```

### Deploying the backend

```bash
cd lambda
sam build
sam deploy --parameter-overrides \
  CorsOrigin="https://your-domain.com" \
  GroqApiKey="..." \
  OpenRouterApiKey="..." \
  DailyMessageLimit="20" \
  GlobalDailyLimit="500" \
  PromptVersion="2" \
  MaxOutputTokens="400"
```

`CorsOrigin` must be an exact string match for the site's origin — the handler
rejects anything else, and this is the most common cause of a working local build
failing in production.

---

## Testing

69 tests across the frontend, the Lambda handler and the build tooling.

The handler suite covers the guard layer, rate limiting, provider fallback and the
cache. A separate edge-case suite locks in fixes for problems found by audit rather
than by feature work:

- cache keys collapsing distinct questions together
- symbol-only input producing an empty, shared cache key
- context-dependent follow-ups being cached globally
- source-IP rotation bypassing rate limits
- caller-supplied history inflating per-request token cost
- answers large enough to threaten DynamoDB's item size limit

---

## Stack

React 19 · Vite · Tailwind 4 · Framer Motion · AWS Lambda (Node 22, arm64) ·
DynamoDB · AWS SAM · Vitest

The hero backdrop is hand-drawn Canvas 2D. It was previously a Three.js scene,
which cost ~235 KB gzipped — over two thirds of the site's total JavaScript, for
decoration. Replacing it removed 883 KB from the bundle.
