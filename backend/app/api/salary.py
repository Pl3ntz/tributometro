from fastapi import APIRouter, Query

from app.services.salary_calculator import calculate_salary_breakdown, SOURCES

router = APIRouter()


@router.get("/breakdown")
async def get_salary_breakdown(
    gross: float = Query(gt=0, le=200000, description="Salário bruto mensal"),
    rat_percent: float = Query(default=2.0, ge=1.0, le=3.0, description="RAT/SAT: 1% (leve), 2% (médio), 3% (grave)"),
    iss_percent: float = Query(default=5.0, ge=2.0, le=5.0, description="ISS municipal: 2% a 5% (LC 116/2003)"),
    regime: str = Query(default="lucro_presumido", description="Regime tributário da empresa: lucro_presumido, lucro_real, simples"),
):
    """Calculate full end-to-end tax breakdown for a CLT worker.

    Premissas explícitas:
    - RAT/SAT configurável (padrão 2% = risco médio)
    - Regime tributário da empresa configurável
    - Provisões calculadas item a item, verificáveis
    """
    result = calculate_salary_breakdown(gross, rat_rate=rat_percent / 100, iss_rate=iss_percent / 100, regime=regime)

    return {
        "gross_salary": result.gross_salary,
        "assumptions": result.assumptions,
        "company": {
            "revenue_needed": result.company_revenue,
            "taxes_on_revenue": result.company_taxes,
            "taxes_detail": result.company_taxes_detail,
            "employer_cost": result.employer_cost,
            "charges": result.employer_charges,
            "charges_detail": result.employer_charges_detail,
            "provisions": result.employer_provisions,
            "provisions_detail": result.employer_provisions_detail,
        },
        "employee": {
            "inss": result.inss_employee,
            "inss_rate": result.inss_rate_effective,
            "inss_detail": result.inss_detail,
            "irpf": result.irpf,
            "irpf_rate": result.irpf_rate_effective,
            "irpf_note": result.irpf_note,
            "net_salary": result.net_salary,
        },
        "consumption": {
            "total_tax": result.consumption_tax_total,
            "breakdown": result.consumption_breakdown,
        },
        "summary": {
            "real_purchasing_power": result.real_purchasing_power,
            "total_tax_all_layers": result.total_tax_all_layers,
            "total_tax_percentage": result.total_tax_percentage,
            "days_worked_for_tax": result.days_worked_for_tax,
            "hours_worked_for_tax": result.hours_worked_for_tax,
        },
        "sources": SOURCES,
    }
