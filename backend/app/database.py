from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.orm import Session
from fastapi import Request, HTTPException
from app.services.connection_manager import ConnectionManager

Base = declarative_base()

# Cache engines to avoid exhausting connection pools
_engines = {}

def get_engine_for_connection(conn_id: str):
    if conn_id in _engines:
        return _engines[conn_id]
        
    cm = ConnectionManager()
    conn_info = cm.get_connection(conn_id)
    if not conn_info:
        raise ValueError("Database connection not found.")
        
    engine = create_engine(conn_info["url"], pool_pre_ping=True, pool_size=5, max_overflow=10)
    _engines[conn_id] = engine
    return engine

def get_db(request: Request):
    conn_id = request.headers.get("X-Connection-ID")
    if not conn_id:
        raise HTTPException(status_code=400, detail="X-Connection-ID header is missing.")
        
    try:
        engine = get_engine_for_connection(conn_id)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
