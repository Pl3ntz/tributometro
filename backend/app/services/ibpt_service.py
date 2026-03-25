import json
from dataclasses import dataclass

from app.core.redis import redis_client

REDIS_KEY_PREFIX = "ibpt:"
REDIS_TTL = 43200  # 12h


@dataclass(frozen=True)
class IbptRateData:
    ncm: str
    uf: str
    description: str
    federal_rate: float
    state_rate: float
    municipal_rate: float
    import_rate: float
    total_rate: float


_memory_cache: dict[str, IbptRateData] = {}


async def load_ibpt_to_cache(rates: list[dict]) -> int:
    """Load IBPT rates into Redis and memory cache."""
    count = 0
    for r in rates:
        ncm = r["ncm"]
        uf = r["uf"]
        key = f"{ncm}:{uf}"

        rate_data = IbptRateData(
            ncm=ncm,
            uf=uf,
            description=r.get("description", ""),
            federal_rate=float(r.get("federal_rate", 0)),
            state_rate=float(r.get("state_rate", 0)),
            municipal_rate=float(r.get("municipal_rate", 0)),
            import_rate=float(r.get("import_rate", 0)),
            total_rate=float(r.get("total_rate", 0)),
        )

        _memory_cache[key] = rate_data

        try:
            await redis_client.setex(
                f"{REDIS_KEY_PREFIX}{key}",
                REDIS_TTL,
                json.dumps({
                    "ncm": rate_data.ncm,
                    "uf": rate_data.uf,
                    "description": rate_data.description,
                    "federal_rate": rate_data.federal_rate,
                    "state_rate": rate_data.state_rate,
                    "municipal_rate": rate_data.municipal_rate,
                    "import_rate": rate_data.import_rate,
                    "total_rate": rate_data.total_rate,
                }),
            )
        except Exception:
            pass  # Redis down — memory cache still works

        count += 1

    return count


async def get_rates(ncm: str, uf: str) -> IbptRateData | None:
    """Get IBPT rates for NCM+UF. Falls back from 8-digit to 6-digit NCM."""
    for ncm_key in [ncm[:8], ncm[:6]]:
        key = f"{ncm_key}:{uf}"

        if key in _memory_cache:
            return _memory_cache[key]

        try:
            cached = await redis_client.get(f"{REDIS_KEY_PREFIX}{key}")
            if cached:
                data = json.loads(cached)
                rate = IbptRateData(**data)
                _memory_cache[key] = rate
                return rate
        except Exception:
            pass

    return None
