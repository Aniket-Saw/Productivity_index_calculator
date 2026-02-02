import pytest
from backend.src.engine.defuzzifier import DPICalculator

@pytest.fixture
def calculator():
    return DPICalculator()

def test_high_productivity(calculator):
    # High Focus (8h), Low Distractions (1), Good Sleep (8h, 9/10), Balanced Workload (5)
    result = calculator.calculate_dpi(
        focus_time=8.0,
        distractions=1,
        sleep_hours=8.0,
        sleep_quality_score=9,
        workload=5
    )
    assert result["dpi_score"] > 75
    assert result["linguistic_result"] == "Excellent"

def test_low_productivity(calculator):
    # Low Focus (1h), High Distractions (15), Poor Sleep (4h, 2/10), Overloaded Workload (10)
    result = calculator.calculate_dpi(
        focus_time=1.0,
        distractions=15,
        sleep_hours=4.0,
        sleep_quality_score=2,
        workload=10
    )
    assert result["dpi_score"] < 40
    # Note: Depending on rules, it might be Low or Fair leaning Low
    assert result["linguistic_result"] in ["Low", "Fair"]

def test_medium_productivity(calculator):
    # Medium Focus (4h), Medium Distractions (5), Fair Sleep (6h, 5/10), Balanced Workload (5)
    result = calculator.calculate_dpi(
        focus_time=4.0,
        distractions=5,
        sleep_hours=6.0,
        sleep_quality_score=5,
        workload=5
    )
    assert 40 <= result["dpi_score"] <= 80
    assert result["linguistic_result"] in ["Fair", "Good"]

def test_sleep_adjustment(calculator):
    # Testing only sleep adjustment logic in defuzzifier
    # (8/8)*0.5 + (10/10)*0.5 = 1.0
    res1 = calculator.calculate_dpi(8, 0, 8, 10, 5)
    assert res1["adjusted_sleep_score"] == 1.0
    
    # (4/8)*0.5 + (0/10)*0.5 = 0.25
    res2 = calculator.calculate_dpi(8, 0, 4, 0, 5)
    assert res2["adjusted_sleep_score"] == 0.25
