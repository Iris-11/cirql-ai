"""
main.py — DEVELOPMENT ONLY test runner for e1_verify branch.
Final main.py will be assembled on main branch.
"""

from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

from routes import e1_verify

app = FastAPI(title="E1 Verify — Dev Test")

app.include_router(e1_verify.router, prefix="/api/v1/product", tags=["E1 — Verification"])
