import { useState, useEffect } from "react";
import { Activity, Clock, Moon, Layers, AlertCircle, Cpu, Building2, Brain, GraduationCap, BarChart3, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

import { MembershipGraph } from "./components/MembershipGraph";
import { RuleLog } from "./components/RuleLog";
import { ProductivityGauge } from "./components/ProductivityGauge";
import { ProductivityPie } from "./components/ProductivityPie";
import { InsightsPanel } from "./components/InsightsPanel";
import { RecommendationPanel } from "./components/RecommendationPanel";

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
    workload: 5,
  });

  const [showApps, setShowApps] = useState(true);

  const [result, setResult] = useState<DPIResult | null>(null);
  const [metadata, setMetadata] = useState<FuzzyMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/metadata")
      .then((res) => res.json())
      .then((data) => setMetadata(data))
      .catch((err) => console.error("Metadata error", err));
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === "success") {
        setResult(data.data);
      } else {
        setError(data.detail || "Calculation failed");
      }
    } catch (err) {
      console.error(err);
      setError("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = () => {
    const insights: string[] = [];

    if (formData.focus_time < 3) insights.push("Focus time is relatively low.");

    if (formData.distractions > 6)
      insights.push("High distractions may reduce productivity.");

    if (formData.sleep_hours < 6)
      insights.push("Sleep duration may negatively impact performance.");

    if (formData.workload > 7)
      insights.push("Workload appears heavy and may cause fatigue.");

    if (insights.length === 0)
      insights.push(
        "Your input parameters indicate a balanced productive day.",
      );

    return insights;
  };

  const generateRecommendations = () => {
    const rec: string[] = [];

    if (formData.distractions > 6)
      rec.push("Reduce interruptions using focus blocks.");

    if (formData.sleep_hours < 6) rec.push("Increase sleep duration.");

    if (formData.workload > 7) rec.push("Distribute workload across sessions.");

    if (formData.focus_time < 3) rec.push("Increase deep work sessions.");

    if (rec.length === 0) rec.push("Maintain your current routine.");

    return rec;
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}

      <header className="dashboard-header mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Activity size={22} className="text-indigo-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              Productivity Intelligence Dashboard
            </h1>
            <p className="text-slate-400 text-sm">
              AI-powered productivity evaluation using fuzzy inference
            </p>
          </div>
        </div>
      </header>

      {/* APPLICATIONS SECTION */}

      <div className="glass-card apps-section">
        <div
          className="apps-header"
          onClick={() => setShowApps(!showApps)}
          style={{ cursor: "pointer" }}
        >
          <div className="apps-header-left">
            <Lightbulb size={20} className="text-amber-400" />
            <h2>What Can You Do With This Tool?</h2>
          </div>
          {showApps ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {showApps && (
          <div className="apps-grid">
            <div className="app-card">
              <div className="app-icon app-icon-blue">
                <Building2 size={22} />
              </div>
              <h3>Corporate & HR</h3>
              <p>
                Monitor employee wellness, prevent burnout, and balance workloads
                across teams using data-driven productivity insights.
              </p>
            </div>

            <div className="app-card">
              <div className="app-icon app-icon-purple">
                <BarChart3 size={22} />
              </div>
              <h3>Remote Work Analytics</h3>
              <p>
                Track distributed team performance non-invasively through
                self-reported daily metrics like focus, sleep, and distractions.
              </p>
            </div>

            <div className="app-card">
              <div className="app-icon app-icon-green">
                <Brain size={22} />
              </div>
              <h3>Personal Productivity</h3>
              <p>
                Use it as an AI-powered daily journal — log your habits and get a
                fuzzy-logic score with actionable recommendations.
              </p>
            </div>

            <div className="app-card">
              <div className="app-icon app-icon-amber">
                <GraduationCap size={22} />
              </div>
              <h3>Education & Research</h3>
              <p>
                A perfect academic showcase for fuzzy logic, Mamdani inference,
                and soft computing in real-world decision systems.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* INPUT PANEL */}

      <div className="glass-card">
        <h2>
          <Activity size={20} /> Input Parameters
        </h2>

        <form onSubmit={handleCalculate} className="input-grid">
          <div>
            <label>
              <span
                title="Total uninterrupted deep work time during the day."
                style={{ cursor: "help" }}>
                <Clock size={16} /> Focus Time (hours)
              </span>
            </label>
            <p className="input-helper">How many hours did you spend on deep, uninterrupted work today? (0–24 hrs)</p>

            <input
              type="number"
              value={formData.focus_time}
              min="0"
              max="24"
              step="0.5"
              placeholder="e.g. 4.5"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  focus_time: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label>
              <span
                title="Interruptions such as notifications or meetings."
                style={{ cursor: "help" }}>
                <AlertCircle size={16} /> Distractions (count)
              </span>
            </label>
            <p className="input-helper">Number of interruptions today — phone calls, notifications, meetings, etc.</p>

            <input
              type="number"
              value={formData.distractions}
              min="0"
              placeholder="e.g. 5"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  distractions: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label>
              <span
                title="Total hours of sleep before the workday."
                style={{ cursor: "help" }}>
                <Moon size={16} /> Sleep Duration (hours)
              </span>
            </label>
            <p className="input-helper">How many hours did you sleep last night? 7–8 hrs is considered ideal.</p>

            <input
              type="number"
              value={formData.sleep_hours}
              step="0.5"
              min="0"
              max="24"
              placeholder="e.g. 7"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sleep_hours: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label><Moon size={16} /> Sleep Quality ({formData.sleep_quality_score}/10)</label>
            <p className="input-helper">Rate how restful your sleep was — 1 = very poor, 10 = perfectly refreshed.</p>

            <input
              type="range"
              min="1"
              max="10"
              value={formData.sleep_quality_score}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sleep_quality_score: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label>
              <Layers size={16} /> Workload Intensity ({formData.workload}/10)
            </label>
            <p className="input-helper">How heavy was your task load? 1–3 = light, 4–7 = balanced, 8–10 = overloaded.</p>

            <input
              type="range"
              min="1"
              max="10"
              value={formData.workload}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  workload: parseInt(e.target.value),
                })
              }
            />
          </div>

          <button
            className="btn-primary flex items-center justify-center gap-2"
            disabled={loading}>
            {loading ? (
              <>
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                Running AI Engine...
              </>
            ) : (
              "Analyze Productivity"
            )}
          </button>
        </form>

        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>

      {/* RESULTS */}

      {result && (
        <div className="result-section">
          <div className="glass-card">
            <ProductivityGauge score={result.dpi_score} />
          </div>

          <div className="glass-card">
            <ProductivityPie
              focus={formData.focus_time}
              sleep={formData.sleep_hours}
              workload={formData.workload}
              distractions={formData.distractions}
            />
          </div>

          <div className="glass-card">
            <InsightsPanel insights={generateInsights()} />
          </div>

          <div className="glass-card">
            <RecommendationPanel recommendations={generateRecommendations()} />
          </div>

          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={20} className="text-indigo-400" />
              <h2 className="text-lg font-semibold">
                Fuzzy Logic Visualization
              </h2>
            </div>

            <div className="graph-grid">
              {metadata &&
                Object.entries(metadata.input_variables).map(
                  ([key, variable]) => (
                    <MembershipGraph
                      key={key}
                      variableName={key}
                      concept={variable.concept}
                      universe={variable.universe}
                      sets={variable.sets}
                      currentValue={(formData as any)[key] ?? 0}
                      fuzzifiedValues={
                        result.simulation.fuzzified_inputs[key] || {}
                      }
                    />
                  ),
                )}
            </div>
          </div>

          <div className="glass-card">
            <RuleLog rules={result.simulation.fired_rules} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
