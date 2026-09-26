import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageList from "../MessageList";

describe("MessageList", () => {
  let scrollIntoViewSpy;

  beforeEach(() => {
    scrollIntoViewSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls scrollIntoView when a message is appended", () => {
    const { rerender } = render(<MessageList messages={[]} isLoading={false} />);
    scrollIntoViewSpy.mockClear();
    rerender(
      <MessageList messages={[{ id: "1", role: "assistant", text: "hi", timestamp: 0 }]} isLoading={false} />
    );
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });

  it("renders the typing indicator when isLoading is true", () => {
    render(<MessageList messages={[]} isLoading />);
    expect(
      screen.getByTestId("message-list").querySelector("[aria-hidden='true']")
    ).toBeInTheDocument();
  });

  it("does not render the typing indicator when isLoading is false", () => {
    render(<MessageList messages={[]} isLoading={false} />);
    expect(
      screen.getByTestId("message-list").querySelector("[aria-hidden='true']")
    ).not.toBeInTheDocument();
  });
});
