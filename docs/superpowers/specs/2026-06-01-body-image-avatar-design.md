# Design: BodyImageAvatar

**Data:** 2026-06-01  
**Status:** Aprovado

## Contexto

Substituir o avatar SVG dinâmico (`AvatarBody` / `BodyFigureSVG`) por um sistema de composição de imagens PNG com transição suave (crossfade) entre níveis corporais por região.

## Imagens

### Origem
7 pastas em Downloads, cada uma com sequências de 5 PNG (exceto ABDOME E BUSTO FEMININO com 10):

| Pasta Downloads | Destino em `src/assets/body-images/` | Frames |
|---|---|---|
| TORAX E OMBRO MASCULINO | `torax-masc/1-5.png` | 5 |
| TORAX E OMBRO FEMININO | `torax-fem/1-5.png` | 5 |
| ABDOME MASCULINO | `abdome-masc/1-5.png` | 5 |
| ABDOME E BUSTO FEMININO (imagens 1–5) | `abdome-fem/1-5.png` | 5 |
| ABDOME E BUSTO FEMININO (imagens 6–10) | `busto-fem/1-5.png` (renomear 6→1, 7→2…) | 5 |
| COXA E QUADRIL MASCULINO | `coxa-quadril-masc/1-5.png` | 5 |
| COXA E QUADRIL FEMININO | `coxa-quadril-fem/1-5.png` | 5 |
| GLUTEO HOMEM E MULHER | `gluteo/1-5.png` (compartilhado M/F) | 5 |

### Características técnicas
- Canvas quadrado (~1000×1000px), fundo branco
- Cada imagem contém o desenho da sua região posicionado no canvas inteiro
- Label de texto no canto superior esquerdo (ex: "Pouco Volumoso / ABDOME") — ocultado via CSS

## Técnica de Composição

Todas as imagens de uma região são empilhadas com `position: absolute; inset: 0` dentro de um container `position: relative`.

- `mix-blend-mode: multiply` → fundo branco se torna transparente, só os traços aparecem
- `opacity: 1` na imagem do nível ativo, `opacity: 0` nas demais
- `transition: opacity 0.35s ease` → crossfade suave ao trocar nível
- Label de texto ocultado com `clipPath: "inset(13% 0 0 0)"` no container (não afeta os desenhos)

## Componente: `BodyImageAvatar`

**Arquivo:** `src/components/BodyImageAvatar.tsx`

```ts
interface BodyImageAvatarProps {
  sex: "m" | "f"
  toraxLevel: 1 | 2 | 3 | 4 | 5
  abdomeLevel: 1 | 2 | 3 | 4 | 5
  bustoLevel?: 1 | 2 | 3 | 4 | 5      // feminino only
  quadrilLevel: 1 | 2 | 3 | 4 | 5
  gluteoLevel: 1 | 2 | 3 | 4 | 5
  activeRegion?: "torax" | "abdome" | "busto" | "quadril" | "gluteo"
  width?: number
}
```

Internamente, o componente renderiza um container com 5 camadas de `<img>` por região, trocando opacity conforme o level recebido.

## Integração com ProductPage

O `ProductPage` já calcula `adj.torax.level`, `adj.abdome.level`, etc. (valores 1–5) via `sizeFinder.ts` — basta repassar diretamente.

```tsx
<BodyImageAvatar
  sex={isFemale ? "f" : "m"}
  toraxLevel={adj.torax.level}
  abdomeLevel={adj.abdome.level}
  bustoLevel={adj.busto?.level}
  quadrilLevel={adj.quadril.level}
  gluteoLevel={adj.gluteo.level}
  activeRegion={activeReg}
/>
```

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/components/AvatarBody.tsx` | Reescrever como `BodyImageAvatar` (ou criar novo e deletar o antigo) |
| `src/components/BodyFigureSVG.tsx` | Deletar (substituído) |
| `src/components/BodyFigureSVG 2.tsx` | Deletar |
| `src/components/ProductPage.tsx` | Trocar import + props |
| `src/assets/body-images/` | Criar pasta e copiar as imagens organizadas |

## Fora do escopo

- Não alterar a lógica de `sizeFinder.ts` nem `volumetry.ts`
- Não alterar os sliders de ajuste em `ProductPage`
- Não remover os SVGs de avatars existentes (podem ser mantidos como fallback até validação)
