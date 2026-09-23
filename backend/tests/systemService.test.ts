import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Test the system service's async behavior — validates that
// simulateExternalService resolves and that Promise.all runs
// operations concurrently (total time < sum of delays).
import {
  simulateExternalService,
  failingService,
  runAsyncDemo,
} from "../src/services/systemService.ts";

describe("systemService", () => {
  it("simulateExternalService should resolve with a completion message", async () => {
    const result = await simulateExternalService(10);
    assert.equal(result, "Completed after 10ms");
  });

  it("failingService should reject", async () => {
    await assert.rejects(failingService(), /External difficulty service unavailable/);
  });

  it("runAsyncDemo should run concurrently — total < sum of delays", async () => {
    const result = await runAsyncDemo();
    const sumOfDelays = result.operations.reduce((sum, op) => sum + op.delay, 0);
    assert.ok(
      result.totalElapsedMs < sumOfDelays,
      `Expected total ${result.totalElapsedMs}ms to be less than sequential ${sumOfDelays}ms`
    );
    assert.equal(result.operations.length, 4);
  });

  it("Promise.allSettled should return both fulfilled and rejected", async () => {
    const results = await Promise.allSettled([
      simulateExternalService(10),
      failingService(),
    ]);
    assert.equal(results[0].status, "fulfilled");
    assert.equal(results[1].status, "rejected");
  });
});
