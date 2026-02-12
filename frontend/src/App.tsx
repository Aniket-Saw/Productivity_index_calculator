import { useState, useEffect } from 'react'
import { Activity, Clock, Moon, Layers, AlertCircle, CheckCircle2, Cpu } from 'lucide-react'
import { MembershipGraph } from './components/MembershipGraph'
import { RuleLog } from './components/RuleLog'

interface DPIData {
    focus_time: number;
    distractions: number;
    sleep_hours: number;
    sleep_quality_score: number;
    workload: number;
}

interface FiredRule {
    id: number;
    text: string;
    strength: number;
}

interface SimulationDetails {
    fuzzified_inputs: Record<string, Record<string, number>>;
    fired_rules: FiredRule[];
}

interface DPIResult {
    dpi_score: number;
    adjusted_sleep_score: number;
    linguistic_result: string;
    date: string;
    simulation: SimulationDetails;
}

interface FuzzySet {
    term: string;
    points: number[][];
}

interface VariableInfo {
    concept: string;
    universe: [number, number];
    sets: FuzzySet[];
}

interface FuzzyMetadata {
    input_variables: Record<string, VariableInfo>;
    output_variables: Record<string, VariableInfo>;
    rules: { id: number; text: string }[];
}

function App() {
    const [formData, setFormData] = useState<DPIData>({
        focus_time: 4,
        distractions: 5,
        sleep_hours: 7,
        sleep_quality_score: 7,
        workload: 5
    });

    const [result, setResult] = useState<DPIResult | null>(null);
    const [metadata, setMetadata] = useState<FuzzyMetadata | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSimulator, setShowSimulator] = useState(false);

    useEffect(() => {
        // Fetch fuzzy metadata on mount
        fetch('/api/metadata')
            .then(res => res.json())
            .then(data => setMetadata(data))
            .catch(err => console.error('Failed to load metadata:', err));
    }, []);

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.status === 'success') {
                setResult(data.data);
                setShowSimulator(true);
            } else {
                setError(data.detail || 'Calculation failed');
            }
        } catch (err) {
            console.error("Simulation error:", err);
            if (err instanceof SyntaxError) {
                setError('Backend returned invalid JSON (check console for details)');
            } else {
                setError('Connection to backend failed (is the server running?)');
            }
        } finally {
            setLoading(false);
        }
    };

    const getAdjustedSleepScore = () => {
        return (Math.min(formData.sleep_hours, 8) / 8) * 0.5 + (formData.sleep_quality_score / 10) * 0.5;
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Fuzzy Logic Simulator</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Daily Productivity Index — Interactive Visualization</p>
            </header>

            {/* Input Section */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={24} /> Input Parameters
                </h2>
                <form onSubmit={handleCalculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label><Clock size={16} /> Focus Time (hours)</label>
                        <input
                            type="number" step="0.5" min="0" max="24"
                            value={formData.focus_time}
                            onChange={(e) => setFormData({ ...formData, focus_time: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="input-group">
                        <label><AlertCircle size={16} /> Distractions</label>
                        <input
                            type="number" min="0"
                            value={formData.distractions}
                            onChange={(e) => setFormData({ ...formData, distractions: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="input-group">
                        <label><Moon size={16} /> Sleep (hours)</label>
                        <input
                            type="number" step="0.5" min="0" max="24"
                            value={formData.sleep_hours}
                            onChange={(e) => setFormData({ ...formData, sleep_hours: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="input-group">
                        <label><Moon size={16} /> Sleep Quality ({formData.sleep_quality_score}/10)</label>
                        <input
                            type="range" min="1" max="10"
                            value={formData.sleep_quality_score}
                            onChange={(e) => setFormData({ ...formData, sleep_quality_score: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="input-group">
                        <label><Layers size={16} /> Workload ({formData.workload}/10)</label>
                        <input
                            type="range" min="1" max="10"
                            value={formData.workload}
                            onChange={(e) => setFormData({ ...formData, workload: parseInt(e.target.value) })}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="btn-primary" style={{ width: '100%', height: '42px' }} disabled={loading}>
                            {loading ? 'Simulating...' : '🧬 Simulate'}
                        </button>
                    </div>
                </form>
                {error && <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</p>}
            </div>

            {/* Results & Simulator Section */}
            {result && showSimulator && (
                <div className="animate-fade-in">
                    {/* DPI Score */}
                    <div className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <CheckCircle2 size={24} color="#10b981" /> Productivity Index
                        </h2>
                        <div className="score-display gradient-text">{result.dpi_score}</div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>Status: {result.linguistic_result}</p>
                    </div>

                    {/* Membership Function Graphs */}
                    <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Cpu size={24} /> Fuzzification Visualization
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {metadata && (
                            <>
                                <MembershipGraph
                                    variableName="FocusTime"
                                    concept={metadata.input_variables.FocusTime.concept}
                                    universe={metadata.input_variables.FocusTime.universe}
                                    sets={metadata.input_variables.FocusTime.sets}
                                    currentValue={formData.focus_time}
                                    fuzzifiedValues={result.simulation.fuzzified_inputs.FocusTime || {}}
                                />
                                <MembershipGraph
                                    variableName="Distractions"
                                    concept={metadata.input_variables.Distractions.concept}
                                    universe={metadata.input_variables.Distractions.universe}
                                    sets={metadata.input_variables.Distractions.sets}
                                    currentValue={formData.distractions}
                                    fuzzifiedValues={result.simulation.fuzzified_inputs.Distractions || {}}
                                />
                                <MembershipGraph
                                    variableName="SleepQuality"
                                    concept={metadata.input_variables.SleepQuality.concept}
                                    universe={metadata.input_variables.SleepQuality.universe}
                                    sets={metadata.input_variables.SleepQuality.sets}
                                    currentValue={getAdjustedSleepScore()}
                                    fuzzifiedValues={result.simulation.fuzzified_inputs.SleepQuality || {}}
                                />
                                <MembershipGraph
                                    variableName="Workload"
                                    concept={metadata.input_variables.Workload.concept}
                                    universe={metadata.input_variables.Workload.universe}
                                    sets={metadata.input_variables.Workload.sets}
                                    currentValue={formData.workload}
                                    fuzzifiedValues={result.simulation.fuzzified_inputs.Workload || {}}
                                />
                            </>
                        )}
                    </div>

                    {/* Rule Firing Log */}
                    <RuleLog rules={result.simulation.fired_rules} />
                </div>
            )}
        </div>
    );
}

export default App;
