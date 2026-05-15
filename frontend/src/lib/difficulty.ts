export function getDifficultyColor(difficulty: number | null | undefined): string {
  if (difficulty == null) return "#808080";
  if (difficulty < 400) return "#808080";
  if (difficulty < 800) return "#804000";
  if (difficulty < 1200) return "#008000";
  if (difficulty < 1600) return "#00C0C0";
  if (difficulty < 2000) return "#0000FF";
  if (difficulty < 2400) return "#C0C000";
  if (difficulty < 2800) return "#FF8000";
  return "#FF0000";
}

export function getDifficultyLabel(difficulty: number | null | undefined): string {
  if (difficulty == null) return "?";
  return Math.round(difficulty).toString();
}