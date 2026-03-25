"""Salary tax calculator with real 2026 INSS/IRPF tables for CLT workers.

Sources:
- INSS: Portaria Interministerial MPS/MF nº 13, de 10/01/2026 (gov.br/inss)
- IRPF: Receita Federal tabela 2026 + Lei 15.270/2025 (isenção até R$5k)
- Encargos: Guia Trabalhista / Delphin Contabilidade (legislação CLT)
- Consumo: IBPT (deolhonoimposto.ibpt.org.br) + POF/IBGE 2017-2018
"""
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

# ── INSS 2026 (Progressivo) ──
# Fonte: Portaria Interministerial MPS/MF nº 13/2026
# URL: gov.br/inss/pt-br/assuntos/com-reajuste-de-3-9-teto-do-inss-chega-a-r-8-475-55-em-2026
INSS_BRACKETS = [
    {"min": Decimal("0"), "max": Decimal("1621.00"), "rate": Decimal("0.075")},
    {"min": Decimal("1621.01"), "max": Decimal("2902.84"), "rate": Decimal("0.09")},
    {"min": Decimal("2902.85"), "max": Decimal("4354.27"), "rate": Decimal("0.12")},
    {"min": Decimal("4354.28"), "max": Decimal("8475.55"), "rate": Decimal("0.14")},
]
INSS_CEILING = Decimal("988.09")

# ── IRPF 2026 (Mensal progressivo) ──
# Fonte: Receita Federal — gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026
# Isenção: Lei 15.270/2025 — planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm
IRPF_BRACKETS = [
    {"max": Decimal("2428.80"), "rate": Decimal("0"), "deduction": Decimal("0")},
    {"max": Decimal("2826.65"), "rate": Decimal("0.075"), "deduction": Decimal("182.16")},
    {"max": Decimal("3751.05"), "rate": Decimal("0.15"), "deduction": Decimal("394.16")},
    {"max": Decimal("4664.68"), "rate": Decimal("0.225"), "deduction": Decimal("675.49")},
    {"max": Decimal("999999999"), "rate": Decimal("0.275"), "deduction": Decimal("908.73")},
]
IRPF_SIMPLIFIED_DISCOUNT = Decimal("607.20")
IRPF_FULL_EXEMPTION_LIMIT = Decimal("5000.00")
IRPF_REDUCTION_MAX_SALARY = Decimal("7350.00")

# ── Encargos patronais (Lucro Real/Presumido) ──
# Fonte: CLT + Guia Trabalhista (guiatrabalhista.com.br/tematicas/custostrabalhistas.htm)
# Componentes: INSS patronal 20% + FGTS 8% + RAT médio 2% + Sistema S 5.8% = 35.8%
EMPLOYER_CHARGES = [
    {"name": "INSS Patronal", "rate": 0.20, "source": "CLT art. 22, Lei 8.212/91"},
    {"name": "FGTS", "rate": 0.08, "source": "Lei 8.036/90, art. 15"},
    {"name": "RAT/SAT (risco médio)", "rate": 0.02, "source": "Lei 8.212/91, art. 22, II"},
    {"name": "Salário Educação", "rate": 0.025, "source": "Lei 9.424/96"},
    {"name": "SENAI/SENAC", "rate": 0.01, "source": "Decreto-Lei 4.048/42"},
    {"name": "SESI/SESC", "rate": 0.015, "source": "Decreto-Lei 9.853/46"},
    {"name": "SEBRAE", "rate": 0.006, "source": "Lei 8.029/90"},
    {"name": "INCRA", "rate": 0.002, "source": "Decreto-Lei 1.146/70"},
]
EMPLOYER_MONTHLY_RATE = Decimal("0.358")

# Provisões obrigatórias (mensalizadas)
# Fonte: CLT art. 7, VIII e XVII + cálculo contábil padrão
EMPLOYER_PROVISIONS = [
    {"name": "13º salário (1/12)", "rate": 0.0833, "source": "CLT, Lei 4.090/62"},
    {"name": "Férias + 1/3 (1/12 × 4/3)", "rate": 0.1111, "source": "CLT art. 129-145, CF art. 7 XVII"},
    {"name": "FGTS sobre 13º e férias", "rate": 0.0156, "source": "Lei 8.036/90"},
    {"name": "INSS sobre 13º e férias", "rate": 0.0389, "source": "Lei 8.212/91"},
]
EMPLOYER_PROVISIONS_RATE = Decimal("0.249")

# ── Impostos corporativos (Lucro Presumido, serviços) ──
# Fonte: Receita Federal — regras do Lucro Presumido
CORPORATE_TAXES = [
    {"name": "PIS", "rate": 0.0065, "source": "Lei 9.718/98, art. 4º (cumulativo)"},
    {"name": "COFINS", "rate": 0.03, "source": "Lei 9.718/98, art. 4º (cumulativo)"},
    {"name": "IRPJ (15% sobre 32% presunção)", "rate": 0.048, "source": "RIR/2018, art. 591"},
    {"name": "CSLL (9% sobre 32% presunção)", "rate": 0.0288, "source": "Lei 7.689/88"},
    {"name": "ISS (alíquota média)", "rate": 0.05, "source": "LC 116/2003"},
]
CORPORATE_TAX_RATE = Decimal("0.1633")

# ── Impostos sobre consumo por categoria ──
# Fonte: IBPT (deolhonoimposto.ibpt.org.br) — tabela De Olho no Imposto, Lei 12.741/2012
# Perfil de gastos: IBGE POF 2017-2018
# ATENÇÃO: São médias estimadas. Variam por produto, NCM, regime tributário e estado.
CONSUMPTION_PROFILE = [
    {"category": "Alimentação (casa)", "budget_share": 0.175, "tax_rate": 0.17,
     "source": "IBPT — média cesta básica", "confidence": "medium"},
    {"category": "Alimentação (fora)", "budget_share": 0.07, "tax_rate": 0.253,
     "source": "IBPT — refeição restaurante 32,3% s/ preço", "confidence": "medium"},
    {"category": "Moradia (aluguel, cond.)", "budget_share": 0.15, "tax_rate": 0.05,
     "source": "ISS sobre serviços condominiais", "confidence": "low"},
    {"category": "Energia elétrica", "budget_share": 0.05, "tax_rate": 0.356,
     "source": "ANEEL/CNI — ICMS 17% SC + PIS/COFINS + encargos setoriais", "confidence": "high"},
    {"category": "Combustível", "budget_share": 0.10, "tax_rate": 0.34,
     "source": "IBPT/Fecombustíveis — ICMS ad rem R$1,57/L + PIS/COFINS", "confidence": "high"},
    {"category": "Transporte público", "budget_share": 0.05, "tax_rate": 0.227,
     "source": "IBPT — impostos embutidos na tarifa", "confidence": "medium"},
    {"category": "Saúde", "budget_share": 0.08, "tax_rate": 0.18,
     "source": "IBPT — média medicamentos + consultas", "confidence": "medium"},
    {"category": "Educação", "budget_share": 0.04, "tax_rate": 0.081,
     "source": "ISS 2-5% + PIS/COFINS (serviço educacional)", "confidence": "high"},
    {"category": "Vestuário", "budget_share": 0.05, "tax_rate": 0.347,
     "source": "IBPT — roupas e calçados 34,7%", "confidence": "high"},
    {"category": "Telecom", "budget_share": 0.045, "tax_rate": 0.293,
     "source": "Teleco/IBPT — ICMS 17% SC + PIS/COFINS + FUST", "confidence": "high"},
    {"category": "Higiene e limpeza", "budget_share": 0.04, "tax_rate": 0.35,
     "source": "IBPT — sabonete 32%, shampoo 36,5%", "confidence": "medium"},
    {"category": "Lazer", "budget_share": 0.05, "tax_rate": 0.30,
     "source": "IBPT — média cinema, streaming, restaurante", "confidence": "medium"},
    {"category": "Outros", "budget_share": 0.10, "tax_rate": 0.20,
     "source": "Estimativa IBPT — serviços diversos", "confidence": "low"},
]

# Fontes globais do cálculo
SOURCES = [
    {
        "id": "inss",
        "name": "Tabela INSS 2026",
        "url": "https://www.gov.br/inss/pt-br/assuntos/com-reajuste-de-3-9-teto-do-inss-chega-a-r-8-475-55-em-2026",
        "authority": "INSS / Governo Federal",
        "confidence": "official",
    },
    {
        "id": "irpf",
        "name": "Tabela IRPF 2026 + Isenção até R$5k",
        "url": "https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026",
        "authority": "Receita Federal",
        "confidence": "official",
    },
    {
        "id": "irpf_lei",
        "name": "Lei 15.270/2025 — Isenção IR até R$5.000",
        "url": "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm",
        "authority": "Planalto / Presidência",
        "confidence": "official",
    },
    {
        "id": "encargos",
        "name": "Encargos trabalhistas CLT",
        "url": "https://www.guiatrabalhista.com.br/tematicas/custostrabalhistas.htm",
        "authority": "Legislação CLT (consolidada)",
        "confidence": "official",
    },
    {
        "id": "ibpt",
        "name": "Tabela IBPT — De Olho no Imposto (Lei 12.741/2012)",
        "url": "https://deolhonoimposto.ibpt.org.br/",
        "authority": "IBPT — Instituto Brasileiro de Planejamento e Tributação",
        "confidence": "estimated",
    },
    {
        "id": "pof",
        "name": "Pesquisa de Orçamentos Familiares (POF) 2017-2018",
        "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pesquisa-de-orcamentos-familiares-2.html",
        "authority": "IBGE",
        "confidence": "official",
    },
    {
        "id": "combustivel",
        "name": "ICMS Combustíveis 2026 — Convênios ICMS 112-113/2025",
        "url": "https://comsefaz.org.br/novo/atualizacao-de-aliquotas-do-icms-sobre-combustiveis-entra-em-vigor-em-1o-de-janeiro-de-2026/",
        "authority": "COMSEFAZ / CONFAZ",
        "confidence": "official",
    },
]


def _round(val: Decimal) -> float:
    return float(val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def calculate_inss(gross: Decimal) -> Decimal:
    """Calculate progressive INSS. Each bracket taxes only the portion within it."""
    total = Decimal("0")
    prev = Decimal("0")
    for bracket in INSS_BRACKETS:
        if gross <= prev:
            break
        taxable = min(gross, bracket["max"]) - prev
        if taxable > 0:
            total += taxable * bracket["rate"]
        prev = bracket["max"]
    return min(total, INSS_CEILING)


def calculate_irpf(gross: Decimal, inss: Decimal) -> Decimal:
    base = gross - inss - IRPF_SIMPLIFIED_DISCOUNT
    if base <= 0:
        return Decimal("0")

    tax = Decimal("0")
    for bracket in IRPF_BRACKETS:
        if base <= bracket["max"]:
            tax = base * bracket["rate"] - bracket["deduction"]
            break

    tax = max(tax, Decimal("0"))

    if gross <= IRPF_FULL_EXEMPTION_LIMIT:
        return Decimal("0")

    if gross <= IRPF_REDUCTION_MAX_SALARY:
        reduction = Decimal("978.62") - (Decimal("0.133145") * gross)
        reduction = max(Decimal("0"), min(reduction, tax))
        tax = tax - reduction

    return max(tax, Decimal("0"))


@dataclass(frozen=True)
class SalaryBreakdown:
    assumptions: list[dict]
    company_revenue: float
    company_taxes: float
    company_taxes_detail: list[dict]
    employer_cost: float
    employer_charges: float
    employer_charges_detail: list[dict]
    employer_provisions: float
    employer_provisions_detail: list[dict]
    gross_salary: float
    inss_employee: float
    inss_rate_effective: float
    inss_detail: list[dict]
    irpf: float
    irpf_rate_effective: float
    irpf_note: str
    net_salary: float
    consumption_tax_total: float
    consumption_breakdown: list[dict]
    real_purchasing_power: float
    total_tax_all_layers: float
    total_tax_percentage: float
    days_worked_for_tax: float
    hours_worked_for_tax: float


def calculate_salary_breakdown(
    gross_salary: float,
    rat_rate: float = 0.02,
    iss_rate: float = 0.05,
    regime: str = "lucro_presumido",
) -> SalaryBreakdown:
    gross = Decimal(str(gross_salary))
    rat = Decimal(str(rat_rate))
    iss = Decimal(str(iss_rate))

    # ── Premissas explícitas ──
    assumptions = [
        {"key": "rat", "label": f"RAT/SAT: {rat_rate*100:.0f}%", "detail": "1%=leve, 2%=médio, 3%=grave. Depende do CNAE da empresa (Decreto 3.048/99, Anexo V).", "law": "Lei 8.212/91, art. 22, II"},
        {"key": "iss", "label": f"ISS: {iss_rate*100:.0f}%", "detail": f"Varia de 2% a 5% conforme município e atividade. Usando {iss_rate*100:.0f}%.", "law": "LC 116/2003 + LC 157/2016"},
        {"key": "regime", "label": f"Regime: {regime.replace('_', ' ').title()}", "detail": "Impostos sobre receita variam conforme regime tributário da empresa.", "law": "Lei 9.718/98"},
        {"key": "multa_fgts", "label": "Sem provisão de multa rescisória", "detail": "A multa de 40% do FGTS incide apenas na demissão sem justa causa. Não é custo mensal fixo.", "law": "Lei 8.036/90, art. 18"},
        {"key": "sistema_s", "label": "Sistema S: Indústria (SENAI/SESI)", "detail": "Para comércio, substitui-se por SENAC/SESC (mesmas alíquotas).", "law": "CF/88, art. 240"},
    ]

    # ── Layer 1: Encargos patronais (item a item, verificável) ──
    inss_patronal = gross * Decimal("0.20")
    fgts = gross * Decimal("0.08")
    rat_val = gross * rat
    sal_educacao = gross * Decimal("0.025")
    senai_senac = gross * Decimal("0.01")
    sesi_sesc = gross * Decimal("0.015")
    sebrae = gross * Decimal("0.006")
    incra = gross * Decimal("0.002")

    charges_total = inss_patronal + fgts + rat_val + sal_educacao + senai_senac + sesi_sesc + sebrae + incra

    charges_detail = [
        {"name": "INSS Patronal", "rate": 0.20, "value": _round(inss_patronal), "source": "Lei 8.212/91, art. 22, I"},
        {"name": "FGTS", "rate": 0.08, "value": _round(fgts), "source": "Lei 8.036/90, art. 15"},
        {"name": f"RAT/SAT ({rat_rate*100:.0f}%)", "rate": float(rat), "value": _round(rat_val), "source": "Lei 8.212/91, art. 22, II"},
        {"name": "Salário Educação", "rate": 0.025, "value": _round(sal_educacao), "source": "CF/88, art. 212, §5º"},
        {"name": "SENAI/SENAC", "rate": 0.01, "value": _round(senai_senac), "source": "DL 4.048/42"},
        {"name": "SESI/SESC", "rate": 0.015, "value": _round(sesi_sesc), "source": "DL 9.403/46"},
        {"name": "SEBRAE", "rate": 0.006, "value": _round(sebrae), "source": "Lei 8.029/90"},
        {"name": "INCRA", "rate": 0.002, "value": _round(incra), "source": "DL 1.146/70"},
    ]

    # ── Provisões (item a item, cada cálculo explícito) ──
    # Sobre 13º e férias incidem TODOS os encargos patronais (INSS, FGTS, RAT, Sistema S)
    decimo_terceiro = gross / 12  # 1/12 avos — Lei 4.090/62
    ferias_com_terco = (gross / 12) * (Decimal("4") / Decimal("3"))  # (1/12) × (4/3) — CF/88 art. 7º XVII
    base_provisoes = decimo_terceiro + ferias_com_terco

    # Encargos sobre provisões = mesma composição dos encargos mensais
    # INSS 20% + FGTS 8% + RAT + Sal.Educação 2,5% + Sistema S 3,3%
    encargos_rate_sobre_prov = Decimal("0.20") + Decimal("0.08") + rat + Decimal("0.025") + Decimal("0.01") + Decimal("0.015") + Decimal("0.006") + Decimal("0.002")
    encargos_sobre_provisoes = base_provisoes * encargos_rate_sobre_prov

    provisions_total = decimo_terceiro + ferias_com_terco + encargos_sobre_provisoes

    provisions_detail = [
        {"name": "13º salário (1/12)", "rate": round(1/12, 4), "value": _round(decimo_terceiro), "source": "Lei 4.090/62", "formula": f"{_round(gross)} / 12"},
        {"name": "Férias + 1/3 (1/12 × 4/3)", "rate": round((1/12)*(4/3), 4), "value": _round(ferias_com_terco), "source": "CF/88, art. 7º, XVII", "formula": f"({_round(gross)} / 12) × (4/3)"},
        {"name": f"FGTS s/ 13º e férias (8%)", "rate": 0.08, "value": _round(base_provisoes * Decimal("0.08")), "source": "Lei 8.036/90", "formula": f"({_round(decimo_terceiro)} + {_round(ferias_com_terco)}) × 8%"},
        {"name": f"INSS patronal s/ 13º e férias (20%)", "rate": 0.20, "value": _round(base_provisoes * Decimal("0.20")), "source": "Lei 8.212/91", "formula": f"({_round(decimo_terceiro)} + {_round(ferias_com_terco)}) × 20%"},
        {"name": f"RAT s/ 13º e férias ({rat_rate*100:.0f}%)", "rate": float(rat), "value": _round(base_provisoes * rat), "source": "Lei 8.212/91, art. 22, II", "formula": f"({_round(decimo_terceiro)} + {_round(ferias_com_terco)}) × {rat_rate*100:.0f}%"},
        {"name": "Sal.Educ+SistemaS s/ 13º e férias (5,8%)", "rate": 0.058, "value": _round(base_provisoes * Decimal("0.058")), "source": "CF/88 art. 212 §5º + DLs Sistema S", "formula": f"({_round(decimo_terceiro)} + {_round(ferias_com_terco)}) × 5,8%"},
    ]

    employer_cost = gross + charges_total + provisions_total

    # ── Impostos sobre receita (conforme regime) ──
    if regime == "lucro_presumido":
        # Alíquotas efetivas: PIS 0,65% + COFINS 3% + IRPJ 4,8% + CSLL 2,88% + ISS
        tax_rate_corp = Decimal("0.0065") + Decimal("0.03") + Decimal("0.048") + Decimal("0.0288") + iss
        company_revenue = employer_cost / (1 - tax_rate_corp)
        company_taxes = company_revenue - employer_cost

        pis_val = company_revenue * Decimal("0.0065")
        cofins_val = company_revenue * Decimal("0.03")
        irpj_base = company_revenue * Decimal("0.32")  # presunção 32%
        irpj_val = irpj_base * Decimal("0.15")
        # Adicional IRPJ: 10% sobre lucro presumido que exceder R$ 20.000/mês
        irpj_adicional = max(Decimal("0"), (irpj_base - Decimal("20000")) * Decimal("0.10"))
        csll_val = irpj_base * Decimal("0.09")
        iss_val = company_revenue * iss

        corporate_detail = [
            {"name": "PIS (0,65%)", "value": _round(pis_val), "rate": 0.0065, "source": "Lei 9.718/98, art. 4º"},
            {"name": "COFINS (3%)", "value": _round(cofins_val), "rate": 0.03, "source": "Lei 9.718/98, art. 4º"},
            {"name": "IRPJ (15% s/ 32%)", "value": _round(irpj_val), "rate": 0.048, "source": "RIR/2018, art. 591"},
            {"name": f"IRPJ Adicional 10% (s/ excedente R$20k)", "value": _round(irpj_adicional), "rate": 0.10, "source": "RIR/2018, art. 624"},
            {"name": "CSLL (9% s/ 32%)", "value": _round(csll_val), "rate": 0.0288, "source": "Lei 7.689/88"},
            {"name": f"ISS ({iss_rate*100:.0f}%)", "value": _round(iss_val), "rate": float(iss), "source": "LC 116/2003"},
        ]
        # Recalcular company_taxes incluindo adicional
        company_taxes = pis_val + cofins_val + irpj_val + irpj_adicional + csll_val + iss_val
        company_revenue = employer_cost + company_taxes
    else:
        company_revenue = employer_cost
        company_taxes = Decimal("0")
        corporate_detail = [{"name": f"Regime {regime} — consultar contador", "value": 0, "rate": 0, "source": "Varia conforme faturamento e anexo"}]

    # Layer 2: Employee
    inss = calculate_inss(gross)
    irpf = calculate_irpf(gross, inss)
    net = gross - inss - irpf

    inss_detail = []
    prev_max = Decimal("0")
    for bracket in INSS_BRACKETS:
        if gross <= prev_max:
            break
        taxable = min(gross, bracket["max"]) - prev_max
        if taxable > 0:
            inss_detail.append({
                "range": f"R$ {_round(prev_max)} – R$ {_round(bracket['max'])}",
                "rate": float(bracket["rate"]),
                "value": _round(taxable * bracket["rate"]),
            })
        prev_max = bracket["max"]

    irpf_note = ""
    if gross <= IRPF_FULL_EXEMPTION_LIMIT:
        irpf_note = "Isento — Lei 15.270/2025 (renda até R$ 5.000)"
    elif gross <= IRPF_REDUCTION_MAX_SALARY:
        irpf_note = "Redução parcial — Lei 15.270/2025 (renda entre R$ 5.000 e R$ 7.350)"

    # Layer 3: Consumption
    net_float = float(net)
    consumption_items = []
    total_consumption_tax = 0.0
    for item in CONSUMPTION_PROFILE:
        spent = net_float * item["budget_share"]
        tax = spent * item["tax_rate"] / (1 + item["tax_rate"])
        total_consumption_tax += tax
        consumption_items.append({
            "category": item["category"],
            "spent": round(spent, 2),
            "tax": round(tax, 2),
            "tax_rate": item["tax_rate"],
            "source": item["source"],
            "confidence": item["confidence"],
        })

    # Summary — cada soma verificável
    purchasing_power = net_float - total_consumption_tax
    total_tax = (
        _round(company_taxes)
        + _round(charges_total)
        + _round(provisions_total)
        + _round(inss)
        + _round(irpf)
        + round(total_consumption_tax, 2)
    )
    total_from_revenue = _round(company_revenue)
    tax_pct = total_tax / total_from_revenue if total_from_revenue > 0 else 0

    return SalaryBreakdown(
        assumptions=assumptions,
        company_revenue=_round(company_revenue),
        company_taxes=_round(company_taxes),
        company_taxes_detail=corporate_detail,
        employer_cost=_round(employer_cost),
        employer_charges=_round(charges_total),
        employer_charges_detail=charges_detail,
        employer_provisions=_round(provisions_total),
        employer_provisions_detail=provisions_detail,
        gross_salary=_round(gross),
        inss_employee=_round(inss),
        inss_rate_effective=round(float(inss / gross) * 100, 1) if gross > 0 else 0,
        inss_detail=inss_detail,
        irpf=_round(irpf),
        irpf_rate_effective=round(float(irpf / gross) * 100, 1) if gross > 0 else 0,
        irpf_note=irpf_note,
        net_salary=_round(net),
        consumption_tax_total=round(total_consumption_tax, 2),
        consumption_breakdown=consumption_items,
        real_purchasing_power=round(purchasing_power, 2),
        total_tax_all_layers=round(total_tax, 2),
        total_tax_percentage=round(tax_pct * 100, 1),
        days_worked_for_tax=round(22 * tax_pct, 1),
        hours_worked_for_tax=round(22 * 8 * tax_pct, 0),
    )
