# cirql-ai
AI-Powered Product Lifecycle Intelligence Platform

## Project Structure
backend/
│
├── main.py                # FastAPI app
├── routes/
│   ├── e1_verify.py
│   ├── e2_condition.py
│   ├── e3_router.py
│   ├── e4_sustainability.py
│
├── services/
│   ├── gemini_service.py
│   ├── claude_service.py
│   ├── groq_service.py
│
├── models/
│   ├── schemas.py        # Pydantic schemas
│
├── utils/
│   ├── validators.py
│   ├── constants.py
│
└── config.py


Globpattern: "backend/**/{requirements*,*.toml,*.cfg,*.ini,Dockerfile*,docker-compose*}"
Found 1 file
Globpattern: "{requirements*,*.toml,docker-compose*,Dockerfile*,.env*}"
Found 3 files
Read c:\Users\shiva\Documents\cirql-ai\backend\requirements.txt
Read c:\Users\shiva\Documents\cirql-ai\backend\.env.example
Yes, main.py is the entry point. Here's the full workflow:

Running the server

cd backend
uvicorn main:app --reload
Server starts at http://localhost:8000

Workflow

Client Request (JSON)
        │
        ▼
   main.py          ← FastAPI app, registers all routers
        │
        ├── /api/v1/product/verify-images          → routes/e1_verify.py
        │                                               └── services/e1_service.py  (Groq Vision)
        │
        ├── /api/v1/product-condition/evaluate-condition  → routes/e2_condition.py
        │                                               └── services/e2_service.py  (Groq Llama-3)
        │
        └── /api/v1/product/full-assessment         → routes/e1e2_pipeline.py
                                                        └── services/e1e2_pipeline.py
                                                              ├── e1_service.verify_product()
                                                              └── e2_service.generate_condition_report_e2()
Endpoints at a glance
Endpoint	Input	Output
POST /api/v1/product/verify-images	ProductSubmission	VerificationResult
POST /api/v1/product-condition/evaluate-condition	ConditionRequest	ConditionResponse
POST /api/v1/product/full-assessment	ProductSubmission	FullAssessmentResult
Interactive docs (auto-generated)
Once running, open:

Swagger UI: http://localhost:8000/docs — try all endpoints with example payloads
ReDoc: http://localhost:8000/redoc
Prerequisites
.env must exist in backend/ with at least:


GROQ_API_KEY=your_key_here
Copy from .env.example and fill it in.

Install deps (if not done):


pip install -r requirements.txt