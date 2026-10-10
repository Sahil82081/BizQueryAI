import os
import json
import faiss
import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from app.config import settings
from app.schemas.schema_info import TableMetadata

class SchemaRetrievalService:
    def __init__(self, connection_id: str):
        self.connection_id = connection_id
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.vector_dir = os.path.join(settings.VECTOR_DB_PATH, connection_id)
        self.index_path = os.path.join(self.vector_dir, "faiss.index")
        self.meta_path = os.path.join(self.vector_dir, "metadata.json")
        self.index = None
        self.metadata = {}
        
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.meta_path, "r") as f:
                    self.metadata = json.load(f)
            except:
                pass

    def retrieve_tables(self, query: str, all_tables: List[TableMetadata], top_k: int = 5) -> List[TableMetadata]:
        if not self.index or self.index.ntotal == 0:
            return all_tables[:top_k]
            
        q_emb = self.model.encode([query]).astype('float32')
        k = min(top_k, self.index.ntotal)
        D, I = self.index.search(q_emb, k)
        
        retrieved_names = []
        for idx in I[0]:
            if str(idx) in self.metadata:
                retrieved_names.append(self.metadata[str(idx)]["name"])
                
        # Also keyword match
        query_words = set(query.lower().split())
        for t in all_tables:
            if any(w in t.name.lower() for w in query_words) and t.name not in retrieved_names:
                retrieved_names.append(t.name)
                
        return [t for t in all_tables if t.name in retrieved_names][:top_k]
