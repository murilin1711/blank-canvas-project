

# Plano: Corrigir Navegacao + Qualidade de Imagem + Velocidade

## 1. Links quebrados no menu mobile (e desktop)

No arquivo `src/components/sections/header.tsx`, os itens "Uniformes Empresariais" e "Camisetas Personalizadas" no menu mobile (linha 356-362) caem num `else` generico que renderiza um `<button>` que apenas fecha o menu sem navegar. No desktop (linhas 431-436), o submenu mostra texto placeholder ("Conteudo do submenu para...") em vez de links.

### Correcao

**Mobile** (linhas 356-362): Trocar o `<button>` generico por `<Link>` com navegacao correta:
- "Uniformes Empresariais" → `/empresarial`
- "Camisetas Personalizadas" → `/personalizacao`
- "Perguntas Frequentes (FAQ)" → scroll para secao FAQ na home (ou link para `/sobre`)

**Desktop** (linhas 431-436): No submenu overlay, trocar o placeholder por links reais para as paginas corretas.

---

## 2. Qualidade das imagens no celular

Atualmente as imagens de produto no mobile sao servidas com `width=500`. Em telas de alta resolucao (2x, 3x), isso resulta em imagens borradas pois 500px cobre apenas ~167px reais numa tela 3x.

### Correcao

No `src/components/ProductPage.tsx`, aumentar a largura das imagens no mobile de 500px para **750px**. Isso garante boa qualidade em telas ate 2x (375px logicos) sem pesar demais (~150-300KB por imagem em vez de ~50-100KB).

---

## 3. Velocidade das paginas Empresarial e Personalizacao

As imagens dessas paginas (`src/assets/linhas/...`) sao importadas localmente e servidas sem otimizacao -- o navegador baixa os arquivos originais (potencialmente varios MB cada). Como sao imagens estaticas locais (nao do Supabase Storage), o `getOptimizedImageUrl` nao se aplica.

### Correcao

Adicionar `loading="lazy"` e `decoding="async"` nas imagens dos cards dessas duas paginas para que o navegador nao tente baixar todas simultaneamente. Tambem reduzir o tamanho visual com `fetchPriority` adequado.

---

## Resumo de Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/components/sections/header.tsx` | Mobile: trocar `<button>` por `<Link>` para Empresarial e Personalizacao. Desktop: trocar placeholder do submenu por links reais |
| `src/components/ProductPage.tsx` | Aumentar imagem mobile de 500px para 750px |
| `src/app/empresarial/page.tsx` | Adicionar `loading="lazy"` e `decoding="async"` nas imagens |
| `src/app/personalizacao/page.tsx` | Adicionar `loading="lazy"` e `decoding="async"` nas imagens |

