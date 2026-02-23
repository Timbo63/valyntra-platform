from sqlalchemy.orm import Session
from models import Assessment, Score


WEIGHTS = {
    "data_maturity": 0.30,
    "process_automation": 0.25,
    "leadership_alignment": 0.25,
    "technical_infrastructure": 0.20,
}

def _recommendation_level(score: float) -> str:
    if score >= 70:
        return "Ready"
    elif score >= 45:
        return "Developing"
    else:
        return "Early Stage"


def calculate_score(assessment: Assessment, db: Session) -> Score:
    def normalize(val: int) -> float:
        return ((val - 1) / 4) * 100

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
