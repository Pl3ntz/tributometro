from dataclasses import dataclass

import httpx
import xmltodict


class NFCeParseError(Exception):
    """Error parsing NFCe XML from SEFAZ."""


@dataclass(frozen=True)
class NFCeItem:
    code: str
    description: str
    ncm: str
    amount: float
    icms: float
    pis: float
    cofins: float


@dataclass(frozen=True)
class NFCeData:
    access_key: str
    emit_name: str
    emit_cnpj: str
    uf: str
    items: list[NFCeItem]
    total: float
    raw_xml: str


async def parse_nfce_url(qr_url: str) -> NFCeData:
    """Fetch NFCe from SEFAZ URL and parse XML."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(qr_url, follow_redirects=True)

            if response.status_code != 200:
                raise NFCeParseError(
                    f"SEFAZ retornou status {response.status_code}. "
                    "Verifique se a URL do QR Code está correta."
                )

            raw_xml = response.text
    except httpx.TimeoutException:
        raise NFCeParseError(
            "Timeout ao conectar com a SEFAZ. Tente novamente em alguns instantes."
        )
    except httpx.RequestError as e:
        raise NFCeParseError(f"Erro de conexão com a SEFAZ: {e}")

    return parse_nfce_xml(raw_xml)


def parse_nfce_xml(raw_xml: str) -> NFCeData:
    """Parse NFCe XML content into structured data."""
    try:
        doc = xmltodict.parse(raw_xml)
    except Exception as e:
        raise NFCeParseError(f"XML inválido: {e}")

    try:
        nfe = _find_nfe_node(doc)
        inf_nfe = nfe["infNFe"]
        emit = inf_nfe["emit"]
        det_list = inf_nfe["det"]

        if not isinstance(det_list, list):
            det_list = [det_list]

        items = []
        for det in det_list:
            prod = det["prod"]
            imposto = det.get("imposto", {})

            icms_val = _extract_tax_value(imposto, "ICMS", "vICMS")
            pis_val = _extract_tax_value(imposto, "PIS", "vPIS")
            cofins_val = _extract_tax_value(imposto, "COFINS", "vCOFINS")

            items.append(NFCeItem(
                code=prod.get("cProd", ""),
                description=prod.get("xProd", ""),
                ncm=prod.get("NCM", ""),
                amount=float(prod.get("vProd", 0)),
                icms=float(icms_val),
                pis=float(pis_val),
                cofins=float(cofins_val),
            ))

        total_val = float(
            inf_nfe.get("total", {}).get("ICMSTot", {}).get("vNF", 0)
        )

        uf_code = inf_nfe.get("ide", {}).get("cUF", "")
        uf = _uf_from_code(uf_code)

        return NFCeData(
            access_key=inf_nfe.get("@Id", "").replace("NFe", ""),
            emit_name=emit.get("xNome", ""),
            emit_cnpj=emit.get("CNPJ", ""),
            uf=uf,
            items=items,
            total=total_val,
            raw_xml=raw_xml,
        )
    except KeyError as e:
        raise NFCeParseError(f"Campo obrigatório ausente no XML: {e}")


def _find_nfe_node(doc: dict) -> dict:
    """Navigate XML structure to find the NFe node."""
    if "nfeProc" in doc:
        return doc["nfeProc"]["NFe"]
    if "NFe" in doc:
        return doc["NFe"]
    raise NFCeParseError("Estrutura XML não reconhecida como NFCe.")


def _extract_tax_value(imposto: dict, tax_group: str, value_key: str) -> float:
    """Extract tax value from nested XML tax structure."""
    group = imposto.get(tax_group, {})
    if not group:
        return 0.0

    for key, val in group.items():
        if isinstance(val, dict) and value_key in val:
            return float(val[value_key])

    return 0.0


_UF_CODES = {
    "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA",
    "16": "AP", "17": "TO", "21": "MA", "22": "PI", "23": "CE",
    "24": "RN", "25": "PB", "26": "PE", "27": "AL", "28": "SE",
    "29": "BA", "31": "MG", "32": "ES", "33": "RJ", "35": "SP",
    "41": "PR", "42": "SC", "43": "RS", "50": "MS", "51": "MT",
    "52": "GO", "53": "DF",
}


def _uf_from_code(code: str) -> str:
    return _UF_CODES.get(str(code)[:2], "SC")
