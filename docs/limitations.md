# Limitations

### 1. LLM Hallucination
- **Problem:** Gemini might invent columns or tables.
- **Impact:** Query fails execution.
- **Solution:** We implemented an AST validator and a 1-retry self-correction loop (`fix_sql`). 

### 2. Ambiguous Questions
- **Problem:** "Best product" is subjective.
- **Impact:** Incorrect SQL.
- **Solution:** `needs_clarification` flag instructs the UI to prompt the user.

### 3. PII / Sensitive Data
- **Problem:** Exposing salaries or emails to LLM.
- **Impact:** Privacy violation.
- **Solution:** Configurable PII column filtering during the Schema Discovery phase.

### 4. Query Performance & Cost
- **Problem:** Unbound queries consume DB resources.
- **Impact:** Outages.
- **Solution:** Hard `LIMIT 1000` enforced at the Python execution layer, plus `statement_timeout`.
