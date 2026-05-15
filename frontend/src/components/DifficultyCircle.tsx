import { getDifficultyInfo } from "../lib/difficulty";

interface Props {
  difficulty: number | null | undefined;
  isExperimental?: boolean;
  size?: number;
  id?: string;
}

export default function DifficultyCircle({
  difficulty,
  isExperimental = false,
  size = 14,
  id,
}: Props) {
  const info = getDifficultyInfo(difficulty);
  const fillPercent = Math.round(info.fillRatio * 100);

  const tooltip =
    difficulty == null
      ? "Difficulty: ?"
      : `Difficulty: ${Math.round(difficulty)} (${info.label})`;

  if (difficulty != null && difficulty >= 3200) {
    const metalGradient =
      difficulty >= 4000
        ? "linear-gradient(135deg, #FFD700 0%, #FFC700 50%, #FFD700 100%)"
        : difficulty >= 3600
          ? "linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #C0C0C0 100%)"
          : "linear-gradient(135deg, #965C2C 0%, #B47340 50%, #965C2C 100%)";

    return (
      <span
        id={id}
        title={tooltip}
        style={{
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "50%",
          background: metalGradient,
          border: "1px solid #555",
          marginRight: 4,
          verticalAlign: "middle",
        }}
      />
    );
  }

  const background = isExperimental
    ? `repeating-linear-gradient(45deg, ${info.color}, ${info.color} 2px, #fff 2px, #fff 4px)`
    : `linear-gradient(to top, ${info.color} 0%, ${info.color} ${fillPercent}%, transparent ${fillPercent}%, transparent 100%)`;

  return (
    <span
      id={id}
      title={tooltip}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${info.color}`,
        background,
        marginRight: 4,
        verticalAlign: "middle",
        boxSizing: "border-box",
      }}
    />
  );
}
