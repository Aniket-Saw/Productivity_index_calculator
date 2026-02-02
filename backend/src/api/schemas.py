from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, Dict, List, Any

class DailyInputData(BaseModel):
    focus_time: float = Field(..., ge=0, le=24, description="Focus time in hours")
    distractions: int = Field(..., ge=0, description="Number of distractions")
    sleep_hours: float = Field(..., ge=0, le=24, description="Sleep duration in hours")
    sleep_quality_score: int = Field(..., ge=0, le=10, description="Sleep quality score (0-10)")
    workload: int = Field(..., ge=1, le=10, description="Workload level (1-10)")

class FiredRule(BaseModel):
    id: int
    text: str
    strength: float

class SimulationDetails(BaseModel):
    fuzzified_inputs: Dict[str, Dict[str, float]]
    fired_rules: List[FiredRule]

class ProductivityResultResponse(BaseModel):
    dpi_score: float
    adjusted_sleep_score: float
    linguistic_result: str
    date: date
    simulation: Optional[SimulationDetails] = None

class DPIResponse(BaseModel):
    status: str
    data: ProductivityResultResponse

class FuzzySetInfo(BaseModel):
    term: str
    points: List[List[float]]

class VariableInfo(BaseModel):
    concept: str
    universe: List[float]
    sets: List[FuzzySetInfo]

class RuleInfo(BaseModel):
    id: int
    text: str

class FuzzyMetadataResponse(BaseModel):
    input_variables: Dict[str, VariableInfo]
    output_variables: Dict[str, VariableInfo]
    rules: List[RuleInfo]
