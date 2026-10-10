import sqlglot
from sqlglot import exp
from typing import Tuple, List

class SQLValidator:
    @classmethod
    def validate_query(cls, sql: str, available_tables: List[str] = None) -> Tuple[bool, str]:
        if not sql:
            return False, "Query is empty."
            
        try:
            # Strip markdown formatting if any
            sql = sql.strip().strip('`')
            if sql.lower().startswith('sql'):
                sql = sql[3:].strip()
                
            statements = sqlglot.parse(sql, read="postgres")
        except Exception as e:
            return False, "Query blocked for security reasons (Parse error)."
            
        if not statements:
            return False, "Query is empty."
            
        if len(statements) > 1:
            return False, "Query blocked for security reasons (Multiple statements detected)."
            
        stmt = statements[0]
        if not isinstance(stmt, exp.Select):
            return False, "Query blocked for security reasons (Only SELECT allowed)."
            
        # Basic AST walking to ensure no dangerous mutations are hidden
        for node in stmt.walk():
            node_type = type(node[0])
            if node_type in (exp.Drop, exp.Command, exp.Insert, exp.Update, exp.Delete, exp.Alter, exp.Create, exp.Commit, exp.Rollback, exp.Grant):
                return False, "Query blocked for security reasons (Forbidden operation)."
                
        return True, "Valid SQL"
