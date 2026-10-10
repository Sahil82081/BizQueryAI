import os
import json
import google.generativeai as genai
from typing import List, Dict, Any
from app.config import settings

# Attempt to configure Gemini
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key":
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY is missing or default. LLM requests will fail.")

class LLMService:
    def __init__(self):
        # We use a standard pro model for complex SQL reasoning
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
    def generate_sql(self, question: str, retrieved_schemas: List[str], glossary: Dict[str, str]) -> Dict[str, Any]:
        glossary_text = "\n".join([f"- {k}: {v}" for k, v in glossary.items()])
        schema_text = "\n".join(retrieved_schemas)
        
        prompt = f"""You are an expert PostgreSQL data analyst.
Your task is to convert a natural language question into a safe PostgreSQL query.

### USER QUESTION
{question}

### RELEVANT DATABASE SCHEMA
The following schema subset was retrieved for this question:
{schema_text}

### BUSINESS GLOSSARY
Use these definitions to resolve business terminology:
{glossary_text}

### RULES
1. ONLY use the tables and columns provided in the schema above. Do NOT invent columns or tables.
2. Respect foreign key relationships and use correct joins.
3. Use explicit aliases (e.g., `o.order_id`).
4. Generate ONLY analytical SELECT queries.
5. If the question is highly ambiguous (e.g., "best customers" without defining "best" as revenue or volume), request clarification instead of guessing.
6. Time Boundaries: When asked for "last N months" and grouping by month, carefully filter using precise calendar month boundaries so you don't accidentally pull N+1 months of data due to partial current months.

### OUTPUT FORMAT
Provide your response strictly as a JSON object (without markdown code blocks, just raw JSON) matching this structure:
{{
  "sql": "<the generated sql query, or null if clarification needed>",
  "explanation": "<brief explanation of the logic, or clarification request>",
  "tables_used": ["schema.table1", "schema.table2"],
  "confidence": 0.95,
  "needs_clarification": false,
  "clarification_message": "<null or question asking for clarification>"
}}
"""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            
            raw_text = response.text
            result = json.loads(raw_text)
            return result
        except Exception as e:
            return {
                "sql": None,
                "explanation": f"LLM Generation Failed: {str(e)}",
                "tables_used": [],
                "confidence": 0.0,
                "needs_clarification": False,
                "error": str(e)
            }

    def fix_sql(self, question: str, sql: str, error_msg: str) -> Dict[str, Any]:
        prompt = f"""You are an expert PostgreSQL data analyst.
The following SQL you generated resulted in an error. Please fix it.

### ORIGINAL QUESTION
{question}

### FAILED SQL
{sql}

### ERROR MESSAGE
{error_msg}

### RULES
1. Provide your response strictly as a JSON object (without markdown code blocks) matching the original structure.
2. Ensure the SQL is a safe analytical SELECT query.

### OUTPUT FORMAT
{{
  "sql": "<the corrected sql query>",
  "explanation": "<brief explanation of the fix>"
}}
"""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            raw_text = response.text
            result = json.loads(raw_text)
            return result
        except Exception:
            return {"sql": sql, "explanation": "Correction failed."}

