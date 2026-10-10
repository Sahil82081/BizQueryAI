# Backend

FastAPI application for BizQuery AI.

## Setup
1. Create virtual environment: `python -m venv venv`
2. Activate venv: `.\venv\Scripts\activate` (Windows)
3. Install requirements: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and configure `DATABASE_URL`
5. Run server: `uvicorn app.main:app --reload`
6. Run seed script: `python scripts/seed.py --size small`
