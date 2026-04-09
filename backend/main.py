"""
main.py — cirql-ai FastAPI application entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import e2_condition

app = FastAPI(
    title="cirql-ai — Product Lifecycle Intelligence API",
    description="AI-powered endpoints for product verification, condition grading, routing and sustainability scoring.",
    version="0.1.0",
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(e2_condition.router, prefix="/api/v1")


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "cirql-ai API is running. Visit /docs for Swagger UI."}