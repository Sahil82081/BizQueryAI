import os
import json
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text
from app.utils.paths import get_data_dir

def get_connections_file_path() -> str:
    return os.path.join(get_data_dir(), "connections.json")

def sanitize_connection_url(url: str) -> str:
    """
    Sanitizes database connection URLs:
    - Trims whitespace and extracts only the URL token to prevent accidental concatenation 
      of trailing environment variables (e.g. '...&channel_binding=require GEMINI_API_KEY=...').
    - Normalizes 'postgresql://' or 'postgres://' schemes to 'postgresql+psycopg://' so that
      SQLAlchemy uses psycopg (v3) seamlessly without requiring psycopg2.
    """
    if not url:
        return url
    parts = url.strip().split()
    if not parts:
        return ""
    clean_url = parts[0]

    if clean_url.startswith("postgres://"):
        clean_url = "postgresql+psycopg://" + clean_url[len("postgres://"):]
    elif clean_url.startswith("postgresql://") and not clean_url.startswith("postgresql+"):
        clean_url = "postgresql+psycopg://" + clean_url[len("postgresql://"):]

    return clean_url

class ConnectionManager:
    def __init__(self):
        self.connections_file = get_connections_file_path()
        os.makedirs(os.path.dirname(self.connections_file), exist_ok=True)
        if not os.path.exists(self.connections_file):
            with open(self.connections_file, "w") as f:
                json.dump([], f)
                
    def get_all_connections(self, mask_passwords=True) -> List[Dict[str, Any]]:
        if not os.path.exists(self.connections_file):
            return []
        with open(self.connections_file, "r") as f:
            conns = json.load(f)
            
        if mask_passwords:
            for c in conns:
                # Basic masking for URL
                if "url" in c and "@" in c["url"]:
                    parts = c["url"].split("@")
                    auth = parts[0].split("://")
                    if len(auth) > 1 and ":" in auth[1]:
                        user = auth[1].split(":")[0]
                        c["url"] = f"{auth[0]}://{user}:***@{parts[1]}"
        return conns
        
    def get_connection(self, conn_id: str) -> Optional[Dict[str, Any]]:
        conns = self.get_all_connections(mask_passwords=False)
        for c in conns:
            if c["id"] == conn_id:
                c_copy = dict(c)
                c_copy["url"] = sanitize_connection_url(c.get("url", ""))
                return c_copy
        return None
        
    def add_connection(self, name: str, url: str) -> Dict[str, Any]:
        clean_url = sanitize_connection_url(url)
        conns = self.get_all_connections(mask_passwords=False)
        new_conn = {
            "id": str(uuid.uuid4()),
            "name": name,
            "url": clean_url,
            "status": "Connected"
        }
        conns.append(new_conn)
        with open(self.connections_file, "w") as f:
            json.dump(conns, f, indent=2)
            
        masked = dict(new_conn)
        masked["url"] = "***"
        return masked
        
    def delete_connection(self, conn_id: str):
        import shutil
        conns = self.get_all_connections(mask_passwords=False)
        conns = [c for c in conns if c["id"] != conn_id]
        with open(self.connections_file, "w") as f:
            json.dump(conns, f, indent=2)
            
        # Clean up orphaned schema caches
        cache_file = os.path.join(get_data_dir(), "schema_caches", f"schema_{conn_id}.json")
        if os.path.exists(cache_file):
            os.remove(cache_file)
            
        # Clean up orphaned vector DB index
        from app.config import settings
        vector_dir = os.path.join(settings.VECTOR_DB_PATH, conn_id)
        if os.path.exists(vector_dir):
            shutil.rmtree(vector_dir)

    def test_connection(self, url: str) -> bool:
        clean_url = sanitize_connection_url(url)
        try:
            engine = create_engine(clean_url, connect_args={"connect_timeout": 15})
            try:
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                return True
            finally:
                engine.dispose()
        except Exception as e:
            raise ValueError(str(e))
