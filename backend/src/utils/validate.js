export function sanitizeTag(input) {
  if (typeof input != "string") return null;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 50) return null;
  if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) return null;
  return trimmed;
}
export function isValidUsername(input) {
  if (typeof input != "string") return false;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 30) return false;
  return /^[a-zA-Z0-9_\-]+$/.test(trimmed);
}
