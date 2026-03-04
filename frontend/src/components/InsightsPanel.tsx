interface Props {
  insights: string[];
}

export function InsightsPanel({ insights }: Props) {
  return (
    <div className="glass-card">
      <h3>Insights</h3>

      <ul>
        {insights.map((i, index) => (
          <li key={index}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
