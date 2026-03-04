import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface Props {
  focus: number;
  sleep: number;
  workload: number;
  distractions: number;
}

export function ProductivityPie({
  focus,
  sleep,
  workload,
  distractions,
}: Props) {
  const data = [
    { name: "Focus", value: focus },
    { name: "Sleep", value: sleep },
    { name: "Workload", value: workload },
    { name: "Distractions", value: distractions },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

  return (
    <div className="glass-card">
      <h3>Productivity Factor Analysis</h3>

      <PieChart width={250} height={250}>
        <Pie data={data} dataKey="value" outerRadius={90}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>

        <Tooltip />
      </PieChart>
    </div>
  );
}
