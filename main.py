from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from session import Base, engine
from auth import router as auth_router
from companies import router as companies_router
from assessments import router as assessments_router
from routes import (
    scores_router, opps_router, providers_router,
    matches_router, dashboard_router,
)

try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
except Exception as e:
    print(f"❌ Database error: {e}")

app = FastAPI(
    title="Valyntra Platform API",
    description="AI Adoption & Operational Intelligence Platform",
    version="1.0.0",
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"❌ Unhandled error: {traceback.format_exc()}")
    return JSONResponse(status_code=500, content={"detail": str(exc), "trace": traceback.format_exc()})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
