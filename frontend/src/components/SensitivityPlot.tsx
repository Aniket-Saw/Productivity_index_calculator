import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Activity } from "lucide-react";

interface DPIData {
    focus_time: number;
    distractions: number;
    sleep_hours: number;
    sleep_quality_score: number;
    workload: number;
}

interface SweepPoint {
    value: number;
    dpi_score: number;
}

interface Props {
    baseData: DPIData;
    currentScore: number;
}

const VARIABLES = [
    { id: "FocusTime", label: "Focus Time (hrs)", min: 0, max: 24 },
    { id: "Distractions", label: "Distractions Count", min: 0, max: 20 },
    { id: "SleepHours", label: "Sleep Duration (hrs)", min: 0, max: 14 },
    { id: "SleepQuality", label: "Sleep Quality (1-10)", min: 1, max: 10 },
    { id: "Workload", label: "Workload (1-10)", min: 1, max: 10 },
];

export function SensitivityPlot({ baseData, currentScore }: Props) {
    const [targetVar, setTargetVar] = useState("FocusTime");
    const [data, setData] = useState<SweepPoint[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSensitivity = async () => {
            setLoading(true);
            try {
                const vInfo = VARIABLES.find(v => v.id === targetVar);
                const response = await fetch("/api/simulate/sensitivity", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        base_scenario: baseData,
                        target_variable: targetVar,
                        start_val: vInfo?.min || 0,
                        end_val: vInfo?.max || 10,
                        steps: 25
                    }),
                });
                const resData = await response.json();
                if (resData.status === "success") {
                    setData(resData.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce to avoid spamming the backend over every tick if base changes
        const timeout = setTimeout(fetchSensitivity, 400);
        return () => clearTimeout(timeout);
    }, [baseData, targetVar]);

    // Determine the current value of the selected variable from baseData
    const getCurrentValue = () => {
        switch (targetVar) {
            case "FocusTime": return baseData.focus_time;
            case "Distractions": return baseData.distractions;
            case "SleepHours": return baseData.sleep_hours;
            case "SleepQuality": return baseData.sleep_quality_score;
            case "Workload": return baseData.workload;
            default: return 0;
        }
    };

    const currentVal = getCurrentValue();

    return (
        <div className="mt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 m-0 text-lg">
                    <Activity size={18} className="text-pink-400" /> Sensitivity Analysis
                </h2>

                <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <span className="text-xs text-slate-400">Variable:</span>
                    <select
                        value={targetVar}
                        onChange={e => setTargetVar(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-1 text-slate-200 outline-none focus:border-indigo-500"
                    >
                        {VARIABLES.map(v => (
                            <option key={v.id} value={v.id}>{v.label}</option>
                        ))}
                    </select>
                    {loading && <span className="animate-spin border-2 border-slate-400 border-t-transparent rounded-full w-3 h-3 ml-2"></span>}
                </div>
            </div>

            <p className="text-xs text-slate-400 mb-4">
                This curve shows how your Productivity Index changes as <strong>{VARIABLES.find(v => v.id === targetVar)?.label}</strong> sweeps its entire range, assuming all other inputs remain exactly as they are right now.
            </p>

            {data.length > 0 && (
                <div style={{ height: '350px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="value"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickFormatter={(val) => val.toFixed(1)}
                            />
                            <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                                formatter={(value: number) => [`${value.toFixed(1)} DPI`, 'Score']}
                                labelFormatter={(label) => `${VARIABLES.find(v => v.id === targetVar)?.label}: ${Number(label).toFixed(1)}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="dpi_score"
                                stroke="#f472b6"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: "#f472b6", stroke: "#fff" }}
                            />
                            <ReferenceLine x={currentVal} stroke="#818cf8" strokeDasharray="3 3">
                                {/* <Label value="Current" position="top" fill="#818cf8" fontSize={10} /> */}
                            </ReferenceLine>
                            <ReferenceLine y={currentScore} stroke="#818cf8" strokeDasharray="3 3" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
