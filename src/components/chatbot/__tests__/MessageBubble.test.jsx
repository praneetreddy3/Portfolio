import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageBubble from "../MessageBubble";

function baseMessage(overrides = {}) {
  return { id: "1", role: "assistant", text: "Hello there", timestamp: 0, ...overrides };
}

describe("MessageBubble", () => {
  it("renders assistant text without URLs as plain text with no links", () => {
    render(<MessageBubble message={baseMessage({ text: "No links here." })} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("No links here.")).toBeInTheDocument();
  });

  it("renders exactly one link for an assistant message with one URL", () => {
    const url = "https://github.com/praneetreddy3/Bridges-NBI-Analysis";
    render(<MessageBubble message={baseMessage({ text: `Check it out: ${url}` })} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", url);
    expect(links[0]).toHaveAttribute("target", "_blank");
    expect(links[0].getAttribute("rel")).toEqual(expect.stringContaining("noreferrer"));
  });

  it("renders a visitor message containing a URL as plain text, no links", () => {
    const url = "https://example.com";
    render(<MessageBubble message={baseMessage({ role: "user", text: `visit ${url}` })} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(`visit ${url}`)).toBeInTheDocument();
  });
});
