import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.schema_info import (
    FullDatabaseSchema, SchemaMetadata, TableMetadata, 
    ColumnMetadata, ForeignKeyInfo
)
from app.services.schema_discovery import SchemaDiscoveryService

client = TestClient(app)

@pytest.fixture
def sample_schema():
    return FullDatabaseSchema(
        schemas=[
            SchemaMetadata(
                name="public",
                tables=[
                    TableMetadata(
                        name="customers",
                        columns=[
                            ColumnMetadata(name="id", type="integer", nullable=False, primary_key=True),
                            ColumnMetadata(name="name", type="varchar", nullable=True)
                        ]
                    )
                ]
            )
        ]
    )

@pytest.fixture
def mock_db_session():
    return MagicMock()

def test_schema_diff_new_table(sample_schema, mock_db_session):
    service = SchemaDiscoveryService(mock_db_session)
    old_schema = sample_schema
    new_schema = FullDatabaseSchema(
        schemas=[
            SchemaMetadata(
                name="public",
                tables=[
                    old_schema.schemas[0].tables[0],
                    TableMetadata(
                        name="orders",
                        columns=[
                            ColumnMetadata(name="id", type="integer", nullable=False, primary_key=True)
                        ]
                    )
                ]
            )
        ]
    )
    
    report = service.compute_diff(old_schema, new_schema)
    assert "public.orders" in report.added_tables
    assert len(report.removed_tables) == 0

def test_schema_diff_deleted_table(sample_schema, mock_db_session):
    service = SchemaDiscoveryService(mock_db_session)
    new_schema = FullDatabaseSchema(schemas=[SchemaMetadata(name="public", tables=[])])
    
    report = service.compute_diff(sample_schema, new_schema)
    assert "public.customers" in report.removed_tables

def test_schema_diff_new_column(sample_schema, mock_db_session):
    service = SchemaDiscoveryService(mock_db_session)
    new_schema = FullDatabaseSchema(
        schemas=[
            SchemaMetadata(
                name="public",
                tables=[
                    TableMetadata(
                        name="customers",
                        columns=[
                            ColumnMetadata(name="id", type="integer", nullable=False, primary_key=True),
                            ColumnMetadata(name="name", type="varchar", nullable=True),
                            ColumnMetadata(name="email", type="varchar", nullable=True) # New column
                        ]
                    )
                ]
            )
        ]
    )
    
    report = service.compute_diff(sample_schema, new_schema)
    assert "public.customers.email" in report.added_columns
    assert "public.customers" in report.modified_tables

def test_schema_diff_multiple_schemas(sample_schema, mock_db_session):
    service = SchemaDiscoveryService(mock_db_session)
    new_schema = FullDatabaseSchema(
        schemas=[
            sample_schema.schemas[0],
            SchemaMetadata(
                name="finance",
                tables=[
                    TableMetadata(name="invoices", columns=[])
                ]
            )
        ]
    )
    
    report = service.compute_diff(sample_schema, new_schema)
    assert "finance" in report.added_schemas
    assert "finance.invoices" in report.added_tables

def test_malformed_db_connection_discovery():
    # When DB fails, it should return an empty schema, not crash
    class BadDB:
        def execute(self, query):
            raise Exception("Connection failed")
            
    service = SchemaDiscoveryService(BadDB())
    schema = service.discover_full_schema()
    assert len(schema.schemas) == 0

def test_api_schema_empty():
    # If no cache and discovery fails/empty, should return empty
    response = client.get("/api/schema")
    assert response.status_code == 200
    assert "schemas" in response.json()
