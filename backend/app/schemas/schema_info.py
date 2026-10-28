from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class ForeignKeyInfo(BaseModel):
    target_schema: str
    target_table: str
    target_column: str

class ColumnMetadata(BaseModel):
    name: str
    type: str
    nullable: bool
    primary_key: bool = False
    foreign_key: Optional[ForeignKeyInfo] = None

class TableMetadata(BaseModel):
    name: str
    schema_name: Optional[str] = None
    columns: List[ColumnMetadata]

class SchemaMetadata(BaseModel):
    name: str
    tables: List[TableMetadata]

class FullDatabaseSchema(BaseModel):
    schemas: List[SchemaMetadata]

class SyncReport(BaseModel):
    status: str
    added_schemas: List[str] = []
    removed_schemas: List[str] = []
    added_tables: List[str] = []
    removed_tables: List[str] = []
    modified_tables: List[str] = []
    added_columns: List[str] = []
    removed_columns: List[str] = []
    last_synced: str

class SchemaSummary(BaseModel):
    num_schemas: int
    num_tables: int
    num_columns: int
    num_relationships: int
