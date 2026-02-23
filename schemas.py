from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


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

class AssessmentCreate(BaseModel):
    company_id: int
    data_maturity: int
    process_automation: int
    leadership_alignment: int
    technical_infrastructure: int
    primary_pain: Optional[str] = None
    current_tools: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None

class AssessmentOut(BaseModel):
    id: int
    company_id: int
    data_maturity: int
    process_automation: int
    leadership_alignment: int
    technical_infrastructure: int
    primary_pain: Optional[str]
    budget_range: Optional[str]
    submitted_at: datetime
    class Config: from_attributes = True

class ScoreOut(BaseModel):
    id: int
    company_id: int
    overall_score: float
    data_maturity_score: float
    process_automation_score: float
    leadership_alignment_score: float
    technical_infrastructure_score: float
    recommendation_level: str
    calculated_at: datetime
    class Config: from_attributes = True

class OpportunityOut(BaseModel):
    id: int
    company_id: int
    use_case: str
    use_case_tag: str
    impact_estimate: str
    implementation_effort: str
    roi_classification: str
    rank: int
    class Config: from_attributes = True

class ProviderCreate(BaseModel):
    name: str
    provider_type: Optional[str] = None
    capability_tags: Optional[List[str]] = []
    industries_served: Optional[List[str]] = []
    delivery_model: Optional[str] = None
    typical_project_size: Optional[str] = None
    capacity: Optional[str] = None
    qualification_score: Optional[int] = None
    website: Optional[str] = None

class ProviderOut(BaseModel):
    id: int
    name: str
    provider_type: Optional[str]
    capability_tags: Optional[List[str]]
    industries_served: Optional[List[str]]
    delivery_model: Optional[str]
    typical_project_size: Optional[str]
    capacity: Optional[str]
    qualification_score: Optional[int]
    website: Optional[str]
    class Config: from_attributes = True

class MatchOut(BaseModel):
    id: int
    company_id: int
    opportunity_id: int
    provider_id: int
    industry_match: bool
    capability_match: bool
    weighted_score: float
    est_pilot_value: Optional[float]
    stage: str
    provider: Optional[ProviderOut]
    opportunity: Optional[OpportunityOut]
    class Config: from_attributes = True

class DashboardOut(BaseModel):
    company: CompanyOut
    score: Optional[ScoreOut]
    opportunities: List[OpportunityOut]
    matches: List[MatchOut]
    total_pipeline_value: float
