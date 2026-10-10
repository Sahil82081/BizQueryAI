import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "BizQuery AI"
    DATABASE_URL: str
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-3.1-flash-lite"
    VECTOR_DB_PATH: str = "./vector_db"
    TOP_K: int = 5
    CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()
