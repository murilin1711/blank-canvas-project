

# Ajustes no Rodape e Mapa

## 1. Rodape - Layout de Politicas em 2 colunas alinhadas

**Arquivo:** `src/components/sections/footer.tsx`

Substituir o `flex-wrap` da secao Politicas por um grid de 2 colunas:

```
Coluna 1                    Coluna 2
Prazo de entrega            Trocas & Devoluções
Formas de pagamento         Termos e condições
Privacidade & Segurança
```

Usar `grid grid-cols-2 gap-2` em vez de `flex flex-wrap gap-2`. Cada botao pill ocupa uma celula do grid, ficando alinhados verticalmente.

---

## 2. Mapa - Trocar Google Maps embed por OpenStreetMap

**Arquivo:** `src/components/sections/store-locator.tsx`

Substituir o iframe do Google Maps (linha 132-141) por um iframe do OpenStreetMap que nao mostra avaliacoes:

```
https://www.openstreetmap.org/export/embed.html?bbox=-48.97,-16.34,-48.96,-16.33&layer=mapnik&marker=-16.3339,-48.9676
```

Coordenadas da loja: lat `-16.3339`, lon `-48.9676` (R. Guimaraes Natal, 51, Anapolis-GO).

---

## Resumo

| Arquivo | Mudanca |
|---------|---------|
| `src/components/sections/footer.tsx` | Grid 2 colunas para Politicas |
| `src/components/sections/store-locator.tsx` | Trocar Google Maps embed por OpenStreetMap |

