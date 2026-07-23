/** Register system-specific Handlebars helpers (prefixed to avoid collisions). */
export function registerHandlebarsHelpers() {
  // Array [0, 1, … n-1] for rendering fixed-length tracks.
  Handlebars.registerHelper("laundryTimes", (n) => Array.from({ length: Math.max(0, n) }, (_, i) => i));

  // Strict equality.
  Handlebars.registerHelper("laundryEq", (a, b) => a === b);

  // Numeric addition (e.g. 0-based index -> 1-based label).
  Handlebars.registerHelper("laundryAdd", (a, b) => Number(a) + Number(b));

  // "less than" — used to decide whether a pip / box is filled.
  Handlebars.registerHelper("laundryLt", (a, b) => Number(a) < Number(b));

  // "less than or equal".
  Handlebars.registerHelper("laundryLte", (a, b) => Number(a) <= Number(b));

  // Concatenate strings (for building data paths / labels).
  Handlebars.registerHelper("laundryConcat", (...args) => args.slice(0, -1).join(""));
}
