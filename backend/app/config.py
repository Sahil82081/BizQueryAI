import os
import tempfile
from pydantic_settings import BaseSettings
from typing import List, Optional, Union
from pydantic import field_validator

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")

def default_vector_path() -> str:
    if os.getenv("VERCEL"):
        return os.path.join(tempfile.gettempdir(), "bizquery_vectors")
    return "./vector_db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "BizQuery AI"
    DATABASE_URL: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = "your_gemini_api_key"
    GEMINI_MODEL: str = "gemini-2.5-flash"
    VECTOR_DB_PATH: str = default_vector_path()
    TOP_K: int = 5
    CORS_ORIGINS: Union[List[str], str] = ["*"]
    
    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    class Config:
        env_file = env_path
        extra = "ignore"

settings = Settings()

