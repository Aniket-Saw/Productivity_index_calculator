from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import (
    DailyInputData, DPIResponse, ProductivityResultResponse, 
    SimulationDetails, FuzzyMetadataResponse, BatchInputData, 
    BatchDPIResponse, SweepRequest, SweepResponse, SweepPoint, 
    SurfaceRequest, SurfaceResponse, SurfacePoint
)
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

@app.post("/calculate/batch", response_model=BatchDPIResponse)
async def calculate_batch(data: BatchInputData):
    try:
        results = []
        for scenario in data.scenarios:
            res = calculator.calculate_dpi(
                focus_time=scenario.focus_time,
                distractions=scenario.distractions,
                sleep_hours=scenario.sleep_hours,
                sleep_quality_score=scenario.sleep_quality_score,
                workload=scenario.workload
            )
            sim = SimulationDetails(
                fuzzified_inputs=res["simulation"]["fuzzified_inputs"],
                fired_rules=res["simulation"]["fired_rules"]
            )
            results.append(ProductivityResultResponse(
                dpi_score=res["dpi_score"],
                adjusted_sleep_score=res["adjusted_sleep_score"],
                linguistic_result=res["linguistic_result"],
                date=date.today(),
                simulation=sim
            ))
        return BatchDPIResponse(status="success", results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate/sensitivity", response_model=SweepResponse)
async def simulate_sensitivity(req: SweepRequest):
    try:
        data_points = []
        step_size = (req.end_val - req.start_val) / (req.steps - 1) if req.steps > 1 else 0
        
        for i in range(req.steps):
            val = req.start_val + i * step_size
            curr_scenario = req.base_scenario.model_dump()
            
            # Map target variable properly
            var_map = {
                "FocusTime": "focus_time",
                "Distractions": "distractions",
                "SleepHours": "sleep_hours",
                "SleepQuality": "sleep_quality_score",
                "Workload": "workload"
            }
            if req.target_variable not in var_map and req.target_variable not in curr_scenario:
                 key = req.target_variable if req.target_variable in curr_scenario else var_map.get(req.target_variable)
            else:
                 key = var_map.get(req.target_variable, req.target_variable)
                 
            if not key or key not in curr_scenario:
                raise ValueError(f"Invalid target variable: {req.target_variable}")
                
            curr_scenario[key] = val
            res = calculator.calculate_dpi(**curr_scenario)
            data_points.append(SweepPoint(value=round(val, 2), dpi_score=res["dpi_score"]))
            
        return SweepResponse(status="success", variable=req.target_variable, data=data_points)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate/surface", response_model=SurfaceResponse)
async def simulate_surface(req: SurfaceRequest):
    try:
        data_points = []
        x_step = (req.x_end - req.x_start) / (req.steps - 1) if req.steps > 1 else 0
        y_step = (req.y_end - req.y_start) / (req.steps - 1) if req.steps > 1 else 0
        
        var_map = {
            "FocusTime": "focus_time",
            "Distractions": "distractions",
            "SleepHours": "sleep_hours",
            "SleepQuality": "sleep_quality_score",
            "Workload": "workload"
        }
        x_key = var_map.get(req.x_variable, req.x_variable)
        y_key = var_map.get(req.y_variable, req.y_variable)
        
        for i in range(req.steps):
            x_val = req.x_start + i * x_step
            for j in range(req.steps):
                y_val = req.y_start + j * y_step
                
                curr_scenario = req.base_scenario.model_dump()
                curr_scenario[x_key] = x_val
                curr_scenario[y_key] = y_val
                
                res = calculator.calculate_dpi(**curr_scenario)
                data_points.append(SurfacePoint(x=round(x_val, 2), y=round(y_val, 2), dpi_score=res["dpi_score"]))
                
        return SurfaceResponse(status="success", x_variable=req.x_variable, y_variable=req.y_variable, data=data_points)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
