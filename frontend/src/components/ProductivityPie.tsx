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
    { name: "Focus Time", value: focus, unit: "hrs" },
    { name: "Sleep Duration", value: sleep, unit: "hrs" },
    { name: "Workload", value: workload, unit: "/10" },
    { name: "Distractions", value: distractions, unit: "count" },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="glass-card">
      <h3>Productivity Factor Analysis</h3>

      <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        <PieChart width={220} height={220}>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={85}
            innerRadius={45}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.85rem",
            }}
          />
        </PieChart>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, minWidth: "140px" }}>
          {data.map((entry, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: COLORS[index],
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                  {entry.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                <span style={{ fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
                  {entry.value}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  {entry.unit}
                </span>
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: "4px",
              paddingTop: "8px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            <span>Combined weight</span>
            <span style={{ color: "#94a3b8", fontWeight: 500 }}>{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

