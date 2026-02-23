"""
Valyntra Provider Matching Engine
Matches opportunities to providers using capability tags + industry + qualification score
"""
from sqlalchemy.orm import Session
from app.models.models import Company, Opportunity, Provider, Match
import random


def _capability_match(provider: Provider, opportunity: Opportunity) -> bool:
    tags = provider.capability_tags or []
    return opportunity.use_case_tag.lower() in [t.lower() for t in tags]


def _industry_match(provider: Provider, company: Company) -> bool:
    industries = provider.industries_served or []
    if not industries:
        return True  # assume multi-industry
    normalized = [i.lower() for i in industries]
    return (company.industry or "").lower() in normalized or "multi-industry" in normalized


def _weighted_score(provider: Provider, cap_match: bool, ind_match: bool) -> float:
    """
    Weighted match score (0-100):
    - Capability match: 40pts
    - Industry match: 30pts
    - Qualification score (normalized 0-30 → 0-30pts)
    """
    cap   = 40 if cap_match else 0
    ind   = 30 if ind_match else 0
    qual  = ((provider.qualification_score or 0) / 30) * 30
    return round(cap + ind + qual, 1)


def _estimate_pilot_value(provider: Provider, opportunity: Opportunity) -> float:
    """Rough pilot value estimate based on provider size and opportunity impact."""
    base = {
        "enterprise": 300_000,
        "mid-enterprise": 150_000,
        "SMB": 50_000,
    }.get((provider.typical_project_size or "").lower(), 100_000)

    impact_mult = {"High": 1.3, "Medium": 1.0, "Low": 0.7}.get(opportunity.impact_estimate, 1.0)
    # Add some variance
    variance = random.uniform(0.85, 1.15)
    return round(base * impact_mult * variance, 0)


def run_matching(company: Company, opportunities: list, db: Session) -> list:
    """Match each opportunity to best-fit providers. Returns all Match records."""

    # Clear existing matches for this company
    db.query(Match).filter(Match.company_id == company.id).delete()
    db.flush()

    providers = db.query(Provider).filter(Provider.is_active == True).all()
    all_matches = []

    for opportunity in opportunities:
        scored = []
        for provider in providers:
            cap   = _capability_match(provider, opportunity)
            ind   = _industry_match(provider, company)
            score = _weighted_score(provider, cap, ind)
            if score > 0:
                scored.append((score, provider, cap, ind))

        # Take top 3 providers per opportunity
        top3 = sorted(scored, key=lambda x: x[0], reverse=True)[:3]

        for ws, provider, cap, ind in top3:
            match = Match(
                company_id=company.id,
                opportunity_id=opportunity.id,
                provider_id=provider.id,
                industry_match=ind,
                capability_match=cap,
                weighted_score=ws,
                est_pilot_value=_estimate_pilot_value(provider, opportunity),
                stage="Not Started",
            )
            db.add(match)
            all_matches.append(match)

    db.commit()
    for m in all_matches:
        db.refresh(m)
    return all_matches
