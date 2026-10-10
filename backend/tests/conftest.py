import pytest
import os

@pytest.fixture(autouse=True)
def set_env():
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["GEMINI_API_KEY"] = "test"
