"""
Valyntra Opportunity Recommendation Engine
Rule-based: maps industry + score + pain to ranked AI use cases
"""
from sqlalchemy.orm import Session
from app.models.models import Company, Score, Assessment, Opportunity


# Use case library keyed by industry + tag
USE_CASE_LIBRARY = {
    "Healthcare": [
        {"use_case": "Predictive Patient Scheduling", "tag": "optimization",
         "impact": "High", "effort": "Medium", "roi": "Quick Win"},
        {"use_case": "NLP Clinical Documentation Automation", "tag": "automation",
         "impact": "High", "effort": "High", "roi": "Strategic"},
        {"use_case": "Capacity & Demand Forecasting", "tag": "ml",
         "impact": "High", "effort": "Medium", "roi": "Strategic"},
        {"use_case": "Revenue Cycle Automation", "tag": "automation",
         "impact": "Medium", "effort": "Low", "roi": "Quick Win"},
    ],
    "Manufacturing": [
        {"use_case": "Predictive Maintenance", "tag": "ml",
         "impact": "High", "effort": "Medium", "roi": "Strategic"},
        {"use_case": "Production Line Optimization", "tag": "optimization",
         "impact": "High", "effort": "High", "roi": "Strategic"},
        {"use_case": "Demand Forecasting & Inventory Planning", "tag": "ml",
         "impact": "High", "effort": "Medium", "roi": "Quick Win"},
        {"use_case": "Quality Control Automation", "tag": "automation",
         "impact": "Medium", "effort": "Medium", "roi": "Quick Win"},
    ],
    "Logistics": [
        {"use_case": "Route Optimization Modeling", "tag": "optimization",
         "impact": "High", "effort": "Medium", "roi": "Quick Win"},
        {"use_case": "Demand & Shipment Prediction", "tag": "ml",
         "impact": "High", "effort": "Medium", "roi": "Strategic"},
        {"use_case": "Warehouse Automation Planning", "tag": "automation",
         "impact": "Medium", "effort": "High", "roi": "Long-Term"},
    ],
    "Hospitality": [
        {"use_case": "Revenue & Demand Forecasting", "tag": "ml",
         "impact": "High", "effort": "Low", "roi": "Quick Win"},
        {"use_case": "Operations Optimization", "tag": "optimization",
         "impact": "High", "effort": "Medium", "roi": "Strategic"},
        {"use_case": "Customer Intelligence & Personalization", "tag": "analytics",
         "impact": "Medium", "effort": "Medium", "roi": "Strategic"},
    ],
    "Financial Services": [
        {"use_case": "Document & Claims Automation", "tag": "automation",
         "impact": "High", "effort": "Low", "roi": "Quick Win"},
        {"use_case": "Risk Scoring & Fraud Detection", "tag": "ml",
         "impact": "High", "effort": "High", "roi": "Strategic"},
        {"use_case": "Customer Analytics & Churn Prediction", "tag": "analytics",
         "impact": "Medium", "effort": "Medium", "roi": "Strategic"},
    ],
    "Default": [
        {"use_case": "Process & Workflow Automation", "tag": "automation",
         "impact": "High", "effort": "Low", "roi": "Quick Win"},
        {"use_case": "Predictive Analytics", "tag": "ml",
         "impact": "High", "effort": "Medium", "roi": "Strategic"},
        {"use_case": "Customer Intelligence", "tag": "analytics",
         "impact": "Medium", "effort": "Medium", "roi": "Strategic"},
        {"use_case": "Forecast Modeling", "tag": "ml",
         "impact": "Medium", "effort": "Medium", "roi": "Strategic"},
    ],
}

EFFORT_TO_SCORE = {"Low": 3, "Medium": 2, "High": 1}
IMPACT_TO_SCORE = {"High": 3, "Medium": 2, "Low": 1}
ROI_TO_SCORE    = {"Quick Win": 3, "Strategic": 2, "Long-Term": 1}


def _rank_use_cases(use_cases: list, readiness_score: float) -> list:
    """Rank by impact/effort ratio, boosting quick wins for lower-readiness orgs."""
    def _priority(uc):
        effort  = EFFORT_TO_SCORE[uc["effort"]]
        impact  = IMPACT_TO_SCORE[uc["impact"]]
        roi     = ROI_TO_SCORE[uc["roi"]]
        # Lower-readiness companies → prefer easier wins
        effort_weight = 2.0 if readiness_score < 50 else 1.0
        return (impact * 1.5) + (effort * effort_weight) + roi
    return sorted(use_cases, key=_priority, reverse=True)


def generate_opportunities(company: Company, score: Score, db: Session) -> list:
    """Generate and persist ranked opportunities for a company."""

    # Clear existing opportunities
    db.query(Opportunity).filter(Opportunity.company_id == company.id).delete()
    db.flush()

    industry = company.industry or "Default"
    use_cases = USE_CASE_LIBRARY.get(industry, USE_CASE_LIBRARY["Default"])

    # Always add default cases if industry-specific list is short
    if len(use_cases) < 3:
        use_cases += USE_CASE_LIBRARY["Default"]

    ranked = _rank_use_cases(use_cases, score.overall_score)

    opportunities = []
    for i, uc in enumerate(ranked[:5], start=1):  # top 5
        opp = Opportunity(
            company_id=company.id,
            use_case=uc["use_case"],
            use_case_tag=uc["tag"],
            impact_estimate=uc["impact"],
            implementation_effort=uc["effort"],
            roi_classification=uc["roi"],
            rank=i,
        )
        db.add(opp)
        opportunities.append(opp)

    db.commit()
    for o in opportunities:
        db.refresh(o)
    return opportunities
