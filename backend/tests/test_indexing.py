import pytest
import os
import shutil
import numpy as np
from app.services.schema_embedding import SchemaEmbeddingService
from app.services.vector_store import VectorStoreService
from app.schemas.schema_info import TableMetadata, ColumnMetadata
from app.config import settings
import json

@pytest.fixture
def clean_vector_db():
    if os.path.exists(settings.VECTOR_DB_PATH):
        shutil.rmtree(settings.VECTOR_DB_PATH)
    yield
    if os.path.exists(settings.VECTOR_DB_PATH):
        shutil.rmtree(settings.VECTOR_DB_PATH)

def test_vector_store_initialization(clean_vector_db):
    store = VectorStoreService(settings.VECTOR_DB_PATH)
    assert store.get_total_vectors() == 0
    assert os.path.exists(settings.VECTOR_DB_PATH)

def test_incremental_indexing(clean_vector_db):
    service = SchemaEmbeddingService()
    
    table1 = TableMetadata(
        name="users",
        columns=[ColumnMetadata(name="id", type="int", nullable=False, primary_key=True)]
    )
    
    # Initial Indexing (New)
    stats = service.update_embeddings([table1])
    assert stats["added"] == 1
    assert stats["unchanged"] == 0
    
    # Unchanged
    stats2 = service.update_embeddings([table1])
    assert stats2["added"] == 0
    assert stats2["unchanged"] == 1
    
    # Changed
    table1_mod = TableMetadata(
        name="users",
        columns=[
            ColumnMetadata(name="id", type="int", nullable=False, primary_key=True),
            ColumnMetadata(name="email", type="str", nullable=True, primary_key=False)
        ]
    )
    stats3 = service.update_embeddings([table1_mod])
    assert stats3["updated"] == 1
    
    # Deleted
    stats4 = service.update_embeddings([])
    assert stats4["deleted"] == 1
    
def test_corrupted_index_handling(clean_vector_db):
    store = VectorStoreService(settings.VECTOR_DB_PATH)
    store.add_vectors([[0.1]*384], [1])
    store.save_index()
    
    # Corrupt index file
    with open(store.index_path, "wb") as f:
        f.write(b"corrupted data")
        
    # Attempting to load should probably raise an error or be handled.
    # We will just verify it raises an exception (FAISS throws RuntimeError)
    with pytest.raises(Exception):
        VectorStoreService(settings.VECTOR_DB_PATH)
