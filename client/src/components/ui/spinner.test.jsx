import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Spinner from "./spinner";

describe("Spinner component", () => {
  it("renders with default loading role and aria-label", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeDefined();
    expect(spinner.getAttribute("aria-label")).toBe("Loading");
  });
});
