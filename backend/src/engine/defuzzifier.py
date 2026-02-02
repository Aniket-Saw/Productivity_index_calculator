from .fuzzifier import create_fuzzy_system
from .inference import add_rules

# Manual membership function definitions for metadata export
MEMBERSHIP_DEFINITIONS = {
    "FocusTime": {
        "concept": "Focus Time",
        "universe": [0, 24],
        "sets": [
            {"term": "Low", "points": [[0, 1], [2, 1], [3, 0]]},
            {"term": "Medium", "points": [[2, 0], [4, 1], [6, 0]]},
            {"term": "High", "points": [[5, 0], [7, 1], [24, 1]]}
        ]
    },
    "Distractions": {
        "concept": "Distractions count",
        "universe": [0, 100],
        "sets": [
            {"term": "Low", "points": [[0, 1], [3, 1], [5, 0]]},
            {"term": "Medium", "points": [[3, 0], [6, 1], [9, 0]]},
            {"term": "High", "points": [[8, 0], [12, 1], [100, 1]]}
        ]
    },
    "SleepQuality": {
        "concept": "Sleep Quality Score",
        "universe": [0, 1],
        "sets": [
            {"term": "Poor", "points": [[0, 1], [0.3, 1], [0.5, 0]]},
            {"term": "Fair", "points": [[0.3, 0], [0.55, 1], [0.8, 0]]},
            {"term": "Excellent", "points": [[0.7, 0], [0.9, 1], [1, 1]]}
        ]
    },
    "Workload": {
        "concept": "Workload scale",
        "universe": [1, 10],
        "sets": [
            {"term": "Underloaded", "points": [[1, 1], [3, 1], [5, 0]]},
            {"term": "Balanced", "points": [[3, 0], [5.5, 1], [8, 0]]},
            {"term": "Overloaded", "points": [[7, 0], [9, 1], [10, 1]]}
        ]
    },
    "Productivity": {
        "concept": "Productivity Index",
        "universe": [0, 100],
        "sets": [
            {"term": "Low", "points": [[0, 1], [15, 1], [30, 0]]},
            {"term": "Fair", "points": [[20, 0], [35, 1], [55, 0]]},
            {"term": "Good", "points": [[45, 0], [65, 1], [85, 0]]},
            {"term": "Excellent", "points": [[75, 0], [90, 1], [100, 1]]}
        ]
    }
}

RULES_LIST = [
    {"id": 1, "text": "IF FocusTime IS High AND Distractions IS Low AND SleepQuality IS Excellent THEN Productivity IS Excellent"},
    {"id": 2, "text": "IF FocusTime IS High AND Distractions IS Low AND SleepQuality IS Fair THEN Productivity IS Excellent"},
    {"id": 3, "text": "IF FocusTime IS High AND Distractions IS Medium THEN Productivity IS Good"},
    {"id": 4, "text": "IF FocusTime IS High AND Distractions IS High THEN Productivity IS Fair"},
    {"id": 5, "text": "IF FocusTime IS High AND Workload IS Balanced THEN Productivity IS Excellent"},
    {"id": 6, "text": "IF FocusTime IS High AND Workload IS Overloaded THEN Productivity IS Good"},
    {"id": 7, "text": "IF FocusTime IS Medium AND Distractions IS Low AND SleepQuality IS Excellent THEN Productivity IS Good"},
    {"id": 8, "text": "IF FocusTime IS Medium AND Distractions IS Low AND SleepQuality IS Fair THEN Productivity IS Good"},
    {"id": 9, "text": "IF FocusTime IS Medium AND Distractions IS Medium THEN Productivity IS Fair"},
    {"id": 10, "text": "IF FocusTime IS Medium AND Distractions IS High THEN Productivity IS Low"},
    {"id": 11, "text": "IF FocusTime IS Medium AND Workload IS Balanced THEN Productivity IS Good"},
    {"id": 12, "text": "IF FocusTime IS Medium AND Workload IS Underloaded THEN Productivity IS Fair"},
    {"id": 13, "text": "IF FocusTime IS Low AND Distractions IS Low THEN Productivity IS Fair"},
    {"id": 14, "text": "IF FocusTime IS Low AND Distractions IS Medium THEN Productivity IS Low"},
    {"id": 15, "text": "IF FocusTime IS Low AND Distractions IS High THEN Productivity IS Low"},
    {"id": 16, "text": "IF FocusTime IS Low AND SleepQuality IS Poor THEN Productivity IS Low"},
    {"id": 17, "text": "IF SleepQuality IS Excellent AND Workload IS Balanced THEN Productivity IS Excellent"},
    {"id": 18, "text": "IF SleepQuality IS Poor THEN Productivity IS Low"},
    {"id": 19, "text": "IF Workload IS Overloaded AND Distractions IS High THEN Productivity IS Low"},
    {"id": 20, "text": "IF Workload IS Underloaded AND FocusTime IS Low THEN Productivity IS Low"},
    {"id": 21, "text": "IF SleepQuality IS Fair AND Workload IS Balanced AND FocusTime IS Medium THEN Productivity IS Good"},
    {"id": 22, "text": "IF FocusTime IS Medium AND Distractions IS Medium AND SleepQuality IS Fair THEN Productivity IS Fair"},
    {"id": 23, "text": "IF FocusTime IS High AND Distractions IS Medium AND Workload IS Overloaded THEN Productivity IS Good"},
    {"id": 24, "text": "IF FocusTime IS Low AND Distractions IS Low AND Workload IS Balanced THEN Productivity IS Fair"},
    {"id": 25, "text": "IF FocusTime IS Medium AND Distractions IS Low AND Workload IS Balanced THEN Productivity IS Good"}
]

def _calculate_membership(value, points):
    """Calculate membership value for a given crisp input using linear interpolation."""
    for i in range(len(points) - 1):
        x1, y1 = points[i]
        x2, y2 = points[i + 1]
        if x1 <= value <= x2:
            if x2 == x1:
                return y1
            return y1 + (y2 - y1) * ((value - x1) / (x2 - x1))
    # Handle edges
    if value <= points[0][0]:
        return points[0][1]
    if value >= points[-1][0]:
        return points[-1][1]
    return 0

class DPICalculator:
    def __init__(self):
        self.fs = create_fuzzy_system()
        self.fs = add_rules(self.fs)

    def get_fuzzy_metadata(self):
        """Return all membership function definitions for visualization."""
        return {
            "input_variables": {k: v for k, v in MEMBERSHIP_DEFINITIONS.items() if k != "Productivity"},
            "output_variables": {"Productivity": MEMBERSHIP_DEFINITIONS["Productivity"]},
            "rules": RULES_LIST
        }

    def calculate_dpi(self, focus_time, distractions, sleep_hours, sleep_quality_score, workload):
        # Calculate Sleep Quality Score (0-1)
        adj_sleep_score = (min(sleep_hours, 8) / 8) * 0.5 + (sleep_quality_score / 10) * 0.5
        
        # Set inputs
        self.fs.set_variable("FocusTime", focus_time)
        self.fs.set_variable("Distractions", distractions)
        self.fs.set_variable("SleepQuality", adj_sleep_score)
        self.fs.set_variable("Workload", workload)

        # Calculate fuzzified values manually
        input_values = {
            "FocusTime": focus_time,
            "Distractions": distractions,
            "SleepQuality": adj_sleep_score,
            "Workload": workload
        }
        
        fuzzified = {}
        for var_name, value in input_values.items():
            fuzzified[var_name] = {}
            for set_def in MEMBERSHIP_DEFINITIONS[var_name]["sets"]:
                membership = _calculate_membership(value, set_def["points"])
                fuzzified[var_name][set_def["term"]] = round(membership, 4)

        # Perform inference
        result = self.fs.Mamdani_inference(["Productivity"])
        dpi_score = result.get("Productivity", 0)
        
        # Evaluate fired rules
        fired_rules = self._evaluate_rule_firing(fuzzified)

        return {
            "dpi_score": round(dpi_score, 2),
            "adjusted_sleep_score": round(adj_sleep_score, 2),
            "linguistic_result": self._get_linguistic_label(dpi_score),
            "simulation": {
                "fuzzified_inputs": fuzzified,
                "fired_rules": fired_rules
            }
        }

    def _evaluate_rule_firing(self, fuzzified):
        """Calculate rule firing strength using min-AND logic."""
        fired = []
        
        for rule in RULES_LIST:
            text = rule["text"]
            strength = self._calculate_rule_strength(text, fuzzified)
            if strength > 0:
                fired.append({"id": rule["id"], "text": text, "strength": round(strength, 4)})
        
        return fired

    def _calculate_rule_strength(self, rule_text, fuzzified):
        """Parse rule and calculate firing strength."""
        # Extract antecedent conditions
        # Format: IF VarName IS Term AND ...
        import re
        pattern = r'(\w+)\s+IS\s+(\w+)'
        matches = re.findall(pattern, rule_text.split('THEN')[0])
        
        strengths = []
        for var_name, term in matches:
            if var_name in fuzzified and term in fuzzified[var_name]:
                strengths.append(fuzzified[var_name][term])
            else:
                return 0  # Variable or term not found
        
        return min(strengths) if strengths else 0

    def _get_linguistic_label(self, score):
        if score < 25: return "Low"
        if score < 50: return "Fair"
        if score < 75: return "Good"
        return "Excellent"
