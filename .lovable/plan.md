

# Plano: Corrigir Favoritos/Pedidos + Pesquisa com Sugestoes

## 1. Favoritos e Meus Pedidos nao navegam ao clicar

### Causa raiz

O `accountMenuRef` (linha 149 do header) so envolve o container do dropdown no **desktop**. No mobile (linhas 250-295), o dropdown esta dentro de um `<div>` separado SEM essa ref.

O `handleClickOutside` usa `mousedown` (que dispara ANTES do `click`). Quando o usuario clica em "Meus Favoritos" ou "Meus Pedidos" no dropdown mobile, o handler detecta que o clique esta "fora" do `accountMenuRef` (que so cobre o desktop), fecha o dropdown, e o Link desaparece do DOM antes do click ser processado. Resultado: nada acontece.

### Correcao

Criar uma segunda ref para o container mobile do dropdown, e alterar o `handleClickOutside` para verificar ambas as refs:

```text
const mobileAccountRef = useRef<HTMLDivElement>(null);

// No handleClickOutside:
if (
  accountMenuRef.current && !accountMenuRef.current.contains(event.target) &&
  mobileAccountRef.current && !mobileAccountRef.current.contains(event.target)
) {
  setAccountMenuOpen(false);
}
```

Adicionar `ref={mobileAccountRef}` no `<div className="relative">` que envolve o botao de perfil e dropdown mobile (linha 250).

**Arquivo:** `src/components/sections/header.tsx`

---

## 2. Pesquisa com sugestoes em tempo real

O usuario quer que, ao digitar no campo de busca, aparecam sugestoes de produtos que correspondem ao texto digitado. Ao pressionar Enter, os resultados sao mostrados na pagina.

### Implementacao

No header, ao digitar no campo de busca:
- Buscar produtos do banco que contem as letras digitadas no nome (minimo 2 caracteres)
- Mostrar um dropdown abaixo do campo com ate 5 sugestoes de produtos (nome + imagem + preco)
- Ao clicar numa sugestao, navegar direto para a pagina do produto
- Ao pressionar Enter, navegar para `/escolas/colegio-militar?search=TERMO` como ja funciona

Detalhes tecnicos:
- Usar `useState` para armazenar as sugestoes
- Usar debounce de 300ms para nao fazer muitas requisicoes ao banco
- Buscar com `supabase.from("products").select("id, name, price, images, image_url, school_slug").ilike("name", `%${query}%`).limit(5)`
- Mostrar dropdown de sugestoes tanto no mobile quanto no desktop

**Arquivo:** `src/components/sections/header.tsx`

---

## Resumo de Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/components/sections/header.tsx` | Corrigir ref do dropdown mobile para que links de Favoritos/Pedidos funcionem; Adicionar busca em tempo real com sugestoes de produtos |

