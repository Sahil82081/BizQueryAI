import os
import json
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text

CONNECTIONS_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "connections.json")

class ConnectionManager:
    def __init__(self):
        os.makedirs(os.path.dirname(CONNECTIONS_FILE), exist_ok=True)
        if not os.path.exists(CONNECTIONS_FILE):
            with open(CONNECTIONS_FILE, "w") as f:
                json.dump([], f)
                
    def get_all_connections(self, mask_passwords=True) -> List[Dict[str, Any]]:
        with open(CONNECTIONS_FILE, "r") as f:
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
                return c
        return None
        
    def add_connection(self, name: str, url: str) -> Dict[str, Any]:
        conns = self.get_all_connections(mask_passwords=False)
        new_conn = {
            "id": str(uuid.uuid4()),
            "name": name,
            "url": url,
            "status": "Connected"
        }
        conns.append(new_conn)
        with open(CONNECTIONS_FILE, "w") as f:
            json.dump(conns, f, indent=2)
            
        masked = dict(new_conn)
        masked["url"] = "***"
        return masked
        
    def delete_connection(self, conn_id: str):
        import shutil
        conns = self.get_all_connections(mask_passwords=False)
        conns = [c for c in conns if c["id"] != conn_id]
        with open(CONNECTIONS_FILE, "w") as f:
            json.dump(conns, f, indent=2)
            
        # Clean up orphaned schema caches
        cache_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "schema_caches", f"schema_{conn_id}.json")
        if os.path.exists(cache_file):
            os.remove(cache_file)
            
        # Clean up orphaned vector DB index
        from app.config import settings
        vector_dir = os.path.join(settings.VECTOR_DB_PATH, conn_id)
        if os.path.exists(vector_dir):
            shutil.rmtree(vector_dir)

    def test_connection(self, url: str) -> bool:
        try:
            engine = create_engine(url, connect_args={"connect_timeout": 15})
            try:
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                return True
            finally:
                engine.dispose()
        except Exception as e:
            raise ValueError(str(e))
