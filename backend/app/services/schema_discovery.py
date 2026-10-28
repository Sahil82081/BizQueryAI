import os
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.schema_info import ColumnMetadata, TableMetadata, SchemaMetadata, FullDatabaseSchema, SyncReport, ForeignKeyInfo
from app.utils.paths import get_data_dir

class SchemaDiscoveryService:
    def __init__(self, db: Session, connection_id: str = "default"):
        self.db = db
        self.connection_id = connection_id
        # Namespace the cache per connection
        cache_dir = os.path.join(get_data_dir(), "schema_caches")
        os.makedirs(cache_dir, exist_ok=True)
        self.cache_file = os.path.join(cache_dir, f"schema_{connection_id}.json")

    def discover_full_schema(self) -> FullDatabaseSchema:
        columns_query = text("""
            SELECT c.table_schema, c.table_name, c.column_name, c.data_type, c.is_nullable
            FROM information_schema.columns c
            JOIN information_schema.tables t ON c.table_schema = t.table_schema AND c.table_name = t.table_name
            WHERE c.table_schema NOT IN ('information_schema', 'pg_catalog') 
              AND c.table_schema NOT LIKE 'pg_toast%'
              AND t.table_type = 'BASE TABLE'
            ORDER BY c.table_schema, c.table_name, c.ordinal_position;
        """)
        
        pk_query = text("""
            SELECT tc.table_schema, tc.table_name, kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_schema NOT IN ('information_schema', 'pg_catalog') 
              AND tc.table_schema NOT LIKE 'pg_toast%';
        """)
        
        fk_query = text("""
            SELECT tc.table_schema, tc.table_name, kcu.column_name, ccu.table_schema, ccu.table_name, ccu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema NOT IN ('information_schema', 'pg_catalog') 
              AND tc.table_schema NOT LIKE 'pg_toast%';
        """)
        
        try:
            columns_res = self.db.execute(columns_query).fetchall()
            pk_res = self.db.execute(pk_query).fetchall()
            fk_res = self.db.execute(fk_query).fetchall()
        except Exception as e:
            print(f"Error querying schema: {e}")
            return FullDatabaseSchema(schemas=[])

        pks = {f"{r[0]}.{r[1]}.{r[2]}" for r in pk_res}
        fks = {f"{r[0]}.{r[1]}.{r[2]}": ForeignKeyInfo(target_schema=r[3], target_table=r[4], target_column=r[5]) for r in fk_res}

        schemas_dict = {}
        pii_patterns = ['email', 'phone', 'address', 'salary', 'bank', 'ssn', 'password', 'credit']
        
        for row in columns_res:
            s_name, t_name, c_name, d_type, is_null = row
            if any(p in c_name.lower() for p in pii_patterns):
                continue
            
            if s_name not in schemas_dict: schemas_dict[s_name] = {}
            if t_name not in schemas_dict[s_name]: schemas_dict[s_name][t_name] = []
                
            col_key = f"{s_name}.{t_name}.{c_name}"
            schemas_dict[s_name][t_name].append(ColumnMetadata(
                name=c_name, type=d_type, nullable=(is_null == 'YES'),
                primary_key=(col_key in pks), foreign_key=fks.get(col_key)
            ))
            
        result_schemas = []
        for s_name, tables in schemas_dict.items():
            result_tables = [TableMetadata(name=t_name, schema_name=s_name, columns=cols) for t_name, cols in tables.items()]
            result_schemas.append(SchemaMetadata(name=s_name, tables=result_tables))
            
        return FullDatabaseSchema(schemas=result_schemas)

    def load_cached_schema(self) -> Optional[FullDatabaseSchema]:
        if os.path.exists(self.cache_file):
            with open(self.cache_file, "r", encoding="utf-8") as f:
                try: return FullDatabaseSchema(**json.load(f))
                except: return None
        return None

    def save_schema(self, schema: FullDatabaseSchema):
        with open(self.cache_file, "w", encoding="utf-8") as f:
            f.write(schema.model_dump_json())

    def compute_diff(self, old_schema: Optional[FullDatabaseSchema], new_schema: FullDatabaseSchema) -> SyncReport:
        added_schemas, removed_schemas = [], []
        added_tables, removed_tables, modified_tables = [], [], []
        added_cols, removed_cols = [], []
        
        old_schemas_map = {s.name: s for s in (old_schema.schemas if old_schema else [])}
        new_schemas_map = {s.name: s for s in new_schema.schemas}
        
        for s_name in new_schemas_map:
            if s_name not in old_schemas_map:
                added_schemas.append(s_name)
        for s_name in old_schemas_map:
            if s_name not in new_schemas_map:
                removed_schemas.append(s_name)
                
        old_tables_map = {}
        if old_schema:
            for s in old_schema.schemas:
                for t in s.tables:
                    old_tables_map[f"{s.name}.{t.name}"] = t
                    
        new_tables_map = {}
        for s in new_schema.schemas:
            for t in s.tables:
                new_tables_map[f"{s.name}.{t.name}"] = t
                
        for t_key in new_tables_map:
            if t_key not in old_tables_map:
                added_tables.append(t_key)
        for t_key in old_tables_map:
            if t_key not in new_tables_map:
                removed_tables.append(t_key)
                
        for t_key, new_t in new_tables_map.items():
            if t_key in old_tables_map:
                old_t = old_tables_map[t_key]
                old_cols = {c.name for c in old_t.columns}
                new_cols = {c.name for c in new_t.columns}
                if (new_cols - old_cols) or (old_cols - new_cols):
                    modified_tables.append(t_key)
                for c in new_cols - old_cols:
                    added_cols.append(f"{t_key}.{c}")
                for c in old_cols - new_cols:
                    removed_cols.append(f"{t_key}.{c}")
                    
        return SyncReport(
            status="success",
            added_schemas=added_schemas,
            removed_schemas=removed_schemas,
            added_tables=added_tables,
            removed_tables=removed_tables,
            modified_tables=modified_tables,
            added_columns=added_cols,
            removed_columns=removed_cols,
            last_synced=datetime.utcnow().isoformat()
        )

    def refresh_schema(self) -> SyncReport:
        old_schema = self.load_cached_schema()
        new_schema = self.discover_full_schema()
        self.save_schema(new_schema)
        
        # Incremental Indexing
        from app.services.schema_embedding import SchemaEmbeddingService
        embed_service = SchemaEmbeddingService(self.connection_id)
        all_tables = []
        for schema in new_schema.schemas:
            all_tables.extend(schema.tables)
        embed_service.update_embeddings(all_tables)
        
        return SyncReport(status="success", last_synced=datetime.utcnow().isoformat())
