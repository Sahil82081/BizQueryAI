# Database

BizQuery AI is designed to support multi-schema PostgreSQL databases natively.

## Schema Support
By utilizing `information_schema.columns` and `information_schema.tables`, the system dynamically detects tables across `public`, `finance`, `hr`, etc.

## Permissions
The database must be accessed using a dedicated read-only role (`bizquery_readonly`). See `sql-safety.md` for role creation scripts.
