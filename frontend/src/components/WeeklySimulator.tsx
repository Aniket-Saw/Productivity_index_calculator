import { useState, useEffect } from "react";
import { CalendarDays, Play, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface DPIData {
    focus_time: number;
    distractions: number;
    sleep_hours: number;
    sleep_quality_score: number;
    workload: number;
}

interface ResultData {
    dpi_score: number;
    linguistic_result: string;
}

interface Props {
    baseData: DPIData;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklySimulator({ baseData }: Props) {
    const [weekDraft, setWeekDraft] = useState<DPIData[]>(
        Array(7).fill({ ...baseData })
    );

    const [results, setResults] = useState<ResultData[]>([]);
    const [loading, setLoading] = useState(false);

    // Auto sync if base data fundamentally changes and we haven't typed yet, 
    // but to prevent losing data, we'll just have a manual reset button.

    const handleReset = () => {
        setWeekDraft(Array(7).fill({ ...baseData }));
        setResults([]);
    };

    const updateDay = (index: number, key: keyof DPIData, value: number) => {
        const newDraft = [...weekDraft];
        newDraft[index] = { ...newDraft[index], [key]: value };
        setWeekDraft(newDraft);
    };

    const runSimulation = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/calculate/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scenarios: weekDraft }),
            });
            const data = await response.json();
            if (data.status === "success") {
                setResults(data.results.map((r: any) => ({
                    dpi_score: r.dpi_score,
                    linguistic_result: r.linguistic_result
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const chartData = results.map((r, i) => ({
        day: DAYS[i],
        score: r.dpi_score,
    }));

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 m-0">
                    <CalendarDays size={20} className="text-indigo-400" /> Weekly Planner Simulator
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
                    >
                        <RefreshCw size={14} /> Reset
                    </button>
                    <button
                        onClick={runSimulation}
                        disabled={loading}
                        className="text-xs flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors"
                    >
                        {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3 h-3"></span> : <Play size={14} />} Simulate Week
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto pb-4 mb-6">
                <div className="flex gap-3 min-w-max">
                    {DAYS.map((day, idx) => (
                        <div key={day} className={`w-40 bg-slate-800/50 p-3 rounded-xl border ${idx > 4 ? 'border-amber-500/30' : 'border-slate-700/50'}`}>
                            <div className="font-bold text-center mb-3 text-slate-300">{day}</div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                                        <span>Focus</span> <span>{weekDraft[idx].focus_time}h</span>
                                    </div>
                                    <input type="range" min="0" max="24" step="0.5" className="w-full accent-indigo-500" value={weekDraft[idx].focus_time} onChange={(e) => updateDay(idx, 'focus_time', parseFloat(e.target.value) || 0)} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                                        <span>Distract</span> <span>{weekDraft[idx].distractions}</span>
                                    </div>
                                    <input type="range" min="0" max="20" step="1" className="w-full accent-red-400" value={weekDraft[idx].distractions} onChange={(e) => updateDay(idx, 'distractions', parseInt(e.target.value) || 0)} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                                        <span>Sleep</span> <span>{weekDraft[idx].sleep_hours}h</span>
                                    </div>
                                    <input type="range" min="0" max="14" step="0.5" className="w-full accent-blue-400" value={weekDraft[idx].sleep_hours} onChange={(e) => updateDay(idx, 'sleep_hours', parseFloat(e.target.value) || 0)} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                                        <span>Workload</span> <span>{weekDraft[idx].workload}/10</span>
                                    </div>
                                    <input type="range" min="1" max="10" step="1" className="w-full accent-amber-500" value={weekDraft[idx].workload} onChange={(e) => updateDay(idx, 'workload', parseInt(e.target.value) || 0)} />
                                </div>
                            </div>

                            {results[idx] && (
                                <div className="mt-3 pt-3 border-t border-slate-700/50 text-center">
                                    <span className="text-xl font-bold">{results[idx].dpi_score.toFixed(0)}</span>
                                    <div className="text-[10px] text-slate-400">{results[idx].linguistic_result}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {results.length > 0 && (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
