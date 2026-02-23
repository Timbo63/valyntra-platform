from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth ────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_admin: bool
    created_at: datetime
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Company ──────────────────────────────────────────────────────────────
class CompanyCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    county: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None
    employee_count: Optional[int] = None
    revenue_estimate: Optional[str] = None
    primary_function: Optional[str] = None

class CompanyOut(BaseModel):
    id: int
    name: str
    industry: Optional[str]
    county: Optional[str]
    city: Optional[str]
    website: Optional[str]
    employee_count: Optional[int]
    company_size_segment: Optional[str]
    created_at: datetime
    class Config: from_attributes = True


# ── Assessment ───────────────────────────────────────────────────────────
class AssessmentCreate(BaseModel):
    company_id: int
    data_maturity: int
    process_automation: int
    leadership_alignment: int
    technical_infrastructure: int
    primary_pain: Optional[str] = None
