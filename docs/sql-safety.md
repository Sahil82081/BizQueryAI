# SQL Safety

LLMs can hallucinate. SQL Safety is paramount.

1. **Read-Only Database User:** Hard physical limit preventing data mutation.
2. **SQLGlot AST Parsing:** All generated queries are parsed into an Abstract Syntax Tree.
3. **Mutation Blocking:** If the AST contains `exp.Drop`, `exp.Delete`, `exp.Update`, `exp.Insert`, etc., the query is immediately rejected.
4. **Multiple Statements:** `;` injected multi-queries are blocked.
5. **Execution Limits:** `SET statement_timeout = 5000` prevents DB lockups.
