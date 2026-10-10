from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.connection_manager import ConnectionManager

router = APIRouter(prefix="/api/connections", tags=["connections"])
cm = ConnectionManager()

class ConnectionCreate(BaseModel):
    name: str
    url: Optional[str] = None
    host: Optional[str] = None
    port: Optional[str] = "5432"
    database: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    ssl_mode: Optional[str] = "require"

@router.get("")
def list_connections():
    return cm.get_all_connections(mask_passwords=True)

@router.post("")
def add_connection(req: ConnectionCreate):
    if req.url:
        url = req.url
    else:
        if not all([req.host, req.database, req.username, req.password]):
            raise HTTPException(status_code=400, detail="Missing connection fields.")
        url = f"postgresql://{req.username}:{req.password}@{req.host}:{req.port}/{req.database}?sslmode={req.ssl_mode}"
        
    try:
        cm.test_connection(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")
        
    return cm.add_connection(req.name, url)

@router.delete("/{conn_id}")
def delete_connection(conn_id: str):
    cm.delete_connection(conn_id)
    return {"status": "deleted"}
    
@router.post("/test")
def test_existing_connection(req: ConnectionCreate):
    url = req.url
    if not url:
        url = f"postgresql://{req.username}:{req.password}@{req.host}:{req.port}/{req.database}?sslmode={req.ssl_mode}"
    try:
        cm.test_connection(url)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
