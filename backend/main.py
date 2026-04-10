from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import dashboard, listings, products

app = FastAPI(title="CIRQL Brand Portal API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api")
app.include_router(listings.router)
app.include_router(products.router)

@app.get("/")
async def root():
    return {"message": "CIRQL API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)