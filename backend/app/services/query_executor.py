from typing import List, Optional
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.services.sql_validator import SQLValidator
from app.services.llm_service import LLMService
import logging

logger = logging.getLogger(__name__)

class QueryExecutionService:
    def __init__(self, db: Session, llm_service: LLMService, schemas: Optional[List[str]] = None):
        self.db = db
        self.llm = llm_service
        self.schemas = schemas or []
        self.MAX_RETRIES = 1
        self.TIMEOUT_MS = 5000  # 5 seconds
        
    def execute_with_retries(self, sql: str, question: str, retries: int = 0) -> dict:
        # Strip markdown blocks and trailing semicolons
        sql = sql.strip().strip('`')
        if sql.lower().startswith('sql'):
            sql = sql[3:].strip()
        sql = sql.rstrip(';')
            
        is_valid, msg = SQLValidator.validate_query(sql)
        if not is_valid:
            return {"error": msg, "sql": sql}
            
        try:
            # Enforce timeout
            self.db.execute(text(f"SET statement_timeout = {self.TIMEOUT_MS}"))

            # Automatically include all relevant database schemas in PostgreSQL search_path
            if self.schemas:
                ordered_schemas = ["public"] + [s for s in self.schemas if s and s != "public"]
                self.db.execute(text(f"SET search_path = {', '.join(ordered_schemas)}"))
            
            # Wrap query to enforce hard limit
            safe_sql = f"SELECT * FROM ({sql}) AS subq LIMIT 1000"
            result = self.db.execute(text(safe_sql))
            rows = [dict(row._mapping) for row in result]
            
            return {"results": rows, "sql": sql}
            
        except SQLAlchemyError as e:
            self.db.rollback()
            error_str = str(e)
            logger.error(f"SQL Execution Error: {error_str}")
            
            if retries < self.MAX_RETRIES:
                logger.info("Attempting LLM correction...")
                correction = self.llm.fix_sql(question, sql, error_str)
                new_sql = correction.get("sql")
                if new_sql and new_sql != sql:
                    return self.execute_with_retries(new_sql, question, retries + 1)
                    
            return {"error": "Query execution failed on the database (e.g., table not found or syntax error).", "sql": sql}
