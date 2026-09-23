import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sortBy } from "../src/utils/sortBy.ts";

// Test the generic sortBy function — this is the function that demonstrates
// the `keyof` constraint in TypeScript. The second parameter must be a
// valid property name of the item type.
describe("sortBy (frontend)", () => {
  interface TestItem {
    id: number;
    name: string;
    difficulty: string;
  }

  const items: TestItem[] = [
    { id: 3, name: "Charlie", difficulty: "hard" },
    { id: 1, name: "Alice", difficulty: "easy" },
    { id: 2, name: "Bob", difficulty: "medium" },
  ];

  it("should sort by name ascending", () => {
    const sorted = sortBy(items, "name", "asc");
    assert.equal(sorted[0].name, "Alice");
    assert.equal(sorted[1].name, "Bob");
    assert.equal(sorted[2].name, "Charlie");
  });

  it("should sort by id ascending (default direction)", () => {
    const sorted = sortBy(items, "id");
    assert.equal(sorted[0].id, 1);
    assert.equal(sorted[2].id, 3);
  });

  it("should sort by difficulty descending", () => {
    const sorted = sortBy(items, "difficulty", "desc");
    assert.equal(sorted[0].difficulty, "medium");
    assert.equal(sorted[2].difficulty, "easy");
  });

  it("should not mutate the original array", () => {
    const original = [...items];
    sortBy(items, "name", "asc");
    assert.deepEqual(items.map((i) => i.id), original.map((i) => i.id));
  });

  it("should handle empty arrays", () => {
    const sorted = sortBy([], "name", "asc");
    assert.equal(sorted.length, 0);
  });

  it("should handle single-element arrays", () => {
    const sorted = sortBy([items[0]], "name", "asc");
    assert.equal(sorted.length, 1);
    assert.equal(sorted[0].name, "Charlie");
  });
});
