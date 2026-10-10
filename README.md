# BizQuery AI
Natural-Language Business Intelligence Agent.

BizQuery AI allows you to ask natural language questions about your business database and instantly receive safe, validated PostgreSQL queries, KPIs, and interactive Plotly visualizations.

## Quickstart
**Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

See the `docs/` folder for comprehensive documentation on Architecture, Security, and Limitations.
