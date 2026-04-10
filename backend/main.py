"""
main.py — DEVELOPMENT ONLY test runner for e1_verify branch.
Final main.py will be assembled on main branch.
"""

import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from routes import e1_verify, e2_condition, e1e2_pipeline, e3_router, auth, upload, user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Cirql AI — Product Assessment Engine")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error("422 Validation error on %s %s: %s", request.method, request.url, exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

# Individual engines
app.include_router(e1_verify.router, prefix="/api/v1/product", tags=["E1 — Verification"])
app.include_router(e2_condition.router, prefix="/api/v1/product-condition", tags=["E2 — Condition"])

# Combined pipeline
app.include_router(e1e2_pipeline.router, prefix="/api/v1/product", tags=["E1+E2 — Full Assessment"])

# E3 — Routing
app.include_router(e3_router.router, prefix="/api/v1/routing", tags=["E3 — Routing"])

# Auth
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])

# Image upload
app.include_router(upload.router, prefix="/api/v1/product", tags=["Upload"])

# User
app.include_router(user.router, prefix="/api/v1/user", tags=["User"])
