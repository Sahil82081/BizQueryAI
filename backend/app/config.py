import os
from pydantic_settings import BaseSettings
from typing import List, Optional

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "BizQuery AI"
    DATABASE_URL: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = "your_gemini_api_key"
    GEMINI_MODEL: str = "gemini-3.1-flash-lite"
    VECTOR_DB_PATH: str = "./vector_db"
    TOP_K: int = 5
    CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        env_file = env_path

settings = Settings()
