from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.schema_discovery import SchemaDiscoveryService
from app.schemas.schema_info import FullDatabaseSchema, SyncReport

router = APIRouter(prefix="/api/schema", tags=["schema"])

@router.get("", response_model=FullDatabaseSchema)
def get_schema(request: Request, db: Session = Depends(get_db)):
    conn_id = request.headers.get("X-Connection-ID")
    if not conn_id: raise HTTPException(400, "Missing X-Connection-ID")
    service = SchemaDiscoveryService(db, conn_id)
    schema = service.load_cached_schema()
    if not schema:
        return FullDatabaseSchema(schemas=[])
    return schema

@router.post("/refresh", response_model=SyncReport)
def refresh_schema(request: Request, db: Session = Depends(get_db)):
    conn_id = request.headers.get("X-Connection-ID")
    if not conn_id: raise HTTPException(400, "Missing X-Connection-ID")
    service = SchemaDiscoveryService(db, conn_id)
    return service.refresh_schema()
