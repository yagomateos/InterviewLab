import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { sortBy } from "../src/utils/sortBy.ts";

describe("sortBy", () => {
  const items = [
    { id: 3, name: "Charlie", score: 85 },
    { id: 1, name: "Alice", score: 92 },
    { id: 2, name: "Bob", score: 78 },
  ];

  it("should sort by string property ascending", () => {
    const sorted = sortBy(items, "name", "asc");
    assert.equal(sorted[0].name, "Alice");
    assert.equal(sorted[2].name, "Charlie");
  });

  it("should sort by number property descending", () => {
    const sorted = sortBy(items, "score", "desc");
    assert.equal(sorted[0].score, 92);
    assert.equal(sorted[2].score, 78);
  });

  it("should sort by id ascending", () => {
    const sorted = sortBy(items, "id", "asc");
    assert.equal(sorted[0].id, 1);
    assert.equal(sorted[2].id, 3);
  });

  it("should not mutate the original array", () => {
    const original = [...items];
    sortBy(items, "name", "asc");
    assert.deepEqual(items, original);
  });

  it("should handle empty arrays", () => {
    const sorted = sortBy([], "name", "asc");
    assert.equal(sorted.length, 0);
  });
});
