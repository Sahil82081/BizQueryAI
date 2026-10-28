import os
import json
from typing import List, Dict, Any, Optional
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
        
        # Only initialize SentenceTransformer if the index actually exists
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            try:
                import faiss
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                self.index = faiss.read_index(self.index_path)
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            except Exception:
                self.model = None
                self.index = None

    def retrieve_tables(self, query: str, all_tables: List[TableMetadata], top_k: int = 5, glossary: Optional[Dict[str, str]] = None) -> List[TableMetadata]:
        # If total database tables is small, supply all of them so we never slice off crucial context
        if len(all_tables) <= 12:
            return all_tables

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
                
        # Keyword matching on table names
        query_clean = query.lower().replace(",", " ").replace(".", " ")
        query_words = set(query_clean.split())
        for t in all_tables:
            if any(w in t.name.lower() for w in query_words) and t.name not in retrieved_names:
                retrieved_names.append(t.name)

        # Glossary term expansion (e.g. "revenue" -> mentions order_items)
        if glossary:
            for g_term, g_def in glossary.items():
                if g_term.lower() in query_clean:
                    g_def_clean = g_def.lower()
                    for t in all_tables:
                        if t.name.lower() in g_def_clean and t.name not in retrieved_names:
                            retrieved_names.append(t.name)

        # Column name keyword matching (e.g. query mentions date, month, price, amount)
        for t in all_tables:
            if t.name not in retrieved_names:
                for c in t.columns:
                    if any(w == c.name.lower() or w in c.name.lower().split('_') for w in query_words if len(w) > 3):
                        retrieved_names.append(t.name)
                        break

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
