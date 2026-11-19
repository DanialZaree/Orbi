import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./index";

describe("NotFound component", () => {
  it("renders 404 heading and back link", () => {
    render(<NotFound />);
    expect(screen.getByText(/404 - Page Not Found/i)).toBeDefined();
    expect(screen.getByText(/Go Back Home/i)).toBeDefined();
  });
});
