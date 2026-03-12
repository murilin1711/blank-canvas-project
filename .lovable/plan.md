

## Diagnóstico

1. **Preço errado**: A API Juma retorna `cost: 145` que provavelmente já é em reais (R$ 145,00), mas o carrinho divide por 100 (`data.cost / 100 = R$ 1,45`). Precisa remover essa divisão.

2. **Restrição geográfica**: Atualmente o Juma aparece para todo o estado de GO. Precisa restringir para Anápolis e cidades da região metropolitana.

## Mudanças

### 1. `src/app/carrinho/page.tsx` — Corrigir preço e restringir região

- Remover `/ 100` na linha que converte o custo Juma (linha ~79: `price: data.cost / 100` → `price: data.cost`)
- Mudar a condição de exibição do Juma: ao invés de `isLocalCity || viaCepData.uf === "GO"`, restringir para Anápolis e região metropolitana (ex: Anápolis, Nerópolis, Abadiânia, Campo Limpo de Goiás, Pirenópolis, Silvânia, Goianápolis, Terezópolis de Goiás, etc.)

### 2. Lista de cidades da região

Criar uma lista de cidades aceitas para entrega Juma:
```
"anápolis", "nerópolis", "abadiânia", "campo limpo de goiás", 
"pirenópolis", "silvânia", "goianápolis", "terezópolis de goiás",
"ouro verde de goiás", "damolândia", "petrolina de goiás"
```

O código vai normalizar o nome da cidade (lowercase, sem acentos) e verificar se está na lista antes de chamar a API Juma.

