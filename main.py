from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.session import Base, engine
from api.auth import router as auth_router
from api.companies import router as companies_router
from api.assessments import router as assessments_router
from api.routes import (
    scores_router, opps_router, providers_router,
    matches_router, dashboard_router,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Valyntra Platform API",
    description="AI Adoption & Operational Intelligence Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://valyntra.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(companies_router)
app.include_router(assessments_router)
app.include_router(scores_router)
app.include_router(opps_router)
app.include_router(providers_router)
app.include_router(matches_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {"status": "ok", "platform": "Valyntra MVP", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}
