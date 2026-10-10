from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.schema_router import router as schema_router
from app.api.query_router import router as query_router
from app.api.connections_router import router as connections_router
from app.utils.logger import log_request_middleware
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(BaseHTTPMiddleware, dispatch=log_request_middleware)

app.include_router(schema_router)
app.include_router(query_router)
app.include_router(connections_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
