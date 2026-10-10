from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    sql: Optional[str] = None
    explanation: Optional[str] = None
    tables_used: List[str] = []
    confidence: float = 0.0
    needs_clarification: bool = False
    clarification_message: Optional[str] = None
    error: Optional[str] = None
    
    # Stage 6 Additions
    columns: List[str] = []
    rows: List[Dict[str, Any]] = []
    summary: Optional[str] = None
    kpis: List[Dict[str, Any]] = []
    chart: Optional[Dict[str, Any]] = None
