# API Reference

### `GET /api/schema`
Returns the currently discovered database schema (schemas, tables, columns).

### `POST /api/schema/refresh`
Triggers an incremental diff of the PostgreSQL database, updating the FAISS vector index only for modified tables.

### `POST /api/query/generate`
**Payload:** `{"question": "What is our revenue?"}`
**Response:** `{"sql": "...", "results": [...], "kpis": [...], "chart": {...}}`
Executes the full NLP to SQL pipeline.
