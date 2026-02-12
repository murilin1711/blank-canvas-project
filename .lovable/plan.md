

# Plano: 5 Correcoes (Zoom, Rodape, Pesquisa, Favoritos, Pedidos)

## 1. Zoom no celular ao clicar em campos do checkout

O problema e que em iOS/Safari, quando um input tem `font-size` menor que 16px, o navegador faz zoom automatico. A correcao e adicionar uma meta tag no `index.html`:

```text
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

Tambem garantir que os inputs do checkout tenham `font-size: 16px` minimo (o `text-body-sm` pode ser menor que 16px).

**Arquivo:** `index.html` (linha 7)

---

## 2. Remover itens do rodape

Remover do `src/components/sections/footer.tsx`:
- "Etica e Sustentabilidade" (da secao Politicas)
- "Central de atendimento" (da secao Fale conosco)
- Logo da Goias Minas (a imagem grande no topo do rodape)

**Arquivo:** `src/components/sections/footer.tsx`

---

## 3. Pesquisa de produtos - mostrar resultados com nomes

Atualmente o `handleSearch` no header redireciona direto para `/escolas/colegio-militar?search=...`, mas a pagina do colegio militar nao le o parametro `search` da URL.

A correcao e dupla:
1. No header (`handleSearch`), sempre navegar para `/escolas/colegio-militar?search=TERMO`
2. Na pagina do colegio militar, ler o parametro `search` da URL e preencher o campo de busca local para que o filtro ja funcione automaticamente

Assim quando o usuario pesquisar "camiseta", a pagina abre ja filtrando os produtos que contem "camiseta" no nome ou categoria.

**Arquivos:** `src/components/sections/header.tsx`, `src/app/escolas/colegio-militar/page.tsx`

---

## 4. Favoritos nao aparecem na pagina

O problema esta claro no codigo: a pagina de favoritos (`src/app/favoritos/page.tsx`) usa um `productsData` hardcoded com IDs de 1 a 6. Porem os produtos reais no banco tem IDs como 17, 18, 16, 15, 22, etc. Quando o usuario adiciona o produto ID 17 aos favoritos, a pagina tenta buscar `productsData[17]` que retorna `undefined`, e o `if (!product) return null` esconde o item.

### Correcao

Reescrever a pagina de favoritos para buscar os dados dos produtos do banco de dados usando os IDs salvos nos favoritos, em vez de usar dados hardcoded.

Tambem adicionar o link "Meus Favoritos" no dropdown do icone de pessoa (tanto mobile quanto desktop), junto com "Meus Pedidos".

**Arquivos:** `src/app/favoritos/page.tsx`, `src/components/sections/header.tsx`

---

## 5. Meus Pedidos nao funciona

O link para `/meus-pedidos` ja existe no dropdown do usuario. O problema pode ser que as policies RLS usam `RESTRICTIVE` (nao `PERMISSIVE`). Vou verificar se as RLS estao corretas.

Olhando o codigo da pagina, ha um bug: o `useEffect` esta posicionado DEPOIS de um `return` condicional (quando `!user`). Em React, hooks nao podem ser chamados condicionalmente. Isso pode causar erro silencioso.

### Correcao

Mover o `useEffect` para ANTES do return condicional, e adicionar a verificacao `if (!user) return` dentro do useEffect.

**Arquivo:** `src/app/meus-pedidos/page.tsx`

---

## Resumo de Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `index.html` | Adicionar `maximum-scale=1.0` na meta viewport |
| `src/components/sections/footer.tsx` | Remover "Etica e Sustentabilidade", "Central de atendimento" e logo |
| `src/components/sections/header.tsx` | Melhorar busca para redirecionar com parametro; adicionar "Meus Favoritos" no dropdown do usuario |
| `src/app/escolas/colegio-militar/page.tsx` | Ler parametro `search` da URL para filtrar produtos |
| `src/app/favoritos/page.tsx` | Buscar dados dos produtos do banco em vez de usar dados hardcoded |
| `src/app/meus-pedidos/page.tsx` | Corrigir posicao do useEffect (hook condicional) |

