import { useState, useEffect } from "react";
import { Copy, ArrowRight, GitCompare } from "lucide-react";

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
    currentData: DPIData;
    onApply: (data: DPIData) => void;
}

export function WhatIfSimulator({ currentData, onApply }: Props) {
    const [scenarioA, setScenarioA] = useState<DPIData>(currentData);
    const [scenarioB, setScenarioB] = useState<DPIData>(currentData);
    const [results, setResults] = useState<[ResultData | null, ResultData | null]>([null, null]);
    const [loading, setLoading] = useState(false);

    // Initial calculation to show default points
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const response = await fetch("/api/calculate/batch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ scenarios: [currentData, currentData] }),
                });
                const data = await response.json();
                if (data.status === "success" && data.results.length === 2) {
                    setResults([
                        { dpi_score: data.results[0].dpi_score, linguistic_result: data.results[0].linguistic_result },
                        { dpi_score: data.results[1].dpi_score, linguistic_result: data.results[1].linguistic_result }
                    ]);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchInitial();
    }, [currentData]);

    const handleCopyCurrent = () => {
        setScenarioA({ ...currentData });
        setScenarioB({ ...currentData });
    };

    const runComparison = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/calculate/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scenarios: [scenarioA, scenarioB] }),
            });
            const data = await response.json();
            if (data.status === "success" && data.results.length === 2) {
                setResults([
                    { dpi_score: data.results[0].dpi_score, linguistic_result: data.results[0].linguistic_result },
                    { dpi_score: data.results[1].dpi_score, linguistic_result: data.results[1].linguistic_result }
                ]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        label: string,
        key: keyof DPIData,
        obj: DPIData,
        setObj: (val: DPIData) => void,
        max: number,
        step: number = 1
    ) => (
        <div className="whatif-input-group">
            <label className="whatif-input-label">{label} ({obj[key]})</label>
            <input
                type="range"
                min="0"
                max={max}
                step={step}
                value={obj[key]}
                onChange={(e) => setObj({ ...obj, [key]: parseFloat(e.target.value) || 0 })}
                className="whatif-slider"
            />
        </div>
    );

    const renderScenario = (
        title: string,
        data: DPIData,
        setData: (val: DPIData) => void,
        result: ResultData | null,
        isScenarioB: boolean = false
    ) => (
        <div className={`whatif-scenario-card ${isScenarioB ? 'whatif-scenario-target' : 'whatif-scenario-base'}`}>
            <div className="whatif-card-header">
                <h3 className="whatif-card-title">{title}</h3>
                <div className="whatif-score-box animate-fade-in">
                    <span className="whatif-score-value">
                        {result ? result.dpi_score.toFixed(1) : "-"}
                    </span>
                    <span className="whatif-score-label">Points</span>
                </div>
            </div>

            <div className="whatif-inputs">
                {renderInput("Focus (hrs)", "focus_time", data, setData, 24, 0.5)}
                {renderInput("Distractions", "distractions", data, setData, 20)}
                {renderInput("Sleep (hrs)", "sleep_hours", data, setData, 14, 0.5)}
                {renderInput("Sleep Quality", "sleep_quality_score", data, setData, 10)}
                {renderInput("Workload", "workload", data, setData, 10)}
            </div>

            {result && (
                <div className="whatif-result-linguistic">
                    {result.linguistic_result}
                </div>
            )}

            <button
                onClick={() => onApply(data)}
                className={`whatif-btn-apply ${isScenarioB ? 'btn-apply-target' : 'btn-apply-base'}`}
            >
                Apply Scenario
            </button>
        </div>
    );

    return (
        <div className="whatif-container mt-6">
            <div className="whatif-header-row">
                <div>
                    <h2 className="whatif-header-title">
                        <GitCompare size={28} style={{ color: '#818cf8' }} /> Scenario Comparator
                    </h2>
                    <p className="whatif-header-subtitle">Test hypothetical changes to your routine</p>
                </div>

                <div className="whatif-actions">
                    <button
                        onClick={handleCopyCurrent}
                        className="whatif-btn-sync"
                    >
                        <Copy size={16} /> Sync Current
                    </button>
                    <button
                        onClick={runComparison}
                        disabled={loading}
                        className="whatif-btn-compare"
                    >
                        {loading ? <span className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }}></span> : <ArrowRight size={18} />} Calculate & Compare
                    </button>
                </div>
            </div>

            {results[0] && results[1] && (
                <div className="whatif-difference-box animate-fade-in">
                    <span className="whatif-diff-label">Difference in Productivity:</span>
                    <span className="whatif-diff-value">
                        {Math.abs(results[0].dpi_score - results[1].dpi_score).toFixed(1)} PTS
                    </span>
                    <span className="whatif-diff-winner" style={{
                        backgroundColor: results[1].dpi_score > results[0].dpi_score ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        color: results[1].dpi_score > results[0].dpi_score ? '#e9d5ff' : '#c7d2fe',
                        border: `1px solid ${results[1].dpi_score > results[0].dpi_score ? 'rgba(168, 85, 247, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                    }}>
                        {results[1].dpi_score > results[0].dpi_score ? "B is better" : "A is better"}
                    </span>
                </div>
            )}

            <div className="whatif-grid">
                {renderScenario("Scenario A (Base)", scenarioA, setScenarioA, results[0], false)}
                {renderScenario("Scenario B (Target)", scenarioB, setScenarioB, results[1], true)}
            </div>
        </div>
    );
}
