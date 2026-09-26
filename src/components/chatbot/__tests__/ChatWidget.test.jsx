import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatWidget from "../ChatWidget";

// The widget stays closed on mount so it never covers the page for a first-time
// visitor. Every test that touches the conversation therefore has to open it
// first, exactly as a real visitor would.
async function openWidget(user) {
  render(<ChatWidget />);
  await user.click(screen.getByRole("button", { name: "Open chat" }));
}

describe("ChatWidget", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays closed on mount and shows only the launcher", () => {
    render(<ChatWidget />);
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Ask me anything...")).not.toBeInTheDocument();
  });

  it("opens on click and greets the visitor", async () => {
    const user = userEvent.setup();
    await openWidget(user);
    // The floating launcher button ("Minimize chat") and the panel header's
    // own close button ("Close chat") are two distinct controls and must
    // keep distinct accessible names -- otherwise assistive tech can't tell
    // them apart, and getByRole below would match both.
    expect(screen.getByRole("button", { name: "Minimize chat" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close chat" })).toBeInTheDocument();
    expect(
      screen.getByText(/Hi, I'm an assistant that can help you find information/)
    ).toBeInTheDocument();
  });

  it("does not call fetch when the submitted input is whitespace-only", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const user = userEvent.setup();
    await openWidget(user);
    const textarea = screen.getByPlaceholderText("Ask me anything...");
    await user.type(textarea, "   ");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("appends the user message then the assistant reply on a successful call", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Hi, I'm the assistant." }),
    });
    const user = userEvent.setup();
    await openWidget(user);
    const textarea = screen.getByPlaceholderText("Ask me anything...");
    await user.type(textarea, "Tell me about your background");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText("Tell me about your background")).toBeInTheDocument();
    expect(await screen.findByText("Hi, I'm the assistant.")).toBeInTheDocument();
  });

  it("shows a rate-limit message on a 429 response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: "Daily limit of 20 messages reached. Try again tomorrow." }),
    });
    const user = userEvent.setup();
    await openWidget(user);
    const textarea = screen.getByPlaceholderText("Ask me anything...");
    await user.type(textarea, "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(
      await screen.findByText("Daily limit of 20 messages reached. Try again tomorrow.")
    ).toBeInTheDocument();
  });

  it("shows a generic error message on a network failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    await openWidget(user);
    const textarea = screen.getByPlaceholderText("Ask me anything...");
    await user.type(textarea, "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(
      await screen.findByText("Couldn't reach the server. Check your connection and try again.")
    ).toBeInTheDocument();
  });

  it("hides SuggestedQuestions once a message has been sent", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ answer: "answer" }),
    });
    const user = userEvent.setup();
    await openWidget(user);
    expect(screen.getByTestId("suggested-questions")).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText("Ask me anything...");
    await user.type(textarea, "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(screen.queryByTestId("suggested-questions")).not.toBeInTheDocument());
  });
});
