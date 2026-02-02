interface FiredRule {
    id: number;
    text: string;
    strength: number;
}

interface RuleLogProps {
    rules: FiredRule[];
}

export function RuleLog({ rules }: RuleLogProps) {
    const sortedRules = [...rules].sort((a, b) => b.strength - a.strength);

    return (
        <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔥 Active Rules ({rules.length})
            </h3>
            {sortedRules.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No rules currently firing.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {sortedRules.map((rule) => (
                        <li key={rule.id} style={{
                            marginBottom: '0.75rem',
                            padding: '0.75rem',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '0.75rem',
                            borderLeft: `4px solid ${getStrengthColor(rule.strength)}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Rule #{rule.id}</span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '0.5rem',
                                    background: `${getStrengthColor(rule.strength)}22`,
                                    color: getStrengthColor(rule.strength)
                                }}>
                                    {(rule.strength * 100).toFixed(1)}% strength
                                </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                                {formatRuleText(rule.text)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function getStrengthColor(strength: number): string {
    if (strength > 0.7) return '#10b981'; // Green
    if (strength > 0.4) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
}

function formatRuleText(text: string): string {
    // Clean up rule text for display
    return text
        .replace(/IF\s*/gi, 'IF ')
        .replace(/AND\s*/gi, ' AND ')
        .replace(/THEN\s*/gi, ' THEN ')
        .replace(/\(|\)/g, '')
        .trim();
}
