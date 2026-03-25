import json
import logging
from dataclasses import dataclass

from groq import AsyncGroq

from app.core.config import settings

logger = logging.getLogger(__name__)

FALLBACK_RESULT = {
    "category": "outros",
    "tax_type": "OUTROS",
    "estimated_total_rate": 0.15,
    "confidence": 0.10,
}

SYSTEM_PROMPT = """Você é um classificador tributário brasileiro. Dada a descrição de uma transação financeira, classifique-a retornando APENAS um JSON puro (sem markdown, sem ```):

{
  "category": "nome_da_categoria",
  "tax_type": "ICMS|ISS|IOF|IPI|OUTROS",
  "estimated_total_rate": 0.0 a 1.0,
  "confidence": 0.0 a 1.0
}

Categorias comuns: supermercado, restaurante, combustivel, farmacia, vestuario, eletronicos, educacao, saude, transporte, servicos, lazer, moradia, financeiro, outros.

Considere os impostos embutidos típicos do Brasil. O estimated_total_rate deve representar a carga tributária total estimada sobre o item."""


@dataclass(frozen=True)
class AIClassification:
    category: str
    tax_type: str
    estimated_total_rate: float
    confidence: float


async def classify_transaction(description: str, amount: float) -> AIClassification:
    """Classify a transaction using Groq AI. Returns fallback on any failure."""
    if not settings.groq_api_key:
        return AIClassification(**FALLBACK_RESULT)

    try:
        client = AsyncGroq(api_key=settings.groq_api_key, timeout=5.0)

        response = await client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Transação: '{description}' - Valor: R$ {amount:.2f}",
                },
            ],
            temperature=0.1,
            max_tokens=200,
        )

        content = response.choices[0].message.content.strip()
        data = json.loads(content)

        return AIClassification(
            category=data.get("category", "outros"),
            tax_type=data.get("tax_type", "OUTROS"),
            estimated_total_rate=min(max(float(data.get("estimated_total_rate", 0.15)), 0), 1),
            confidence=min(max(float(data.get("confidence", 0.10)), 0), 0.59),
        )
    except Exception as e:
        logger.warning("AI classification failed: %s", e)
        return AIClassification(**FALLBACK_RESULT)
