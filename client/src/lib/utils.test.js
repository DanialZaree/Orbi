import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("should resolve tailwind conflict classes cleanly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle conditionals and falsy values", () => {
    const isHidden = false;
    expect(cn("base", isHidden && "hidden", null, undefined, "extra")).toBe("base extra");
  });
});
