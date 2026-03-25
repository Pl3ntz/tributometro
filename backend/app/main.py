import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.nfce import router as nfce_router
from app.api.imports import router as imports_router
from app.api.transactions import router as transactions_router
from app.api.dashboard import router as dashboard_router
from app.api.salary import router as salary_router
from app.core.database import engine
from app.models.base import Base
from app.services.ibpt_service import load_ibpt_to_cache

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Load IBPT seed data into cache
    from data.ibpt_seed import IBPT_SEED_DATA
    count = await load_ibpt_to_cache(IBPT_SEED_DATA)
    logger.info("Loaded %d IBPT rates into cache", count)

    yield


app = FastAPI(title="TributôMetro", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(nfce_router, prefix="/api/nfce", tags=["NFCe"])
app.include_router(imports_router, prefix="/api/import", tags=["Import"])
app.include_router(transactions_router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(salary_router, prefix="/api/salary", tags=["Salary"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
