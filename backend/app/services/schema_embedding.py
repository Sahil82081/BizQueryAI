import os
import json
import hashlib
import numpy as np
from typing import List, Dict, Any
from app.config import settings
from app.schemas.schema_info import TableMetadata

class SchemaEmbeddingService:
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
            self._load_or_init()
        except Exception:
            self.model = None

    def _load_or_init(self):
        import faiss
        os.makedirs(self.vector_dir, exist_ok=True)
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.meta_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
        else:
            self._init_store()

    def _init_store(self):
        import faiss
        if self.model:
            self.index = faiss.IndexFlatL2(self.model.get_sentence_embedding_dimension())
            self.metadata = {}

    def _save_store(self):
        import faiss
        os.makedirs(self.vector_dir, exist_ok=True)
        if self.index:
            faiss.write_index(self.index, self.index_path)
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f)

    def _hash_table(self, table: TableMetadata) -> str:
        s = f"{table.name}:" + ",".join([f"{c.name}:{c.type}" for c in table.columns])
        return hashlib.md5(s.encode()).hexdigest()

    def _create_doc(self, table: TableMetadata) -> str:
        cols = ", ".join([f"{c.name} ({c.type})" for c in table.columns])
        return f"Table {table.name}. Columns: {cols}"

    def update_embeddings(self, tables: List[TableMetadata]) -> Dict[str, int]:
        if not self.model:
            return {"added": 0, "updated": 0, "unchanged": 0, "deleted": 0}
            
        old_tables = {m["name"]: m["hash"] for m in self.metadata.values()}
        new_tables = {t.name: self._hash_table(t) for t in tables}
        
        added = sum(1 for name in new_tables if name not in old_tables)
        updated = sum(1 for name, h in new_tables.items() if name in old_tables and old_tables[name] != h)
        unchanged = sum(1 for name, h in new_tables.items() if name in old_tables and old_tables[name] == h)
        deleted = sum(1 for name in old_tables if name not in new_tables)

        new_meta = {}
        docs_to_embed = []
        for i, table in enumerate(tables):
            thash = new_tables[table.name]
            new_meta[str(i)] = {"name": table.name, "hash": thash, "doc": self._create_doc(table)}
            docs_to_embed.append(new_meta[str(i)]["doc"])

        self._init_store()
        if docs_to_embed:
            embeddings = self.model.encode(docs_to_embed)
            self.index.add(np.array(embeddings).astype('float32'))
        self.metadata = new_meta
        self._save_store()

        return {"added": added, "updated": updated, "unchanged": unchanged, "deleted": deleted}
