# Database Security

To ensure BizQuery AI operates securely, it must NEVER connect to PostgreSQL using a superuser account.

## Setting up a Read-Only User

Execute the following commands in your PostgreSQL database to create a strictly read-only role:

```sql
-- 1. Create a read-only role
CREATE ROLE bizquery_readonly WITH LOGIN PASSWORD 'your_secure_password';

-- 2. Grant connection access
GRANT CONNECT ON DATABASE your_database TO bizquery_readonly;

-- 3. Grant schema usage (repeat for 'finance', 'hr', etc.)
GRANT USAGE ON SCHEMA public TO bizquery_readonly;

-- 4. Grant SELECT only on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bizquery_readonly;

-- 5. Automatically grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bizquery_readonly;
```

Update your `.env` file to use this user:
`DATABASE_URL=postgresql://bizquery_readonly:your_secure_password@localhost:5432/your_database`
