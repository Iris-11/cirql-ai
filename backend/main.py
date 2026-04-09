# Placeholder

from fastapi import FastAPI
from routes import e3_router

app = FastAPI()

@app.get("/")
def home():
    return {
        "message":"Hi welcome to Cirql AI"
    }

app.include_router(e3_router.router, prefix="/api")