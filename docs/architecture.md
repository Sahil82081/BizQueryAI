# Architecture

BizQuery AI uses a decoupled client-server architecture:

1. **Frontend (React, Vite, Tailwind, Plotly):** A pure presentation layer. It never stores secrets and communicates entirely via REST APIs.
2. **Backend (FastAPI, Python, FAISS):** The core intelligence routing engine.
3. **Database (PostgreSQL):** The business data warehouse, strictly accessed via a read-only user role.

## Flow
User Question -> FastAPI -> Schema Retrieval (FAISS) -> LLM Prompt Formulation -> Gemini API -> Raw SQL -> SQLGlot AST Validation -> PostgreSQL Execution -> KPI Engine -> Plotly Recommendation -> React UI.
