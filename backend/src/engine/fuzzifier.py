from simpful import FuzzySystem, LinguisticVariable, FuzzySet

def create_fuzzy_system():
    FS = FuzzySystem()

    # --- INPUT VARIABLES ---

    # 1. Focus Time (hours)
    # Low (<2), Medium (2-5), High (>5)
    S_Focus_Low = FuzzySet(points=[[0, 1], [2, 1], [3, 0]], term="Low")
    S_Focus_Med = FuzzySet(points=[[2, 0], [4, 1], [6, 0]], term="Medium")
    S_Focus_High = FuzzySet(points=[[5, 0], [7, 1], [24, 1]], term="High")
    FS.add_linguistic_variable("FocusTime", LinguisticVariable([S_Focus_Low, S_Focus_Med, S_Focus_High], concept="Focus Time", universe_of_discourse=[0, 24]))

    # 2. Distractions (count)
    # Low (<3), Medium (3-8), High (>8)
    S_Dist_Low = FuzzySet(points=[[0, 1], [3, 1], [5, 0]], term="Low")
    S_Dist_Med = FuzzySet(points=[[3, 0], [6, 1], [9, 0]], term="Medium")
    S_Dist_High = FuzzySet(points=[[8, 0], [12, 1], [100, 1]], term="High")
    FS.add_linguistic_variable("Distractions", LinguisticVariable([S_Dist_Low, S_Dist_Med, S_Dist_High], concept="Distractions count", universe_of_discourse=[0, 100]))

    # 3. Sleep Quality (score, 0-1)
    # Poor (<0.4), Fair (0.4-0.7), Excellent (>0.7)
    S_Sleep_Poor = FuzzySet(points=[[0, 1], [0.3, 1], [0.5, 0]], term="Poor")
    S_Sleep_Fair = FuzzySet(points=[[0.3, 0], [0.55, 1], [0.8, 0]], term="Fair")
    S_Sleep_Excellent = FuzzySet(points=[[0.7, 0], [0.9, 1], [1, 1]], term="Excellent")
    FS.add_linguistic_variable("SleepQuality", LinguisticVariable([S_Sleep_Poor, S_Sleep_Fair, S_Sleep_Excellent], concept="Sleep Quality Score", universe_of_discourse=[0, 1]))

    # 4. Workload (1-10)
    # Underloaded (1-3), Balanced (4-7), Overloaded (8-10)
    S_Work_Under = FuzzySet(points=[[1, 1], [3, 1], [5, 0]], term="Underloaded")
    S_Work_Bal = FuzzySet(points=[[3, 0], [5.5, 1], [8, 0]], term="Balanced")
    S_Work_Over = FuzzySet(points=[[7, 0], [9, 1], [10, 1]], term="Overloaded")
    FS.add_linguistic_variable("Workload", LinguisticVariable([S_Work_Under, S_Work_Bal, S_Work_Over], concept="Workload scale", universe_of_discourse=[1, 10]))

    # --- OUTPUT VARIABLE ---

    # Productivity Level (0-100)
    # Low (0-25), Fair (25-50), Good (50-75), Excellent (75-100)
    S_Prod_Low = FuzzySet(points=[[0, 1], [15, 1], [30, 0]], term="Low")
    S_Prod_Fair = FuzzySet(points=[[20, 0], [35, 1], [55, 0]], term="Fair")
    S_Prod_Good = FuzzySet(points=[[45, 0], [65, 1], [85, 0]], term="Good")
    S_Prod_Excell = FuzzySet(points=[[75, 0], [90, 1], [100, 1]], term="Excellent")
    FS.add_linguistic_variable("Productivity", LinguisticVariable([S_Prod_Low, S_Prod_Fair, S_Prod_Good, S_Prod_Excell], concept="Productivity Index", universe_of_discourse=[0, 100]))

    return FS
