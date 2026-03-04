interface Props {
  recommendations: string[];
}

export function RecommendationPanel({ recommendations }: Props) {
  return (
    <div className="glass-card">
      <h3>Recommendations</h3>

      <ul>
        {recommendations.map((r, index) => (
          <li key={index}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
