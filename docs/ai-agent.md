# AI Agent

The AI Agent acts as the bridge between natural language and SQL.

- **Model:** Gemini 1.5 Pro.
- **Context:** Receives the User Question, FAISS-retrieved schemas, and the `business_glossary.json`.
- **Glossary:** Maps business terms (e.g., "Revenue") to exact SQL formulas, reducing calculation hallucinations.
- **Clarification:** If a query is highly ambiguous, the LLM flags `needs_clarification: true` and requests user input instead of guessing.
