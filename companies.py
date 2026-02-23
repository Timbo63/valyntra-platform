from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Company
from app.schemas.schemas import CompanyCreate, CompanyOut
from app.core.security import get_current_user

router = APIRouter(prefix="/api/companies", tags=["companies"])


def _size_segment(employee_count: int) -> str:
    if employee_count is None:
        return "Unknown"
    if employee_count < 500:
        return "SMB"
    return "Enterprise"


@router.post("", response_model=CompanyOut)
def create_company(
    payload: CompanyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    company = Company(
        **payload.model_dump(),
        owner_id=current_user.id,
        company_size_segment=_size_segment(payload.employee_count),
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("", response_model=list[CompanyOut])
def list_companies(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return db.query(Company).filter(Company.owner_id == current_user.id).all()


@router.get("/{company_id}", response_model=CompanyOut)
def get_company(
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
    return company
