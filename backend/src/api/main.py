from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import DailyInputData, DPIResponse, ProductivityResultResponse, SimulationDetails, FuzzyMetadataResponse
from ..engine.defuzzifier import DPICalculator
from datetime import date

app = FastAPI(title="Fuzzy DPI Simulator API", version="2.0.0")

# CORS setup for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Calculator
calculator = DPICalculator()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fuzzy Productivity Simulator API"}

@app.get("/metadata", response_model=FuzzyMetadataResponse)
async def get_fuzzy_metadata():
    """Returns the definition of all membership functions, rules, and universe of discourse."""
    try:
        metadata = calculator.get_fuzzy_metadata()
        return metadata
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/calculate", response_model=DPIResponse)
async def calculate_dpi(data: DailyInputData):
    try:
        result = calculator.calculate_dpi(
            focus_time=data.focus_time,
            distractions=data.distractions,
            sleep_hours=data.sleep_hours,
            sleep_quality_score=data.sleep_quality_score,
            workload=data.workload
        )
        
        simulation = SimulationDetails(
            fuzzified_inputs=result["simulation"]["fuzzified_inputs"],
            fired_rules=result["simulation"]["fired_rules"]
        )
        
        response_data = ProductivityResultResponse(
            dpi_score=result["dpi_score"],
            adjusted_sleep_score=result["adjusted_sleep_score"],
            linguistic_result=result["linguistic_result"],
            date=date.today(),
            simulation=simulation
        )
        
        return DPIResponse(status="success", data=response_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
