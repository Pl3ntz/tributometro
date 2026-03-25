# TributôMetro

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org)

> Descubra quanto do seu dinheiro é imposto — do custo da empresa ao seu poder de compra real.

## O que é

O TributôMetro é uma calculadora de transparência tributária brasileira. No Brasil, **40,82% da renda vai para impostos** (IBPT 2025), mas a maior parte deles é invisível — embutida nos preços, nos encargos patronais, nas provisões trabalhistas. O TributôMetro revela a cascata completa: quanto a empresa precisa faturar para te pagar, quanto é descontado do seu salário, e quanto imposto você paga ao consumir.

100% gratuito. Zero cadastro. Nenhum dado armazenado.

## Funcionalidades

- **Raio-X do Salário** — Cascata completa: faturamento da empresa → encargos patronais → salário bruto → INSS/IRPF → líquido → impostos no consumo → poder de compra real
- **Comparativo CLT vs PJ** — Simulação lado a lado de CLT, Simples Nacional (Anexo III), Lucro Presumido e MEI, com identificação automática do regime mais vantajoso
- **Landing page com dados de impacto** — Números reais do IBPT (dias trabalhados para impostos, retorno à sociedade, arrecadação total)
- **Base legal verificável** — Cada número tem lei, artigo e fonte linkada. Nada é inventado
- **SEO otimizado** — JSON-LD (WebApplication + FAQPage), Open Graph, sitemap, robots.txt

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | Python + FastAPI | 3.12 / 0.115.6 |
| ORM | SQLAlchemy (async) | 2.0.36 |
| Banco de dados | PostgreSQL | 16 (Alpine) |
| Cache | Redis | 7 (Alpine) |
| Migrations | Alembic | 1.14.1 |
| Frontend | React + TypeScript | 18.3 / 5.7 |
| Build tool | Vite | 6.0 |
| Estilização | TailwindCSS | 3.4 |
| Animações | Motion (Framer Motion) | 12.38 |
| Gráficos | Recharts | 2.14 |
| SEO | react-helmet-async | 3.0 |
| Pre-rendering | react-snap | 1.23 |
| Runtime | Node.js | 20 (Alpine) |
| Infra | Docker Compose | - |

## Arquitetura

```
tributometro/
├── backend/                    # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/
│   │   │   ├── salary.py       # Endpoint principal: /api/salary/breakdown
│   │   │   ├── dashboard.py    # Resumo e gráficos
│   │   │   ├── transactions.py # CRUD de transações
│   │   │   ├── nfce.py         # Leitura de NFC-e
│   │   │   └── imports.py      # Import OFX/CSV
│   │   ├── models/             # SQLAlchemy models
│   │   ├── services/
│   │   │   ├── salary_calculator.py  # Motor de cálculo tributário
│   │   │   ├── tax_calculator.py     # Cálculo de imposto embutido
│   │   │   ├── ibpt_service.py       # Taxas IBPT
│   │   │   └── ...
│   │   ├── schemas/            # Pydantic schemas
│   │   └── core/               # Config, database, Redis
│   ├── data/                   # Seeds e dados de referência
│   ├── migrations/             # Alembic migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx     # Landing page com dados de impacto
│   │   │   ├── SalaryXRay.tsx  # Raio-X do Salário (cascata)
│   │   │   ├── Comparativo.tsx # CLT vs PJ
│   │   │   ├── Dashboard.tsx   # Dashboard de transações
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── SEO.tsx         # Meta tags + JSON-LD schemas
│   │   │   ├── FlipCounter.tsx # Contador animado
│   │   │   └── ...
│   │   ├── constants/
│   │   │   └── tax-tables.ts   # Tabelas tributárias 2026 (fonte única)
│   │   └── services/
│   │       └── api.ts          # API client
│   ├── public/                 # favicon, sitemap.xml, robots.txt
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml          # Orquestração completa
```

## Rodando localmente

### Pré-requisitos

- Docker e Docker Compose

### Subir o projeto

```bash
git clone https://github.com/Pl3ntz/tributometro.git
cd tributometro
docker compose up --build
```

### Acessar

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API (Swagger) | http://localhost:8000/docs |
| Backend API (ReDoc) | http://localhost:8000/redoc |
| Health check | http://localhost:8000/api/health |

## API

### `GET /api/salary/breakdown`

Calcula a cascata tributária completa para um trabalhador CLT.

**Parâmetros:**

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `gross` | float | (obrigatório) | Salário bruto mensal (1 a 200.000) |
| `rat_percent` | float | 2.0 | RAT/SAT: 1% (leve), 2% (médio), 3% (grave) |
| `iss_percent` | float | 5.0 | ISS municipal: 2% a 5% |
| `regime` | string | lucro_presumido | Regime da empresa: `lucro_presumido`, `lucro_real`, `simples` |

**Exemplo:**

```bash
curl "http://localhost:8000/api/salary/breakdown?gross=5000"
```

**Response (resumido):**

```json
{
  "gross_salary": 5000.0,
  "company": {
    "revenue_needed": 10203.45,
    "taxes_on_revenue": 1666.38,
    "employer_cost": 8537.07,
    "charges": 1790.0,
    "provisions": 1247.07
  },
  "employee": {
    "inss": 456.04,
    "irpf": 0.0,
    "irpf_note": "Isento — Lei 15.270/2025 (renda até R$ 5.000)",
    "net_salary": 4543.96
  },
  "consumption": {
    "total_tax": 852.31
  },
  "summary": {
    "real_purchasing_power": 3691.65,
    "total_tax_all_layers": 6511.8,
    "total_tax_percentage": 63.8,
    "days_worked_for_tax": 14.0,
    "hours_worked_for_tax": 112.0
  },
  "sources": [...]
}
```

### `GET /api/health`

```json
{ "status": "ok" }
```

## Base Legal

Cada cálculo do TributôMetro referencia legislação real. Todas as fontes:

| Dado | Fonte | Legislação | Referência |
|------|-------|------------|------------|
| INSS 2026 (progressivo) | INSS / Governo Federal | Portaria MPS/MF 13/2026 | [gov.br/inss](https://www.gov.br/inss/pt-br/assuntos/com-reajuste-de-3-9-teto-do-inss-chega-a-r-8-475-55-em-2026) |
| IRPF 2026 (tabela mensal) | Receita Federal | Tabela progressiva 2026 | [gov.br/receitafederal](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026) |
| Isenção IR até R$ 5.000 | Planalto | Lei 15.270/2025 | [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm) |
| INSS patronal (20%) | CLT | Lei 8.212/91, art. 22, I | - |
| FGTS (8%) | CLT | Lei 8.036/90, art. 15 | - |
| RAT/SAT (1-3%) | CLT | Lei 8.212/91, art. 22, II | - |
| Salário-Educação (2,5%) | CF/88 | CF/88, art. 212, §5º | - |
| Sistema S (SENAI, SESI, SEBRAE, INCRA) | Decretos-Lei | DL 4.048/42, DL 9.403/46, Lei 8.029/90, DL 1.146/70 | - |
| 13º salário | CLT | Lei 4.090/62 | - |
| Férias + 1/3 | CLT | CF/88, art. 7º, XVII; CLT art. 129-145 | - |
| Simples Nacional | LC | LC 123/2006 + LC 155/2016 | - |
| ISS | LC | LC 116/2003 + LC 157/2016 | - |
| PIS/COFINS cumulativo | Federal | Lei 9.718/98 | - |
| IRPJ Lucro Presumido | Federal | RIR/2018, art. 591 e 624 | - |
| CSLL | Federal | Lei 7.689/88 | - |
| MEI | LC | LC 123/2006, art. 18-A | - |
| Impostos sobre consumo | IBPT | Lei 12.741/2012 | [deolhonoimposto.ibpt.org.br](https://deolhonoimposto.ibpt.org.br/) |
| Perfil de gastos | IBGE | POF 2017-2018 | [ibge.gov.br](https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pesquisa-de-orcamentos-familiares-2.html) |
| ICMS combustíveis | COMSEFAZ | Convênios ICMS 112-113/2025 | [comsefaz.org.br](https://comsefaz.org.br/novo/atualizacao-de-aliquotas-do-icms-sobre-combustiveis-entra-em-vigor-em-1o-de-janeiro-de-2026/) |

## Premissas dos Cálculos

Todas as premissas são explícitas e configuráveis onde possível:

- **RAT/SAT padrão: 2%** (risco médio). Configurável via API entre 1% e 3%. Depende do CNAE da empresa (Decreto 3.048/99, Anexo V)
- **ISS padrão: 5%** (alíquota máxima). Configurável via API entre 2% e 5%. Varia por município e atividade (LC 116/2003)
- **Regime tributário padrão: Lucro Presumido**. Configurável via API. Presunção de 32% para serviços (RIR/2018)
- **Sem provisão de multa rescisória 40%**. A multa FGTS incide apenas em demissão sem justa causa, não é custo mensal fixo (Lei 8.036/90, art. 18)
- **Sistema S: Indústria (SENAI/SESI)**. Para comércio, substitui-se por SENAC/SESC (mesmas alíquotas)
- **Impostos sobre consumo: estimativas IBPT**. São médias por categoria de produto. Variam por NCM, estado e regime tributário do vendedor
- **Perfil de gastos: POF/IBGE 2017-2018**. Distribuição percentual por categoria de consumo da família brasileira média
- **Faturamento PJ: estimado em 1,4x o salário desejado**. Premissa de margem para custos operacionais no comparativo CLT vs PJ
- **Pró-labore PJ: 40% do faturamento ou salário mínimo** (o que for maior)
- **Distribuição de lucros PJ: isenta de IR** (Lei 9.249/95, art. 10)
- **INSS PJ: 11% sobre pró-labore**, limitado ao teto (Lei 8.212/91, art. 21)
- **Cálculo de imposto no consumo: "por dentro"**. Fórmula: `imposto = valor × alíquota / (1 + alíquota)`, pois tributos brasileiros estão embutidos no preço

## Privacidade

- Zero armazenamento de dados pessoais do usuário
- Cálculos processados no servidor, nada persiste entre requisições
- Sem cookies de rastreamento
- Sem login, cadastro ou conta de usuário
- Sem integração com serviços de analytics de terceiros
- Código 100% aberto para auditoria

## SEO

- **react-helmet-async** para meta tags dinâmicas por página
- **JSON-LD** structured data: `WebApplication` + `FAQPage`
- **Sitemap.xml** e **robots.txt** em `/public/`
- **Open Graph** e **Twitter Cards** para compartilhamento em redes sociais
- **react-snap** para pre-rendering de páginas estáticas
- Tags `canonical`, `author`, `theme-color` e `robots` configuradas

## Licença

[MIT](https://opensource.org/licenses/MIT)

## Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feat/minha-feature`)
3. Commit suas mudanças (`git commit -m "feat: descrição da mudança"`)
4. Push para a branch (`git push origin feat/minha-feature`)
5. Abra um Pull Request

**Para reportar bugs ou sugerir melhorias**, abra uma [issue](https://github.com/Pl3ntz/tributometro/issues) com o máximo de detalhes possível.

**Convenção de commits:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`.
