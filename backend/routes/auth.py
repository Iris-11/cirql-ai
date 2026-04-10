"""
auth.py — Customer login by email lookup.

POST /api/v1/auth/login
  - Accepts { email, password } from the mobile app
  - Password is IGNORED — customers table has no password column
  - Looks up the customer row by email in Supabase
  - Returns the customer's id + profile fields on match
  - Returns 404 if email not found
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.supabase_client import get_supabase_client

router = APIRouter()


# ── Request / Response schemas ──────────────────

class LoginRequest(BaseModel):
    email: str
    password: str   # collected in UI for UX but not validated — no password in DB


class LoginResponse(BaseModel):
    id: str
    email: str
    name: str | None = None
    picture: str | None = None


# ── Endpoint ─────────────────────────────────────

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login — email lookup only",
    description=(
        "Looks up a customer by email. Password field is accepted for UI "
        "compatibility but is not checked (no password stored in DB). "
        "Returns 404 if no customer matches the email."
    ),
)
def login(body: LoginRequest):
    client = get_supabase_client(use_admin=True)

    result = (
        client.table("customers")
        .select("id, email, name")
        .eq("email", body.email)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="No account found for this email address.",
        )

    customer = result.data[0]

    return LoginResponse(
        id=str(customer["id"]),
        email=customer["email"],
        name=customer.get("name"),
    )
