/**
 * Escapes special regex characters in a string so it can be safely used in a MongoDB $regex query.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
