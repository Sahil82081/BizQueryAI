import os
import faiss
import numpy as np

class VectorStoreService:
    def __init__(self, vector_db_path: str = "./vector_db"):
        self.vector_db_path = vector_db_path
        self.index_path = os.path.join(vector_db_path, "schema_index.faiss")
        self.dimension = 384  # Default for sentence-transformers all-MiniLM-L6-v2
        
        if not os.path.exists(vector_db_path):
            os.makedirs(vector_db_path)
            
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
        else:
            # Using Inner Product (for cosine similarity if vectors are normalized)
            # or L2 distance. Let's use L2 for simplicity
            self.index = faiss.IndexFlatL2(self.dimension)
            
    def add_vectors(self, embeddings: np.ndarray, ids: list[int]):
        """Adds vectors to the FAISS index with specific IDs."""
        # FAISS IndexFlatL2 doesn't support add_with_ids directly, need IndexIDMap
        if not isinstance(self.index, faiss.IndexIDMap):
            base_index = self.index
            self.index = faiss.IndexIDMap(base_index)
            
        embeddings = np.array(embeddings).astype('float32')
        ids_array = np.array(ids).astype('int64')
        self.index.add_with_ids(embeddings, ids_array)
        self.save_index()
        
    def remove_vectors(self, ids: list[int]):
        """Removes vectors from the index by IDs."""
        if isinstance(self.index, faiss.IndexIDMap) or isinstance(self.index, faiss.IndexIDMap2):
            ids_array = np.array(ids).astype('int64')
            self.index.remove_ids(ids_array)
            self.save_index()
            
    def search(self, query_embedding: np.ndarray, top_k: int = 5):
        """Searches the index for the closest vectors."""
        if self.index.ntotal == 0:
            return [], []
            
        query_embedding = np.array(query_embedding).astype('float32')
        distances, indices = self.index.search(query_embedding, top_k)
        return distances[0], indices[0]
        
    def save_index(self):
        faiss.write_index(self.index, self.index_path)
        
    def get_total_vectors(self):
        return self.index.ntotal
