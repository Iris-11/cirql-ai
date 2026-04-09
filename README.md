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