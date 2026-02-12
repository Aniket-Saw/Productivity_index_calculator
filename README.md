# Productivity Index Calculator

A full-stack application for calculating daily productivity using fuzzy logic.

## Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/) (LTS version recommended)

## Getting Started

### Backend Setup

The backend is built with FastAPI and Python.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  (Optional) Create and activate a virtual environment:
    ```bash
    python -m venv venv
    
    # Windows
    venv\Scripts\activate
    
    # macOS/Linux
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Run the server:
    ```bash
    uvicorn src.api.main:app --reload
    ```
    The API will be available at `http://localhost:8000`. You can view the API documentation at `http://localhost:8000/docs`.

### Frontend Setup

The frontend is built with React and Vite.

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.