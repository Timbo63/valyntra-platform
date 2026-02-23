-- Valyntra Database Schema
-- Run via: alembic upgrade head
-- Or manually via psql:

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id),
    name VARCHAR NOT NULL,
    industry VARCHAR,
    county VARCHAR,
    city VARCHAR,
    website VARCHAR,
    employee_count INTEGER,
    revenue_estimate VARCHAR,
    company_size_segment VARCHAR,
    primary_function VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    data_maturity INTEGER,
    process_automation INTEGER,
    leadership_alignment INTEGER,
    technical_infrastructure INTEGER,
    primary_pain TEXT,
    current_tools TEXT,
    budget_range VARCHAR,
    timeline VARCHAR,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER UNIQUE REFERENCES assessments(id),
    company_id INTEGER REFERENCES companies(id),
    overall_score FLOAT,
    data_maturity_score FLOAT,
    process_automation_score FLOAT,
    leadership_alignment_score FLOAT,
    technical_infrastructure_score FLOAT,
    recommendation_level VARCHAR,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    provider_type VARCHAR,
    capability_tags JSONB,
    industries_served JSONB,
    delivery_model VARCHAR,
    typical_project_size VARCHAR,
    capacity VARCHAR,
    qualification_score INTEGER,
    website VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opportunities (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    use_case VARCHAR,
    use_case_tag VARCHAR,
    impact_estimate VARCHAR,
    implementation_effort VARCHAR,
    roi_classification VARCHAR,
    rank INTEGER,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    opportunity_id INTEGER REFERENCES opportunities(id),
    provider_id INTEGER REFERENCES providers(id),
    industry_match BOOLEAN DEFAULT FALSE,
    capability_match BOOLEAN DEFAULT FALSE,
    weighted_score FLOAT,
    est_pilot_value FLOAT,
    stage VARCHAR DEFAULT 'Not Started',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
