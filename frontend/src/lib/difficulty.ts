export interface DifficultyInfo {
  color: string;
  label: string;
  fillRatio: number;
}

export function getDifficultyInfo(
  difficulty: number | null | undefined,
): DifficultyInfo {
  if (difficulty == null) {
    return { color: "#808080", label: "?", fillRatio: 0 };
  }

  const clipped = Math.max(difficulty, 1);

  if (clipped < 400) return { color: "#808080", label: "Newbie", fillRatio: clipped / 400 };
  if (clipped < 800) return { color: "#804000", label: "Pupil", fillRatio: (clipped - 400) / 400 };
  if (clipped < 1200) return { color: "#008000", label: "Specialist", fillRatio: (clipped - 800) / 400 };
  if (clipped < 1600) return { color: "#00C0C0", label: "Expert", fillRatio: (clipped - 1200) / 400 };
  if (clipped < 2000) return { color: "#0000FF", label: "Candidate Master", fillRatio: (clipped - 1600) / 400 };
  if (clipped < 2400) return { color: "#C0C000", label: "Master", fillRatio: (clipped - 2000) / 400 };
  if (clipped < 2800) return { color: "#FF8000", label: "Grandmaster", fillRatio: (clipped - 2400) / 400 };
  if (clipped < 3200) return { color: "#FF0000", label: "Legendary Grandmaster", fillRatio: (clipped - 2800) / 400 };
  if (clipped < 3600) return { color: "#965C2C", label: "Bronze", fillRatio: 1 };
  if (clipped < 4000) return { color: "#808080", label: "Silver", fillRatio: 1 };
  return { color: "#FFD700", label: "Gold", fillRatio: 1 };
}

export function getDifficultyColor(difficulty: number | null | undefined): string {
  return getDifficultyInfo(difficulty).color;
}

export function getDifficultyLabel(difficulty: number | null | undefined): string {
  if (difficulty == null) return "?";
  return Math.round(difficulty).toString();
}