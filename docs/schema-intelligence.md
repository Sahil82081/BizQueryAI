# Schema Intelligence

BizQuery AI does not dump the entire database schema into the LLM context.

1. **Discovery:** Reads PostgreSQL metadata.
2. **PII Masking:** Drops columns matching `email`, `phone`, `ssn`, `password`, `address`, `salary`, `bank`.
3. **Embedding:** Converts table metadata to semantic embeddings via `sentence-transformers`.
4. **Vector Store:** Stores embeddings in FAISS.
5. **Retrieval:** Uses Hybrid Search (Semantic + Foreign Key relationships) to fetch only the Top K tables relevant to the user's natural language query.
