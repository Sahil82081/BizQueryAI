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

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"status": "ok", "message": f"{settings.PROJECT_NAME} API is running"}

@app.api_route("/health", methods=["GET", "HEAD"])
@app.api_route("/api/v1/health", methods=["GET", "HEAD"])
async def health():
    return {"status": "healthy"}

@app.get("/api/health")
def api_health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database_connected": bool(settings.DATABASE_URL)
    }

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
