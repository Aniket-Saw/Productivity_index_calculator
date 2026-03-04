import React from "react";

interface Props {
  score: number;
}

export function ProductivityGauge({ score }: Props) {
  const getColor = () => {
    if (score < 30) return "#ef4444";
    if (score < 50) return "#f59e0b";
    if (score < 70) return "#10b981";
    if (score < 85) return "#3b82f6";
    return "#8b5cf6";
  };

  return (
    <div className="glass-card" style={{ textAlign: "center" }}>
      <h3>Productivity Score</h3>

      <div
        style={{
          fontSize: "3rem",
          fontWeight: 700,
          color: getColor(),
        }}>
        {score}
      </div>

      <p>Productivity Level</p>
    </div>
  );
}
