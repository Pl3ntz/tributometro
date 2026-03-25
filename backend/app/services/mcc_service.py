import json
from dataclasses import dataclass
from pathlib import Path

_MCC_DATA: dict[str, dict] = {}


@dataclass(frozen=True)
class MccTaxInfo:
    category: str
    taxes: dict[str, float]


def _load_mcc_map() -> None:
    global _MCC_DATA
    if _MCC_DATA:
        return

    mcc_path = Path(__file__).parent.parent.parent / "data" / "mcc_map.json"
    with open(mcc_path) as f:
        _MCC_DATA = json.load(f)


def get_tax_info(mcc: str) -> MccTaxInfo | None:
    """Get tax info for a given MCC code."""
    _load_mcc_map()
    data = _MCC_DATA.get(mcc)
    if not data:
        return None

    return MccTaxInfo(
        category=data["category"],
        taxes=data["taxes"],
    )


def get_all_mccs() -> dict[str, MccTaxInfo]:
    """Get all loaded MCC mappings."""
    _load_mcc_map()
    return {
        mcc: MccTaxInfo(category=d["category"], taxes=d["taxes"])
        for mcc, d in _MCC_DATA.items()
    }
