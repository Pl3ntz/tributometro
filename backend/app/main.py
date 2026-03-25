import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.salary import router as salary_router
from app.core.config import settings

logger = logging.getLogger(__name__)

IS_PRODUCTION = os.getenv("ENVIRONMENT", settings.environment) == "production"


@asynccontextmanager
async def lifespan(application: FastAPI):
    logger.info("TributôMetro starting (production=%s)", IS_PRODUCTION)
    yield


app = FastAPI(
    title="TributôMetro",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://tributometro.vitorplentz.com.br",
    ],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["Content-Type"],
)

# Only the salary calculator endpoint — pure calculator, no storage
app.include_router(salary_router, prefix="/api/salary", tags=["Salary"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
