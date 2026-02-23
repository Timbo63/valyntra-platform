# Valyntra Platform — MVP

AI Adoption & Operational Intelligence Platform

## Stack
- **Backend**: Python 3.11 + FastAPI
- **Database**: PostgreSQL (via SQLAlchemy + Alembic)
- **Auth**: Supabase Auth
- **Hosting**: Render or Railway
- **Frontend**: React + Vite

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # fill in your values
alembic upgrade head      # run migrations
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env      # fill in your values
npm run dev
```

## API Docs
Once running: http://localhost:8000/docs

## Project Structure
```
valyntra/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, security
│   │   ├── db/           # Database session
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── alembic/          # DB migrations
│   └── tests/
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        └── services/
```
