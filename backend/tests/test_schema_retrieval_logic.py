import pytest
from app.services.schema_retrieval import SchemaRetrievalService
from app.schemas.schema_info import TableMetadata, ColumnMetadata, ForeignKeyInfo
from app.config import settings
import shutil
import os

@pytest.fixture
def retrieval_setup():
    if os.path.exists(settings.VECTOR_DB_PATH):
        shutil.rmtree(settings.VECTOR_DB_PATH)
    
    # Needs some vectors to avoid empty search errors, but we can test keyword + expansion easily
    yield
    if os.path.exists(settings.VECTOR_DB_PATH):
        shutil.rmtree(settings.VECTOR_DB_PATH)

def test_retrieval_service_keyword_and_expansion(retrieval_setup):
    service = SchemaRetrievalService()
    
    table_a = TableMetadata(
        name="orders",
        columns=[ColumnMetadata(name="id", type="int", nullable=False)]
    )
    
    table_b = TableMetadata(
        name="order_items",
        columns=[
            ColumnMetadata(name="order_id", type="int", nullable=False, 
                           foreign_key=ForeignKeyInfo(target_schema="public", target_table="orders", target_column="id"))
        ]
    )
    
    all_tables = [table_a, table_b]
    
    # Query matching 'orders' should return orders and order_items (due to FK)
    results = service.retrieve_tables("orders", all_tables, top_k=2)
    names = {t.name for t in results}
    assert "orders" in names
    assert "order_items" in names
