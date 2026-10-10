# Database Setup

## PostgreSQL Setup
1. Install PostgreSQL.
2. Create a database `bizquery`.
3. Create a dedicated read-only user for production usage.
   ```sql
   CREATE USER bizquery_app WITH PASSWORD 'your_secure_password';
   GRANT CONNECT ON DATABASE bizquery TO bizquery_app;
   -- Further grants as needed for production read-only
   ```
4. Set the `DATABASE_URL` in `backend/.env`.

The application handles schema creation on startup via the seed script.
