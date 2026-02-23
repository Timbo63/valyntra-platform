from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    companies = relationship("Company", back_populates="owner")


class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    industry = Column(String)
    county = Column(String)
    city = Column(String)
    website = Column(String)
    employee_count = Column(Integer)
    revenue_estimate = Column(String)
    company_size_segment = Column(String)  # SMB / Enterprise
    primary_function = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="companies")
    assessments = relationship("Assessment", back_populates="company")
    opportunities = relationship("Opportunity", back_populates="company")
    matches = relationship("Match", back_populates="company")


class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    # Scoring inputs (1-5 scale)
    data_maturity = Column(Integer)         # How structured is your data?
    process_automation = Column(Integer)    # Current automation level?
    leadership_alignment = Column(Integer)  # Executive buy-in?
    technical_infrastructure = Column(Integer)  # IT readiness?
    # Free-form
    primary_pain = Column(Text)
    current_tools = Column(Text)
    budget_range = Column(String)
    timeline = Column(String)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="assessments")
    score = relationship("Score", back_populates="assessment", uselist=False)


class Score(Base):
    __tablename__ = "scores"
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), unique=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    overall_score = Column(Float)           # 0-100
    data_maturity_score = Column(Float)
    process_automation_score = Column(Float)
    leadership_alignment_score = Column(Float)
    technical_infrastructure_score = Column(Float)
    recommendation_level = Column(String)   # Ready / Developing / Early
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())

    assessment = relationship("Assessment", back_populates="score")


class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    use_case = Column(String)
    use_case_tag = Column(String)           # automation / ml / optimization / analytics
    impact_estimate = Column(String)        # High / Medium / Low
    implementation_effort = Column(String)  # High / Medium / Low
    roi_classification = Column(String)     # Quick Win / Strategic / Long-Term
    rank = Column(Integer)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="opportunities")
    matches = relationship("Match", back_populates="opportunity")


class Provider(Base):
    __tablename__ = "providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    provider_type = Column(String)
    capability_tags = Column(JSON)          # ["ml", "automation", "nlp"]
    industries_served = Column(JSON)        # ["healthcare", "logistics"]
    delivery_model = Column(String)         # remote / hybrid / onsite
    typical_project_size = Column(String)   # SMB / mid-enterprise / enterprise
    capacity = Column(String)               # Low / Med / High
    qualification_score = Column(Integer)   # 1-30
    website = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    matches = relationship("Match", back_populates="provider")


class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    industry_match = Column(Boolean, default=False)
    capability_match = Column(Boolean, default=False)
    weighted_score = Column(Float)          # 0-100
    est_pilot_value = Column(Float)
    stage = Column(String, default="Not Started")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="matches")
    opportunity = relationship("Opportunity", back_populates="matches")
    provider = relationship("Provider", back_populates="matches")
