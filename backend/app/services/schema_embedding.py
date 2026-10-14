import os
import json
import hashlib
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
        os.makedirs(self.vector_dir, exist_ok=True)
        self.index_path = os.path.join(self.vector_dir, "faiss.index")
        self.meta_path = os.path.join(self.vector_dir, "metadata.json")
        
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self._load_store()
        except Exception:
            self.model = None

    def _load_store(self):
        if not self.model:
            return
        try:
            import faiss
            if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
                self.index = faiss.read_index(self.index_path)
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            else:
                self._init_store()
        except Exception:
            self._init_store()

    def _init_store(self):
        if not self.model:
            return
        try:
            import faiss
            self.index = faiss.IndexFlatL2(self.model.get_sentence_embedding_dimension())
            self.metadata = {}
        except Exception:
            self.index = None

    def _save_store(self):
        if not self.index:
            return
        try:
            import faiss
            faiss.write_index(self.index, self.index_path)
            with open(self.meta_path, "w", encoding="utf-8") as f:
                json.dump(self.metadata, f)
        except Exception:
            pass

    def _hash_table(self, table: TableMetadata) -> str:
        s = f"{table.name}:" + ",".join([f"{c.name}({c.type})" for c in table.columns])
        return hashlib.md5(s.encode()).hexdigest()

    def _create_doc(self, table: TableMetadata) -> str:
        cols = ", ".join([f"{c.name} ({c.type})" for c in table.columns])
        return f"Table {table.name}. Columns: {cols}"

    def update_embeddings(self, tables: List[TableMetadata]):
        if not self.model:
            return
        new_meta = {}
        docs_to_embed = []
        ids_to_embed = []
        
        for i, table in enumerate(tables):
            thash = self._hash_table(table)
            new_meta[str(i)] = {"name": table.name, "hash": thash, "doc": self._create_doc(table)}
            
            # Simple approach: Rebuild index entirely if anything changes to avoid complex FAISS ID management for this demo
            docs_to_embed.append(new_meta[str(i)]["doc"])
            ids_to_embed.append(i)

        if docs_to_embed:
            self._init_store() # Rebuild
            embeddings = self.model.encode(docs_to_embed)
            self.index.add(np.array(embeddings).astype('float32'))
            self.metadata = new_meta
            self._save_store()
