// ============================================================
// Generic sort utility — demonstrates `keyof` constraint
// ============================================================

/**
 * Sort an array of objects by any property that exists on the object.
 *
 * The second parameter `key` is constrained with `keyof T`, meaning the
 * compiler only accepts a property name that actually exists on type T.
 * Calling sortBy(items, "nonexistent") is a compile-time error.
 *
 * `keyof T` produces a union of all property names of T.
 */
export function sortBy<T>(
  items: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;
    if (aVal == null) return direction === "asc" ? -1 : 1;
    if (bVal == null) return direction === "asc" ? 1 : -1;

    const comparison =
      typeof aVal === "string" && typeof bVal === "string"
        ? aVal.localeCompare(bVal)
        : (aVal as number) - (bVal as number);

    return direction === "asc" ? comparison : -comparison;
  });
}
