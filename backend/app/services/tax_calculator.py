from decimal import Decimal, ROUND_HALF_UP


def calculate_tax_inside(amount: float, rate: float) -> float:
    """Calculate tax embedded in price (por dentro).

    Brazilian taxes are included in the final price.
    Formula: tax = amount * rate / (1 + rate)
    """
    if rate <= 0:
        return 0.0

    d_amount = Decimal(str(amount))
    d_rate = Decimal(str(rate))
    tax = d_amount * d_rate / (1 + d_rate)
    return float(tax.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
