import { describe, it, expect } from "vitest";
import { parseRepoPath, shapeRepo } from "../fetch-github.mjs";

describe("parseRepoPath", () => {
  it("extracts owner/repo from a normal GitHub URL", () => {
    expect(parseRepoPath("https://github.com/praneetreddy3/Bridges-NBI-Analysis")).toBe(
      "praneetreddy3/Bridges-NBI-Analysis"
    );
  });

  it("tolerates trailing paths, query strings and .git suffixes", () => {
    expect(parseRepoPath("https://github.com/a/b/tree/main")).toBe("a/b");
    expect(parseRepoPath("https://github.com/a/b?tab=readme")).toBe("a/b");
    expect(parseRepoPath("https://github.com/a/b.git")).toBe("a/b");
    expect(parseRepoPath("https://www.github.com/a/b")).toBe("a/b");
  });

  it("returns null for a project with no repo (github: null)", () => {
    expect(parseRepoPath(null)).toBeNull();
    expect(parseRepoPath(undefined)).toBeNull();
    expect(parseRepoPath("")).toBeNull();
  });

  it("returns null for non-GitHub URLs so nothing else gets fetched", () => {
    expect(parseRepoPath("https://gitlab.com/a/b")).toBeNull();
    expect(parseRepoPath("https://example.com/github.com/a/b")).toBeNull();
  });
});

describe("shapeRepo", () => {
  it("keeps only the fields the UI renders", () => {
    const shaped = shapeRepo({
      stargazers_count: 12,
      forks_count: 3,
      language: "Python",
      pushed_at: "2026-01-04T10:00:00Z",
      topics: ["rag", "nlp"],
      // fields that must NOT be carried into the committed JSON
      owner: { login: "someone" },
      description: "x".repeat(5000),
    });
    expect(shaped).toEqual({
      stars: 12,
      forks: 3,
      language: "Python",
      pushedAt: "2026-01-04T10:00:00Z",
      topics: ["rag", "nlp"],
    });
  });

  it("defaults missing fields instead of emitting undefined", () => {
    expect(shapeRepo({})).toEqual({
      stars: 0,
      forks: 0,
      language: null,
      pushedAt: null,
      topics: [],
    });
  });

  it("caps topics so one noisy repo cannot bloat the bundle", () => {
    const shaped = shapeRepo({ topics: Array.from({ length: 30 }, (_, i) => `t${i}`) });
    expect(shaped.topics).toHaveLength(6);
  });
});
