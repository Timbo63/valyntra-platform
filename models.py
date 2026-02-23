from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.session import Base


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
    company_size_segment = Column(String)
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
    data_maturity = Column(Integer)
    process_automation = Column(Integer)
    leadership_alignment = Column(Integer)
    technical_infrastructure = Column(Integer)
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
    overall_score = Column(Float)
    data_maturity_score = Column(Float)
    process_automation_score = Column(Float)
    leadership_alignment_score = Column(Float)
    technical_infrastructure_score = Column(Float)
    recommendation_level = Column(String)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())

    assessment = relationship("Assessment", back_populates="score")


class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    use_case = Column(String)
    use_case_tag = Column(String)
    impact_estimate = Column(String)
    implementation_effort = Column(String)
    roi_classification = Column(String)
    rank = Column(Integer)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="opportunities")
    matches = relationship("Match", back_populates="opportunity")


class Provider(Base):
    __tablename__ = "providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    provider_type = Column(String)
    capability_tags = Column(JSON)
    industries_served = Column(JSON)
    delivery_model = Column(String)
    typical_project_size = Column(String)
    capacity = Column(String)
    qualification_score = Column(Integer)
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
    weighted_score = Column(Float)
    est_pilot_value = Column(Float)
    stage = Column(String, default="Not Started")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="matches")
    opportunity = relationship("Opportunity", back_populates="matches")
    provider = relationship("Provider", back_populates="matches")
