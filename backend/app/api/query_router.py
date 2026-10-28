import os
import json
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.query_info import QueryRequest, QueryResponse
from app.services.llm_service import LLMService
from app.services.schema_discovery import SchemaDiscoveryService
from app.services.schema_retrieval import SchemaRetrievalService
from app.services.query_executor import QueryExecutionService
from app.services.analytics_engine import AnalyticsEngine

router = APIRouter(prefix="/api/query", tags=["query"])

def load_glossary():
    from app.utils.paths import get_data_dir
    data_dir_path = os.path.join(get_data_dir(), "business_glossary.json")
    if os.path.exists(data_dir_path):
        with open(data_dir_path, "r", encoding="utf-8") as f:
            return json.load(f)
    fallback_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "business_glossary.json")
    if os.path.exists(fallback_path):
        with open(fallback_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@router.post("/generate", response_model=QueryResponse)
def generate_query(request: Request, req: QueryRequest, db: Session = Depends(get_db)):
    conn_id = request.headers.get("X-Connection-ID")
    if not conn_id: raise HTTPException(400, "Missing X-Connection-ID")
    
    discovery_service = SchemaDiscoveryService(db, conn_id)
    full_schema = discovery_service.load_cached_schema()
    
    all_tables = []
    schema_names = []
    if full_schema:
        for s in full_schema.schemas:
            if s.name and s.name not in schema_names and s.name not in ('pg_catalog', 'information_schema'):
                schema_names.append(s.name)
            for t in s.tables:
                if not getattr(t, "schema_name", None):
                    t.schema_name = s.name
                all_tables.append(t)
            
    if not all_tables:
        return QueryResponse(error="Database schema is empty or not indexed.")

    glossary = load_glossary()
    retrieval_service = SchemaRetrievalService(conn_id)
    retrieved_tables = retrieval_service.retrieve_tables(req.question, all_tables, top_k=10, glossary=glossary)
    
    schema_strings = []
    for rt in retrieved_tables:
        cols = ", ".join([f"{c.name} ({c.type})" for c in rt.columns])
        prefix = f"{rt.schema_name}." if getattr(rt, "schema_name", None) else ""
        schema_strings.append(f"Table {prefix}{rt.name}: {cols}")
        
    llm = LLMService()
    llm_output = llm.generate_sql(req.question, schema_strings, glossary)
    
    if llm_output.get("error"):
        return QueryResponse(error=llm_output.get("explanation"))
        
    if llm_output.get("needs_clarification"):
        return QueryResponse(
            needs_clarification=True,
            clarification_message=llm_output.get("clarification_message"),
            confidence=llm_output.get("confidence", 0.0)
        )
        
    generated_sql = llm_output.get("sql", "")
    executor = QueryExecutionService(db, llm, schemas=schema_names)
    exec_result = executor.execute_with_retries(generated_sql, req.question)
    final_sql = exec_result.get("sql", generated_sql)
    
    if exec_result.get("error"):
        return QueryResponse(sql=final_sql, explanation=llm_output.get("explanation"), confidence=0.0, error=exec_result.get("error"))

    rows = exec_result.get("results", [])
    columns = list(rows[0].keys()) if rows else []
    kpis = AnalyticsEngine.extract_kpis(rows, columns)
    chart = AnalyticsEngine.recommend_chart(rows, columns)

    return QueryResponse(
        sql=final_sql,
        explanation=llm_output.get("explanation"),
        tables_used=llm_output.get("tables_used", []),
        confidence=llm_output.get("confidence", 1.0),
        columns=columns,
        rows=rows,
        kpis=kpis,
        chart=chart,
        summary=f"Found {len(rows)} record(s)."
    )
