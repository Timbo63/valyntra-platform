from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Assessment, Company
from app.schemas.schemas import AssessmentCreate, AssessmentOut
from app.core.security import get_current_user
from app.services.scoring import calculate_score
from app.services.opportunity_engine import generate_opportunities
from app.services.matching import run_matching

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


@router.post("", response_model=AssessmentOut)
def submit_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Validate company ownership
    company = db.query(Company).filter(
        Company.id == payload.company_id,
        Company.owner_id == current_user.id,
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Validate 1-5 inputs
    for field in ["data_maturity", "process_automation", "leadership_alignment", "technical_infrastructure"]:
        val = getattr(payload, field)
        if not (1 <= val <= 5):
            raise HTTPException(status_code=422, detail=f"{field} must be between 1 and 5")

    # Save assessment
    assessment = Assessment(**payload.model_dump())
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Run full pipeline: score → opportunities → matches
    score = calculate_score(assessment, db)
    opportunities = generate_opportunities(company, score, db)
    run_matching(company, opportunities, db)

    return assessment


@router.get("/company/{company_id}", response_model=list[AssessmentOut])
def get_assessments(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    company = db.query(Company).filter(
        Company.id == company_id,
        Company.owner_id == current_user.id,
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return db.query(Assessment).filter(Assessment.company_id == company_id).all()
