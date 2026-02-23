"""
Valyntra AI Readiness Scoring Engine
Weights from Lead_Prioritization_Model in CRM
"""
from sqlalchemy.orm import Session
from app.models.models import Assessment, Score, Company


# Category weights (sum to 1.0)
WEIGHTS = {
    "data_maturity": 0.30,
    "process_automation": 0.25,
    "leadership_alignment": 0.25,
    "technical_infrastructure": 0.20,
}

# Recommendation thresholds
def _recommendation_level(score: float) -> str:
    if score >= 70:
        return "Ready"
    elif score >= 45:
        return "Developing"
    else:
        return "Early Stage"


def calculate_score(assessment: Assessment, db: Session) -> Score:
    """Calculate readiness score from assessment inputs (1-5 scale → 0-100)."""

    def normalize(val: int) -> float:
        return ((val - 1) / 4) * 100  # maps 1→0, 5→100

    dm  = normalize(assessment.data_maturity)
    pa  = normalize(assessment.process_automation)
    la  = normalize(assessment.leadership_alignment)
    ti  = normalize(assessment.technical_infrastructure)

    overall = (
        dm  * WEIGHTS["data_maturity"] +
        pa  * WEIGHTS["process_automation"] +
        la  * WEIGHTS["leadership_alignment"] +
        ti  * WEIGHTS["technical_infrastructure"]
    )

    # Remove existing score if re-assessing
    existing = db.query(Score).filter(Score.assessment_id == assessment.id).first()
    if existing:
        db.delete(existing)
        db.flush()

    score = Score(
        assessment_id=assessment.id,
        company_id=assessment.company_id,
        overall_score=round(overall, 1),
        data_maturity_score=round(dm, 1),
        process_automation_score=round(pa, 1),
        leadership_alignment_score=round(la, 1),
        technical_infrastructure_score=round(ti, 1),
        recommendation_level=_recommendation_level(overall),
    )
    db.add(score)
    db.commit()
    db.refresh(score)
    return score
