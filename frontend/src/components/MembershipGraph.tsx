import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface FuzzySet {
    term: string;
    points: number[][];
}

interface MembershipGraphProps {
    variableName: string;
    concept: string;
    universe: [number, number];
    sets: FuzzySet[];
    currentValue: number;
    fuzzifiedValues: Record<string, number>;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export function MembershipGraph({ variableName, concept, universe, sets, currentValue, fuzzifiedValues }: MembershipGraphProps) {
    // Generate data points for the chart
    const generateChartData = () => {
        const [min, max] = universe;
        const step = (max - min) / 100;
        const data = [];

        for (let x = min; x <= max; x += step) {
            const point: Record<string, number> = { x: parseFloat(x.toFixed(2)) };

            sets.forEach((set) => {
                // Linear interpolation between points
                let membership = 0;
                for (let i = 0; i < set.points.length - 1; i++) {
                    const [x1, y1] = set.points[i];
                    const [x2, y2] = set.points[i + 1];
                    if (x >= x1 && x <= x2) {
                        membership = y1 + (y2 - y1) * ((x - x1) / (x2 - x1));
                        break;
                    }
                }
                // Handle edges
                if (x <= set.points[0][0]) membership = set.points[0][1];
                if (x >= set.points[set.points.length - 1][0]) membership = set.points[set.points.length - 1][1];

                point[set.term] = parseFloat(membership.toFixed(4));
            });

            data.push(point);
        }
        return data;
    };

    const chartData = generateChartData();

    return (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{concept}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1rem' }}>
                Current Value: <strong style={{ color: 'var(--accent-primary)' }}>{currentValue.toFixed(2)}</strong>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {sets.map((set, i) => (
                    <span key={set.term} style={{
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.5rem',
                        background: `${COLORS[i % COLORS.length]}22`,
                        color: COLORS[i % COLORS.length],
                        border: `1px solid ${COLORS[i % COLORS.length]}44`
                    }}>
                        {set.term}: {(fuzzifiedValues[set.term] * 100).toFixed(1)}%
                    </span>
                ))}
            </div>
            <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="x" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 1]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                        labelStyle={{ color: '#f8fafc' }}
                    />
                    {sets.map((set, i) => (
                        <Line
                            key={set.term}
                            type="linear"
                            dataKey={set.term}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                    <ReferenceLine x={currentValue} stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
