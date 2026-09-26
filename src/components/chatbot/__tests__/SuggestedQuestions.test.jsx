import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuggestedQuestions from "../SuggestedQuestions";
import { SUGGESTED_QUESTIONS } from "../../../data/suggestedQuestions";

describe("SuggestedQuestions", () => {
  it("renders nothing when visible is false", () => {
    const { container } = render(<SuggestedQuestions visible={false} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders all default questions as buttons when visible is true", () => {
    render(<SuggestedQuestions visible onSelect={() => {}} />);
    for (const q of SUGGESTED_QUESTIONS) {
      expect(screen.getByRole("button", { name: q })).toBeInTheDocument();
    }
  });

  it("calls onSelect with the question text when a chip is clicked", async () => {
    const onSelect = vi.fn();
    render(<SuggestedQuestions visible onSelect={onSelect} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: SUGGESTED_QUESTIONS[0] }));
    expect(onSelect).toHaveBeenCalledWith(SUGGESTED_QUESTIONS[0]);
  });
});
