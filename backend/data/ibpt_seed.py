"""Seed data for ibpt_rates table - realistic SC data for MVP."""

IBPT_SEED_DATA = [
    # Alimentos básicos
    {"ncm": "02011000", "uf": "SC", "description": "Carne bovina fresca/refrigerada", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    {"ncm": "02021000", "uf": "SC", "description": "Carne bovina congelada", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    {"ncm": "02071100", "uf": "SC", "description": "Carne de frango fresca", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    {"ncm": "02071200", "uf": "SC", "description": "Carne de frango congelada", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    {"ncm": "04012010", "uf": "SC", "description": "Leite UHT integral", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    {"ncm": "04014000", "uf": "SC", "description": "Leite em pó", "federal_rate": 0.0345, "state_rate": 0.12, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1545},
    {"ncm": "04061000", "uf": "SC", "description": "Queijo mussarela", "federal_rate": 0.0925, "state_rate": 0.12, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2125},
    {"ncm": "04069000", "uf": "SC", "description": "Outros queijos", "federal_rate": 0.0925, "state_rate": 0.12, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2125},
    {"ncm": "04070011", "uf": "SC", "description": "Ovos frescos", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    {"ncm": "07019000", "uf": "SC", "description": "Batata fresca", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    {"ncm": "07020000", "uf": "SC", "description": "Tomate fresco", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    {"ncm": "08030000", "uf": "SC", "description": "Banana", "federal_rate": 0.0345, "state_rate": 0.0, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.0345},
    {"ncm": "10063011", "uf": "SC", "description": "Arroz branco", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    {"ncm": "11010010", "uf": "SC", "description": "Farinha de trigo", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    {"ncm": "15079011", "uf": "SC", "description": "Óleo de soja", "federal_rate": 0.0925, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1625},
    {"ncm": "17019900", "uf": "SC", "description": "Açúcar refinado", "federal_rate": 0.0925, "state_rate": 0.12, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2125},
    {"ncm": "09012100", "uf": "SC", "description": "Café torrado", "federal_rate": 0.0925, "state_rate": 0.12, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2125},
    {"ncm": "19021100", "uf": "SC", "description": "Macarrão/massa", "federal_rate": 0.0925, "state_rate": 0.12, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2125},
    {"ncm": "19053100", "uf": "SC", "description": "Biscoitos", "federal_rate": 0.1425, "state_rate": 0.12, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2625},
    {"ncm": "07133319", "uf": "SC", "description": "Feijão preto", "federal_rate": 0.0345, "state_rate": 0.07, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.1045},
    # Bebidas
    {"ncm": "22011000", "uf": "SC", "description": "Água mineral", "federal_rate": 0.0925, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2625},
    {"ncm": "22021000", "uf": "SC", "description": "Refrigerante", "federal_rate": 0.1425, "state_rate": 0.25, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.3925},
    {"ncm": "22030000", "uf": "SC", "description": "Cerveja", "federal_rate": 0.2225, "state_rate": 0.25, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.4725},
    {"ncm": "22041000", "uf": "SC", "description": "Vinho", "federal_rate": 0.1925, "state_rate": 0.25, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.4425},
    {"ncm": "22085000", "uf": "SC", "description": "Destilados/cachaça", "federal_rate": 0.2625, "state_rate": 0.25, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.5125},
    # Combustíveis
    {"ncm": "27101259", "uf": "SC", "description": "Gasolina comum", "federal_rate": 0.1325, "state_rate": 0.25, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.3825},
    {"ncm": "27101921", "uf": "SC", "description": "Diesel S10", "federal_rate": 0.0925, "state_rate": 0.12, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2125},
    {"ncm": "27111910", "uf": "SC", "description": "Etanol", "federal_rate": 0.1325, "state_rate": 0.25, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.3825},
    {"ncm": "27111300", "uf": "SC", "description": "Gás GLP", "federal_rate": 0.0925, "state_rate": 0.12, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2125},
    # Higiene e limpeza
    {"ncm": "33049100", "uf": "SC", "description": "Protetor solar", "federal_rate": 0.1425, "state_rate": 0.25, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.3925},
    {"ncm": "33051000", "uf": "SC", "description": "Shampoo", "federal_rate": 0.1425, "state_rate": 0.25, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.3925},
    {"ncm": "33061000", "uf": "SC", "description": "Creme dental", "federal_rate": 0.1425, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.3125},
    {"ncm": "34012000", "uf": "SC", "description": "Sabonete", "federal_rate": 0.1425, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.3125},
    {"ncm": "34022000", "uf": "SC", "description": "Detergente/sabão em pó", "federal_rate": 0.1425, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.3125},
    {"ncm": "48189000", "uf": "SC", "description": "Papel higiênico", "federal_rate": 0.1425, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.3125},
    # Medicamentos
    {"ncm": "30049099", "uf": "SC", "description": "Medicamentos genéricos", "federal_rate": 0.0925, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2625},
    {"ncm": "30042099", "uf": "SC", "description": "Medicamentos de referência", "federal_rate": 0.0925, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2625},
    # Eletrônicos
    {"ncm": "85171200", "uf": "SC", "description": "Celular/smartphone", "federal_rate": 0.2025, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.16, "total_rate": 0.5525},
    {"ncm": "84713012", "uf": "SC", "description": "Notebook", "federal_rate": 0.1525, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.16, "total_rate": 0.4825},
    {"ncm": "85287200", "uf": "SC", "description": "Televisor", "federal_rate": 0.2025, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.20, "total_rate": 0.5725},
    {"ncm": "84433110", "uf": "SC", "description": "Impressora", "federal_rate": 0.1525, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.16, "total_rate": 0.4825},
    # Vestuário
    {"ncm": "62034200", "uf": "SC", "description": "Calça jeans", "federal_rate": 0.1425, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.35, "total_rate": 0.6625},
    {"ncm": "61091000", "uf": "SC", "description": "Camiseta algodão", "federal_rate": 0.1425, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.35, "total_rate": 0.6625},
    {"ncm": "64039100", "uf": "SC", "description": "Calçados couro", "federal_rate": 0.1425, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.35, "total_rate": 0.6625},
    {"ncm": "64041900", "uf": "SC", "description": "Tênis esportivo", "federal_rate": 0.1425, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.35, "total_rate": 0.6625},
    # Construção
    {"ncm": "25232900", "uf": "SC", "description": "Cimento Portland", "federal_rate": 0.0925, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2625},
    {"ncm": "72142000", "uf": "SC", "description": "Vergalhão aço", "federal_rate": 0.0925, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2625},
    {"ncm": "69072200", "uf": "SC", "description": "Piso cerâmico", "federal_rate": 0.0925, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.0, "total_rate": 0.2625},
    # Automotivo
    {"ncm": "87032100", "uf": "SC", "description": "Automóvel popular", "federal_rate": 0.2225, "state_rate": 0.12, "municipal_rate": 0.0, "import_rate": 0.35, "total_rate": 0.6925},
    {"ncm": "40111000", "uf": "SC", "description": "Pneu automóvel", "federal_rate": 0.1425, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.16, "total_rate": 0.4725},
    # Eletrodomésticos
    {"ncm": "84501100", "uf": "SC", "description": "Máquina de lavar roupa", "federal_rate": 0.2025, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.20, "total_rate": 0.5725},
    {"ncm": "84181000", "uf": "SC", "description": "Geladeira/refrigerador", "federal_rate": 0.2025, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.20, "total_rate": 0.5725},
    {"ncm": "85162100", "uf": "SC", "description": "Ar condicionado", "federal_rate": 0.2025, "state_rate": 0.17, "municipal_rate": 0.0, "import_rate": 0.20, "total_rate": 0.5725},
    {"ncm": "85163200", "uf": "SC", "description": "Secador de cabelo", "federal_rate": 0.2025, "state_rate": 0.25, "municipal_rate": 0.0, "import_rate": 0.20, "total_rate": 0.6525},
]
