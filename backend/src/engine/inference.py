def add_rules(FS):
    rules = [
        # --- High Focus Scenarios ---
        "IF (FocusTime IS High) AND (Distractions IS Low) AND (SleepQuality IS Excellent) THEN (Productivity IS Excellent)",
        "IF (FocusTime IS High) AND (Distractions IS Low) AND (SleepQuality IS Fair) THEN (Productivity IS Excellent)",
        "IF (FocusTime IS High) AND (Distractions IS Medium) THEN (Productivity IS Good)",
        "IF (FocusTime IS High) AND (Distractions IS High) THEN (Productivity IS Fair)",
        "IF (FocusTime IS High) AND (Workload IS Balanced) THEN (Productivity IS Excellent)",
        "IF (FocusTime IS High) AND (Workload IS Overloaded) THEN (Productivity IS Good)",

        # --- Medium Focus Scenarios ---
        "IF (FocusTime IS Medium) AND (Distractions IS Low) AND (SleepQuality IS Excellent) THEN (Productivity IS Good)",
        "IF (FocusTime IS Medium) AND (Distractions IS Low) AND (SleepQuality IS Fair) THEN (Productivity IS Good)",
        "IF (FocusTime IS Medium) AND (Distractions IS Medium) THEN (Productivity IS Fair)",
        "IF (FocusTime IS Medium) AND (Distractions IS High) THEN (Productivity IS Low)",
        "IF (FocusTime IS Medium) AND (Workload IS Balanced) THEN (Productivity IS Good)",
        "IF (FocusTime IS Medium) AND (Workload IS Underloaded) THEN (Productivity IS Fair)",

        # --- Low Focus Scenarios ---
        "IF (FocusTime IS Low) AND (Distractions IS Low) THEN (Productivity IS Fair)",
        "IF (FocusTime IS Low) AND (Distractions IS Medium) THEN (Productivity IS Low)",
        "IF (FocusTime IS Low) AND (Distractions IS High) THEN (Productivity IS Low)",
        "IF (FocusTime IS Low) AND (SleepQuality IS Poor) THEN (Productivity IS Low)",

        # --- Sleep & Workload specific impacts ---
        "IF (SleepQuality IS Excellent) AND (Workload IS Balanced) THEN (Productivity IS Excellent)",
        "IF (SleepQuality IS Poor) THEN (Productivity IS Low)",
        "IF (Workload IS Overloaded) AND (Distractions IS High) THEN (Productivity IS Low)",
        "IF (Workload IS Underloaded) AND (FocusTime IS Low) THEN (Productivity IS Low)",
        "IF (SleepQuality IS Fair) AND (Workload IS Balanced) AND (FocusTime IS Medium) THEN (Productivity IS Good)",
        
        # --- Balanced / Mixed Scenarios ---
        "IF (FocusTime IS Medium) AND (Distractions IS Medium) AND (SleepQuality IS Fair) THEN (Productivity IS Fair)",
        "IF (FocusTime IS High) AND (Distractions IS Medium) AND (Workload IS Overloaded) THEN (Productivity IS Good)",
        "IF (FocusTime IS Low) AND (Distractions IS Low) AND (Workload IS Balanced) THEN (Productivity IS Fair)",
        "IF (FocusTime IS Medium) AND (Distractions IS Low) AND (Workload IS Balanced) THEN (Productivity IS Good)"
    ]
    
    FS.add_rules(rules)
    return FS
