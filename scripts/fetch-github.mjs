/**
 * Build-time GitHub enrichment.
 *
 * Reads the project list from src/data/content.js (single source of truth),
 * fetches public repo metadata from the GitHub API, and writes the result to
 * src/data/github.json for the UI to import.
 *
 * Why build time rather than runtime:
 *   - no API key ships to the browser, and no CORS problem;
 *   - visitors never pay the latency of a GitHub round trip;
 *   - GitHub's unauthenticated limit (60 req/hr) is irrelevant when this runs
 *     once per deploy instead of once per visitor.
 *
 * This script must NEVER fail a build. GitHub being slow or rate-limiting is
 * not a reason for the site to stop deploying, so every failure path falls
 * back to whatever github.json already holds.
 */
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "src/data/github.json");

const TIMEOUT_MS = 8000;

/** "https://github.com/owner/repo" -> "owner/repo" (null if not a repo URL) */
export function parseRepoPath(url) {
  if (typeof url !== "string") return null;
  const m = url.match(/^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s?#]+)/i);
  if (!m) return null;
  return `${m[1]}/${m[2].replace(/\.git$/i, "")}`;
}

/** Only the fields the UI actually renders — keeps the committed JSON small. */
export function shapeRepo(raw) {
  return {
    stars: raw.stargazers_count ?? 0,
    forks: raw.forks_count ?? 0,
    language: raw.language ?? null,
    pushedAt: raw.pushed_at ?? null,
    topics: Array.isArray(raw.topics) ? raw.topics.slice(0, 6) : [],
  };
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    return {};
  }
}

async function fetchRepo(repoPath, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return shapeRepo(await res.json());
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const existing = await readExisting();

  let projects;
  try {
    // pathToFileURL matters here: on Windows an absolute path is "C:\..." and
    // Node's ESM loader reads the drive letter as a URL scheme, failing with
    // "Received protocol 'c:'". A file:// URL is portable across platforms.
    const contentUrl = pathToFileURL(resolve(ROOT, "src/data/content.js")).href;
    ({ projects } = await import(contentUrl));
  } catch (err) {
    console.warn(`[github] could not read content.js (${err.message}) — keeping existing data`);
    return;
  }

  const repoPaths = [...new Set(projects.map((p) => parseRepoPath(p.github)).filter(Boolean))];

  if (repoPaths.length === 0) {
    console.log("[github] no GitHub URLs in content.js — nothing to fetch");
    return;
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-build-script",
    // Optional: set GITHUB_TOKEN in the Vercel dashboard to raise the rate
    // limit from 60/hr to 5000/hr. Not required for public repos.
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };

  const results = await Promise.allSettled(repoPaths.map((p) => fetchRepo(p, headers)));

  const data = { ...existing };
  let ok = 0;
  results.forEach((r, i) => {
    const path = repoPaths[i];
    if (r.status === "fulfilled") {
      data[path] = r.value;
      ok++;
    } else {
      // Keep the previously committed value rather than dropping the repo.
      console.warn(`[github] ${path}: ${r.reason?.message ?? r.reason} — keeping previous value`);
    }
  });

  data._fetchedAt = new Date().toISOString();

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`[github] wrote ${ok}/${repoPaths.length} repos to src/data/github.json`);
}

// Only run when invoked directly, so the helpers above stay unit-testable.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((err) => {
    // Deliberately exit 0: a failed enrichment must not fail the deploy.
    console.warn(`[github] enrichment skipped: ${err.message}`);
    process.exit(0);
  });
}
