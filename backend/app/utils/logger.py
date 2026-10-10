import logging
import uuid
import time
from fastapi import Request

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("BizQuery")

async def log_request_middleware(request: Request, call_next):
    req_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    
    # Do not log sensitive headers/body
    logger.info(f"[REQ-{req_id}] {request.method} {request.url.path} started")
    
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(f"[REQ-{req_id}] {request.method} {request.url.path} completed {response.status_code} in {process_time:.2f}ms")
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"[REQ-{req_id}] {request.method} {request.url.path} FAILED in {process_time:.2f}ms")
        raise
