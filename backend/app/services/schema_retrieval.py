import os
import json
from typing import List, Dict, Any
from app.config import settings
from app.schemas.schema_info import TableMetadata

class SchemaRetrievalService:
    def __init__(self, connection_id: str = "default"):
        self.connection_id = connection_id
        self.model = None
        self.index = None
        self.metadata = {}
        
        self.vector_dir = os.path.join(settings.VECTOR_DB_PATH, connection_id)
        self.index_path = os.path.join(self.vector_dir, "faiss.index")
        self.meta_path = os.path.join(self.vector_dir, "metadata.json")
        
        try:
            import faiss
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
                self.index = faiss.read_index(self.index_path)
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
        except Exception:
            self.model = None
            self.index = None

    def retrieve_tables(self, query: str, all_tables: List[TableMetadata], top_k: int = 5) -> List[TableMetadata]:
        retrieved_names = []
        if self.model and self.index and self.index.ntotal > 0:
            try:
                q_emb = self.model.encode([query]).astype('float32')
                k = min(top_k, self.index.ntotal)
                D, I = self.index.search(q_emb, k)
                for idx in I[0]:
                    if str(idx) in self.metadata:
                        retrieved_names.append(self.metadata[str(idx)]["name"])
            except Exception:
                pass
                
        # Also keyword match
        query_words = set(query.lower().split())
        for t in all_tables:
            if any(w in t.name.lower() for w in query_words) and t.name not in retrieved_names:
                retrieved_names.append(t.name)

        # Foreign Key relationship expansion
        expanded_targets = set(retrieved_names)
        for t in all_tables:
            for c in t.columns:
                if c.foreign_key:
                    if c.foreign_key.target_table in expanded_targets:
                        if t.name not in retrieved_names:
                            retrieved_names.append(t.name)
                    if t.name in expanded_targets:
                        if c.foreign_key.target_table not in retrieved_names:
                            retrieved_names.append(c.foreign_key.target_table)
                
        matched = [t for t in all_tables if t.name in retrieved_names]
        if not matched:
            return all_tables[:top_k]
        return matched[:top_k]

