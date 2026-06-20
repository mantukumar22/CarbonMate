import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getEcoBuddyResponse, geminiService } from "../lib/gemini";

describe("EcoBuddy Local Fallback & TIMEOUT Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("handles standard successful server raw outputs cleanly", async () => {
    // Standard spy-injection on the geminiService object
    vi.spyOn(geminiService, "callGemini").mockResolvedValue('{"co2": 4.5, "tips": ["Success tips"]}');

    const result = await getEcoBuddyResponse("drove car 10km");
    expect(result.co2).toBe(4.5);
    expect(result.source).toBe("gemini");
  });

  it("safely falls back to local estimators when Gemini API calls time out", async () => {
    // High-latency spy to trigger timeout path
    vi.spyOn(geminiService, "callGemini").mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          setTimeout(() => resolve('{"co2": 15.0}'), 20000);
        })
    );

    // Advance clocks asynchronously to drive the timeout race block
    const promise = getEcoBuddyResponse("drove car 10km");
    await vi.advanceTimersByTimeAsync(9000);
    const result = await promise;

    expect(result.co2).toBeGreaterThan(0);
    expect(result.source).toBe("fallback");
    expect(result.tips?.[0]).toContain("Offline");
  });
});
