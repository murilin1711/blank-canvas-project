

# Melhorias e Mudancas no Site

## Resumo das alteracoes

6 mudancas em 5 arquivos diferentes.

---

## 1. Remover FAQ do menu superior

**Arquivo:** `src/components/sections/header.tsx`

- Linha 75: remover `"FAQ"` do array `navItems`
- Linha 76: remover `"Perguntas Frequentes (FAQ)"` do array `navItemsMobile`

---

## 2. Remover foto do hero da pagina Sobre Nos

**Arquivo:** `src/app/sobre/page.tsx`

- Remover o bloco da coluna direita do hero (linhas 62-73) que contem a imagem Unsplash e os blur decorativos
- Mudar o grid de `lg:grid-cols-2` para coluna unica, centralizando o texto

---

## 3. Arrumar CTA "Falar com um consultor" no desktop (igual mobile) + link WhatsApp correto

**Arquivo:** `src/app/sobre/page.tsx`

- Trocar o layout `flex-col sm:flex-row` dos botoes para `flex-col` sempre (empilhados, igual mobile)
- Atualizar o link de `https://wa.me/5562999999999` para `https://wa.me/5562991121586`

---

## 4. Rodape: alinhar botoes e remover Facebook

**Arquivo:** `src/components/sections/footer.tsx`

- Remover o item Facebook do array de links de "Redes sociais" (linha 51)
- Mudar layout dos botoes de `flex-wrap` para `flex flex-col` em cada secao para ficarem alinhados verticalmente (ou `flex-col sm:flex-row` se preferir alinhamento mais limpo)

---

## 5. Remover barra de Ordenar / Itens por linha / Resultados

**Arquivo:** `src/app/escolas/colegio-militar/page.tsx`

- Remover o bloco inteiro das linhas 385-436 que contem: select de Ordenar, select de Itens por linha (desktop), select de Colunas (mobile), e o texto "X resultados"

---

## 6. Atualizar todos os links wa.me com numero falso

**Arquivo:** `src/app/checkout/sucesso/page.tsx`

- Trocar `tel:+5562999999999` e `(62) 99999-9999` para o WhatsApp correto: `https://wa.me/5562991121586` com texto `(62) 99112-1586`

---

## Resumo de arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/components/sections/header.tsx` | Remover FAQ dos menus |
| `src/app/sobre/page.tsx` | Remover foto hero, arrumar CTA empilhado, link WhatsApp correto |
| `src/components/sections/footer.tsx` | Remover Facebook, alinhar botoes |
| `src/app/escolas/colegio-militar/page.tsx` | Remover toolbar de ordenacao/colunas/resultados |
| `src/app/checkout/sucesso/page.tsx` | Corrigir numero WhatsApp |

