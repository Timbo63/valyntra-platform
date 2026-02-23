from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from models import Score, Opportunity, Provider, Match, Company
from schemas import ScoreOut, OpportunityOut, ProviderOut, ProviderCreate, MatchOut, DashboardOut
from security import get_current_user, get_current_admin

# ── Scores ───────────────────────────────────────────────────────────────
scores_router = APIRouter(prefix="/api/scores", tags=["scores"])

@scores_router.get("/{company_id}", response_model=ScoreOut)
def get_score(company_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    _assert_owns(company_id, current_user, db)
    score = db.query(Score).filter(Score.company_id == company_id).order_by(Score.calculated_at.desc()).first()
    if not score:
        raise HTTPException(status_code=404, detail="No score found. Submit an assessment first.")
    return score


# ── Opportunities ─────────────────────────────────────────────────────────
opps_router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])

@opps_router.get("/{company_id}", response_model=list[OpportunityOut])
def get_opportunities(company_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    _assert_owns(company_id, current_user, db)
    return db.query(Opportunity).filter(Opportunity.company_id == company_id).order_by(Opportunity.rank).all()


# ── Providers ─────────────────────────────────────────────────────────────
providers_router = APIRouter(prefix="/api/providers", tags=["providers"])

@providers_router.get("", response_model=list[ProviderOut])
def list_providers(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Provider).filter(Provider.is_active == True).all()

@providers_router.post("", response_model=ProviderOut)
def create_provider(payload: ProviderCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    provider = Provider(**payload.model_dump())
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider

@providers_router.delete("/{provider_id}", status_code=204)
def delete_provider(provider_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    p = db.query(Provider).filter(Provider.id == provider_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Provider not found")
    p.is_active = False
    db.commit()


# ── Matches ───────────────────────────────────────────────────────────────
matches_router = APIRouter(prefix="/api/matches", tags=["matches"])

@matches_router.get("/{company_id}", response_model=list[MatchOut])
def get_matches(company_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    _assert_owns(company_id, current_user, db)
    return (
        db.query(Match)
        .filter(Match.company_id == company_id)
        .order_by(Match.weighted_score.desc())
        .all()
    )


# ── Dashboard ─────────────────────────────────────────────────────────────
dashboard_router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@dashboard_router.get("/{company_id}", response_model=DashboardOut)
def get_dashboard(company_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    company = _assert_owns(company_id, current_user, db)
    score = db.query(Score).filter(Score.company_id == company_id).order_by(Score.calculated_at.desc()).first()
    opportunities = db.query(Opportunity).filter(Opportunity.company_id == company_id).order_by(Opportunity.rank).all()
    matches = db.query(Match).filter(Match.company_id == company_id).order_by(Match.weighted_score.desc()).all()
    total_value = sum(m.est_pilot_value or 0 for m in matches)
    return DashboardOut(
        company=company,
        score=score,
        opportunities=opportunities,
        matches=matches,
        total_pipeline_value=total_value,
    )


# ── Helpers ───────────────────────────────────────────────────────────────
def _assert_owns(company_id: int, current_user, db: Session):
    company = db.query(Company).filter(
        Company.id == company_id,
        Company.owner_id == current_user.id,
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
