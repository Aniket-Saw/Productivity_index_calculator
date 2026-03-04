import { useState, useEffect } from "react";
import { Layers } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DPIData {
    focus_time: number;
    distractions: number;
    sleep_hours: number;
    sleep_quality_score: number;
    workload: number;
}

interface SurfacePoint {
    x: number;
    y: number;
    dpi_score: number;
}

interface Props {
    baseData: DPIData;
}

const VARIABLES = [
    { id: "FocusTime", label: "Focus Time (hrs)", min: 0, max: 24 },
    { id: "Distractions", label: "Distractions", min: 0, max: 20 },
    { id: "SleepHours", label: "Sleep (hrs)", min: 0, max: 14 },
    { id: "SleepQuality", label: "Sleep Quality", min: 1, max: 10 },
    { id: "Workload", label: "Workload", min: 1, max: 10 },
];

export function SurfaceHeatmap({ baseData }: Props) {
    const [xVar, setXVar] = useState("FocusTime");
    const [yVar, setYVar] = useState("Distractions");
    const [data, setData] = useState<SurfacePoint[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSurface = async () => {
            setLoading(true);
            try {
                const xInfo = VARIABLES.find(v => v.id === xVar);
                const yInfo = VARIABLES.find(v => v.id === yVar);

                const response = await fetch("/api/simulate/surface", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        base_scenario: baseData,
                        x_variable: xVar,
                        y_variable: yVar,
                        x_start: xInfo?.min || 0,
                        x_end: xInfo?.max || 10,
                        y_start: yInfo?.min || 0,
                        y_end: yInfo?.max || 10,
                        steps: 12 // 12x12 grid = 144 points for scatter simulation
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

        // Increased debounce for surface as it's more expensive
        const timeout = setTimeout(fetchSurface, 600);
        return () => clearTimeout(timeout);
    }, [baseData, xVar, yVar]);

    return (
        <div className="mt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <h2 className="flex items-center gap-2 m-0 text-lg">
                    <Layers size={18} className="text-emerald-400" /> Fuzzy Decision Surface (2D Projection)
                </h2>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400">X:</span>
                    <select
                        value={xVar}
                        onChange={e => { if (e.target.value !== yVar) setXVar(e.target.value); }}
                        className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 outline-none"
                    >
                        {VARIABLES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                    </select>

                    <span className="text-xs text-slate-400 ml-2">Y:</span>
                    <select
                        value={yVar}
                        onChange={e => { if (e.target.value !== xVar) setYVar(e.target.value); }}
                        className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 outline-none"
                    >
                        {VARIABLES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                    </select>

                    {loading && <span className="animate-spin border-2 border-slate-400 border-t-transparent rounded-full w-3 h-3 ml-2"></span>}
                </div>
            </div>

            <p className="text-xs text-slate-400 mb-6">
                This scatter map visualizes the interaction between two variables. Larger, lighter dots represent higher Productivity Index scores.
            </p>

            {data.length > 0 && (
                <div style={{ height: '400px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                name={VARIABLES.find(v => v.id === xVar)?.label || "X"}
                                stroke="#94a3b8"
                                fontSize={12}
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={(val) => val.toFixed(1)}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name={VARIABLES.find(v => v.id === yVar)?.label || "Y"}
                                stroke="#94a3b8"
                                fontSize={12}
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={(val) => val.toFixed(1)}
                            />
                            <ZAxis
                                type="number"
                                dataKey="dpi_score"
                                range={[20, 400]} // Controls dot size
                                name="DPI Score"
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                                formatter={(value: any, name: string) => {
                                    if (name === "DPI Score") return [`${Number(value).toFixed(1)} points`, name];
                                    return [Number(value).toFixed(1), name];
                                }}
                            />
                            <Scatter
                                data={data}
                                fill="#34d399"
                                fillOpacity={0.6}
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
