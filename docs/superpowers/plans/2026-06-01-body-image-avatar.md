# BodyImageAvatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o avatar SVG paramétrico por composição de imagens PNG com crossfade CSS por região corporal.

**Architecture:** Cada região do corpo é um stack de 5 `<img>` sobrepostas com `position: absolute`. A imagem do nível ativo recebe `opacity: 1` e as demais `opacity: 0`, com `transition: opacity 0.35s ease`. `mix-blend-mode: multiply` faz o fundo branco das PNGs sumir. Um novo componente `BodyImageAvatar` substitui `BodyFigureSVG` no `ProductPage`.

**Tech Stack:** React 19, TypeScript (strict), Vite (static image imports), Tailwind CSS v4, Framer Motion não é necessário (CSS puro).

---

## Mapa de arquivos

| Arquivo | Ação |
|---|---|
| `src/assets/body-images/torax-masc/1-5.png` | Criar — copiar de Downloads |
| `src/assets/body-images/torax-fem/1-5.png` | Criar — copiar de Downloads |
| `src/assets/body-images/abdome-masc/1-5.png` | Criar — copiar de Downloads |
| `src/assets/body-images/abdome-fem/1-5.png` | Criar — imagens 1–5 de ABDOME E BUSTO FEMININO |
| `src/assets/body-images/busto-fem/1-5.png` | Criar — imagens 6–10 renomeadas 1–5 |
| `src/assets/body-images/coxa-quadril-masc/1-5.png` | Criar — copiar de Downloads |
| `src/assets/body-images/coxa-quadril-fem/1-5.png` | Criar — copiar de Downloads |
| `src/assets/body-images/gluteo/1-5.png` | Criar — copiar de Downloads (compartilhado M/F) |
| `src/components/BodyImageAvatar.tsx` | Criar — novo componente |
| `src/components/ProductPage.tsx` | Modificar — trocar BodyFigureSVG por BodyImageAvatar |
| `src/components/BodyFigureSVG.tsx` | Deletar |
| `src/components/BodyFigureSVG 2.tsx` | Deletar |
| `src/components/AvatarBody.tsx` | Deletar |

---

## Task 1: Copiar e organizar as imagens

**Files:**
- Create: `src/assets/body-images/` (estrutura de pastas)

- [ ] **Step 1: Criar estrutura de pastas**

```bash
mkdir -p /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/torax-masc
mkdir -p /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/torax-fem
mkdir -p /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/abdome-masc
mkdir -p /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/abdome-fem
mkdir -p /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/busto-fem
mkdir -p /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/coxa-quadril-masc
mkdir -p /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/coxa-quadril-fem
mkdir -p /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/gluteo
```

- [ ] **Step 2: Copiar imagens de tórax**

```bash
cp /Users/muriloroizpovoa/Downloads/TORAX\ E\ OMBRO\ MASCULINO/{1,2,3,4,5}.png \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/torax-masc/

cp /Users/muriloroizpovoa/Downloads/TORAX\ E\ OMBRO\ FEMININO/{1,2,3,4,5}.png \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/torax-fem/
```

- [ ] **Step 3: Copiar imagens de abdome masculino**

```bash
cp "/Users/muriloroizpovoa/Downloads/ABDOME MASCULINO /{1,2,3,4,5}.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/abdome-masc/
```

- [ ] **Step 4: Copiar imagens femininas de abdome e busto (pasta com 10 frames)**

Os primeiros 5 são abdome, os últimos 5 são busto (renomeados 1–5):

```bash
# Abdome feminino: frames 1–5
cp "/Users/muriloroizpovoa/Downloads/ABDOME E BUSTO FEMININO/1.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/abdome-fem/1.png
cp "/Users/muriloroizpovoa/Downloads/ABDOME E BUSTO FEMININO/2.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/abdome-fem/2.png
cp "/Users/muriloroizpovoa/Downloads/ABDOME E BUSTO FEMININO/3.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/abdome-fem/3.png
cp "/Users/muriloroizpovoa/Downloads/ABDOME E BUSTO FEMININO/4.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/abdome-fem/4.png
cp "/Users/muriloroizpovoa/Downloads/ABDOME E BUSTO FEMININO/5.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/abdome-fem/5.png

# Busto feminino: frames 6–10 renomeados para 1–5
cp "/Users/muriloroizpovoa/Downloads/ABDOME E BUSTO FEMININO/6.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/busto-fem/1.png
cp "/Users/muriloroizpovoa/Downloads/ABDOME E BUSTO FEMININO/7.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/busto-fem/2.png
cp "/Users/muriloroizpovoa/Downloads/ABDOME E BUSTO FEMININO/8.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/busto-fem/3.png
cp "/Users/muriloroizpovoa/Downloads/ABDOME E BUSTO FEMININO/9.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/busto-fem/4.png
cp "/Users/muriloroizpovoa/Downloads/ABDOME E BUSTO FEMININO/10.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/busto-fem/5.png
```

- [ ] **Step 5: Copiar imagens de coxa+quadril e glúteo**

```bash
cp "/Users/muriloroizpovoa/Downloads/COXA E QUADRIL MASCULINO /{1,2,3,4,5}.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/coxa-quadril-masc/

cp "/Users/muriloroizpovoa/Downloads/COXA E QUADRIL FEMININO /{1,2,3,4,5}.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/coxa-quadril-fem/

cp "/Users/muriloroizpovoa/Downloads/GLUTEO HOMEM E MULHER /{1,2,3,4,5}.png" \
   /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images/gluteo/
```

- [ ] **Step 6: Verificar estrutura**

```bash
find /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project/src/assets/body-images -name "*.png" | sort
```

Esperado: 40 arquivos (8 pastas × 5 PNG cada).

- [ ] **Step 7: Commit**

```bash
cd /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project
git add src/assets/body-images/
git commit -m "feat: add body region PNG image sequences"
```

---

## Task 2: Criar o componente BodyImageAvatar

**Files:**
- Create: `src/components/BodyImageAvatar.tsx`

- [ ] **Step 1: Criar o arquivo com imports e tipos**

Criar `src/components/BodyImageAvatar.tsx`:

```tsx
// Tórax + Ombro
import toraxMasc1 from "@/assets/body-images/torax-masc/1.png";
import toraxMasc2 from "@/assets/body-images/torax-masc/2.png";
import toraxMasc3 from "@/assets/body-images/torax-masc/3.png";
import toraxMasc4 from "@/assets/body-images/torax-masc/4.png";
import toraxMasc5 from "@/assets/body-images/torax-masc/5.png";
import toraxFem1  from "@/assets/body-images/torax-fem/1.png";
import toraxFem2  from "@/assets/body-images/torax-fem/2.png";
import toraxFem3  from "@/assets/body-images/torax-fem/3.png";
import toraxFem4  from "@/assets/body-images/torax-fem/4.png";
import toraxFem5  from "@/assets/body-images/torax-fem/5.png";

// Abdome
import abdomeMasc1 from "@/assets/body-images/abdome-masc/1.png";
import abdomeMasc2 from "@/assets/body-images/abdome-masc/2.png";
import abdomeMasc3 from "@/assets/body-images/abdome-masc/3.png";
import abdomeMasc4 from "@/assets/body-images/abdome-masc/4.png";
import abdomeMasc5 from "@/assets/body-images/abdome-masc/5.png";
import abdomeFem1  from "@/assets/body-images/abdome-fem/1.png";
import abdomeFem2  from "@/assets/body-images/abdome-fem/2.png";
import abdomeFem3  from "@/assets/body-images/abdome-fem/3.png";
import abdomeFem4  from "@/assets/body-images/abdome-fem/4.png";
import abdomeFem5  from "@/assets/body-images/abdome-fem/5.png";

// Busto (feminino)
import bustoFem1 from "@/assets/body-images/busto-fem/1.png";
import bustoFem2 from "@/assets/body-images/busto-fem/2.png";
import bustoFem3 from "@/assets/body-images/busto-fem/3.png";
import bustoFem4 from "@/assets/body-images/busto-fem/4.png";
import bustoFem5 from "@/assets/body-images/busto-fem/5.png";

// Coxa + Quadril
import coxaMasc1 from "@/assets/body-images/coxa-quadril-masc/1.png";
import coxaMasc2 from "@/assets/body-images/coxa-quadril-masc/2.png";
import coxaMasc3 from "@/assets/body-images/coxa-quadril-masc/3.png";
import coxaMasc4 from "@/assets/body-images/coxa-quadril-masc/4.png";
import coxaMasc5 from "@/assets/body-images/coxa-quadril-masc/5.png";
import coxaFem1  from "@/assets/body-images/coxa-quadril-fem/1.png";
import coxaFem2  from "@/assets/body-images/coxa-quadril-fem/2.png";
import coxaFem3  from "@/assets/body-images/coxa-quadril-fem/3.png";
import coxaFem4  from "@/assets/body-images/coxa-quadril-fem/4.png";
import coxaFem5  from "@/assets/body-images/coxa-quadril-fem/5.png";

// Glúteo (compartilhado M/F)
import gluteo1 from "@/assets/body-images/gluteo/1.png";
import gluteo2 from "@/assets/body-images/gluteo/2.png";
import gluteo3 from "@/assets/body-images/gluteo/3.png";
import gluteo4 from "@/assets/body-images/gluteo/4.png";
import gluteo5 from "@/assets/body-images/gluteo/5.png";

type Level = 1 | 2 | 3 | 4 | 5;

export interface BodyImageAvatarProps {
  sex: "m" | "f";
  toraxLevel: Level;
  abdomeLevel: Level;
  bustoLevel?: Level;
  quadrilLevel: Level;
  gluteoLevel: Level;
  activeRegion?: "torax" | "abdome" | "busto" | "quadril" | "coxa" | "gluteo" | null;
  width?: number;
}

const TORAX_MASC  = [toraxMasc1,  toraxMasc2,  toraxMasc3,  toraxMasc4,  toraxMasc5];
const TORAX_FEM   = [toraxFem1,   toraxFem2,   toraxFem3,   toraxFem4,   toraxFem5];
const ABDOME_MASC = [abdomeMasc1, abdomeMasc2, abdomeMasc3, abdomeMasc4, abdomeMasc5];
const ABDOME_FEM  = [abdomeFem1,  abdomeFem2,  abdomeFem3,  abdomeFem4,  abdomeFem5];
const BUSTO_FEM   = [bustoFem1,   bustoFem2,   bustoFem3,   bustoFem4,   bustoFem5];
const COXA_MASC   = [coxaMasc1,   coxaMasc2,   coxaMasc3,   coxaMasc4,   coxaMasc5];
const COXA_FEM    = [coxaFem1,    coxaFem2,    coxaFem3,    coxaFem4,    coxaFem5];
const GLUTEO      = [gluteo1,     gluteo2,     gluteo3,     gluteo4,     gluteo5];
```

- [ ] **Step 2: Adicionar o subcomponente RegionLayer e o componente principal**

Adicionar no mesmo arquivo, abaixo das constantes:

```tsx
// Container com 5 imagens empilhadas — exibe a do nível ativo via opacity
function RegionLayer({
  images,
  activeLevel,
  isHighlighted,
}: {
  images: string[];
  activeLevel: Level;
  isHighlighted: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // clip remove o label de texto baked-in no topo das imagens (~13% superior)
        // os desenhos do corpo ficam abaixo desta área e não são afetados
        clipPath: "inset(13% 0 0 0)",
        outline: isHighlighted ? "2px solid #2e3091" : "none",
        outlineOffset: "-2px",
        borderRadius: isHighlighted ? "4px" : undefined,
        transition: "outline 0.2s ease",
      }}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            mixBlendMode: "multiply",
            opacity: i + 1 === activeLevel ? 1 : 0,
            transition: "opacity 0.35s ease",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

export function BodyImageAvatar({
  sex,
  toraxLevel,
  abdomeLevel,
  bustoLevel = 3,
  quadrilLevel,
  gluteoLevel,
  activeRegion,
  width = 140,
}: BodyImageAvatarProps) {
  const height = Math.round(width * (260 / 140));

  const toraxImgs  = sex === "f" ? TORAX_FEM   : TORAX_MASC;
  const abdomeImgs = sex === "f" ? ABDOME_FEM  : ABDOME_MASC;
  const coxaImgs   = sex === "f" ? COXA_FEM    : COXA_MASC;

  // "coxa" e "quadril" mapeiam para a mesma camada (imagens combinadas)
  const coxaActive   = activeRegion === "coxa" || activeRegion === "quadril";
  // "torax" ativa busto junto no feminino
  const bustoActive  = activeRegion === "torax" || activeRegion === "busto";

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      <RegionLayer
        images={toraxImgs}
        activeLevel={toraxLevel}
        isHighlighted={activeRegion === "torax"}
      />

      {sex === "f" && (
        <RegionLayer
          images={BUSTO_FEM}
          activeLevel={bustoLevel}
          isHighlighted={bustoActive}
        />
      )}

      <RegionLayer
        images={abdomeImgs}
        activeLevel={abdomeLevel}
        isHighlighted={activeRegion === "abdome"}
      />

      <RegionLayer
        images={coxaImgs}
        activeLevel={quadrilLevel}
        isHighlighted={coxaActive}
      />

      <RegionLayer
        images={GLUTEO}
        activeLevel={gluteoLevel}
        isHighlighted={activeRegion === "gluteo"}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verificar que o TypeScript compila sem erros**

```bash
cd /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project
npx tsc --noEmit 2>&1 | grep -i "BodyImageAvatar\|body-images" | head -20
```

Esperado: nenhuma linha de erro envolvendo o novo componente.

- [ ] **Step 4: Commit**

```bash
git add src/components/BodyImageAvatar.tsx
git commit -m "feat: add BodyImageAvatar with PNG crossfade composition"
```

---

## Task 3: Integrar BodyImageAvatar no ProductPage

**Files:**
- Modify: `src/components/ProductPage.tsx` (linha ~2 import, linhas ~1052–1098)

- [ ] **Step 1: Trocar o import no topo do arquivo**

Localizar a linha:
```tsx
import { BodyFigureSVG } from "@/components/BodyFigureSVG";
```

Substituir por:
```tsx
import { BodyImageAvatar } from "@/components/BodyImageAvatar";
```

- [ ] **Step 2: Remover as constantes de escala que não são mais necessárias**

Localizar e remover as 5 linhas (por volta da linha 1052):
```tsx
const toraxSx   = LEVEL_SCALES[adjToLevel(adjustments.toraxAdj)]   ?? 1;
const abdomeSx  = LEVEL_SCALES[adjToLevel(adjustments.cinturaAdj)] ?? 1;
const gluteoSx  = LEVEL_SCALES[adjToLevel(adjustments.gluteoAdj)]  ?? 1;
const quadrilSx = LEVEL_SCALES[adjToLevel(adjustments.quadrilAdj)] ?? 1;
const coxaSx    = LEVEL_SCALES[adjToLevel(adjustments.coxaAdj)]    ?? 1;
```

Substituir por:
```tsx
const toraxLevel   = adjToLevel(adjustments.toraxAdj)   as 1|2|3|4|5;
const abdomeLevel  = adjToLevel(adjustments.cinturaAdj) as 1|2|3|4|5;
const gluteoLevel  = adjToLevel(adjustments.gluteoAdj)  as 1|2|3|4|5;
const quadrilLevel = adjToLevel(adjustments.quadrilAdj) as 1|2|3|4|5;
```

- [ ] **Step 3: Substituir o JSX do BodyFigureSVG**

Localizar:
```tsx
<BodyFigureSVG
  sex={isFemale ? "f" : "m"}
  toraxSx={toraxSx}
  abdomeSx={abdomeSx}
  quadrilSx={quadrilSx}
  coxaSx={coxaSx}
  gluteoSx={gluteoSx}
  activeRegion={activeReg}
  width={140}
  height={260}
/>
```

Substituir por:
```tsx
<BodyImageAvatar
  sex={isFemale ? "f" : "m"}
  toraxLevel={toraxLevel}
  abdomeLevel={abdomeLevel}
  quadrilLevel={quadrilLevel}
  gluteoLevel={gluteoLevel}
  activeRegion={activeReg}
  width={140}
/>
```

- [ ] **Step 4: Verificar que o TypeScript compila sem erros**

```bash
cd /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project
npx tsc --noEmit 2>&1 | head -30
```

Esperado: saída vazia (zero erros).

- [ ] **Step 5: Rodar o dev server e verificar visualmente**

```bash
npm run dev
```

Acessar `http://localhost:8080`, navegar até um produto (ex: `/escolas/colegio-militar/produto/<id>`), chegar na etapa "Ajuste a forma do corpo" e verificar:
- O avatar aparece com as imagens PNG compostas
- Ao mudar um nível (ex: Tórax de Normal → Volumoso), a imagem faz crossfade suave
- Ao hover/touch em uma RegionRow, a região correspondente fica destacada
- O label de texto das imagens (ex: "Pouco Volumoso") não aparece

- [ ] **Step 6: Commit**

```bash
git add src/components/ProductPage.tsx
git commit -m "feat: integrate BodyImageAvatar into ProductPage"
```

---

## Task 4: Remover arquivos obsoletos

**Files:**
- Delete: `src/components/BodyFigureSVG.tsx`
- Delete: `src/components/BodyFigureSVG 2.tsx`
- Delete: `src/components/AvatarBody.tsx`

- [ ] **Step 1: Confirmar que nenhum arquivo importa os componentes deletados**

```bash
cd /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project
grep -r "BodyFigureSVG\|AvatarBody" src/ --include="*.tsx" --include="*.ts" -l
```

Esperado: nenhuma linha (zero arquivos). Se houver arquivos, atualizar os imports antes de deletar.

- [ ] **Step 2: Deletar os arquivos**

```bash
rm "/Users/muriloroizpovoa/Desktop/GM MINAS/blank-canvas-project/src/components/BodyFigureSVG.tsx"
rm "/Users/muriloroizpovoa/Desktop/GM MINAS/blank-canvas-project/src/components/BodyFigureSVG 2.tsx"
rm "/Users/muriloroizpovoa/Desktop/GM MINAS/blank-canvas-project/src/components/AvatarBody.tsx"
```

- [ ] **Step 3: Verificar build limpa**

```bash
cd /Users/muriloroizpovoa/Desktop/GM\ MINAS/blank-canvas-project
npx tsc --noEmit 2>&1 | head -20
```

Esperado: saída vazia.

- [ ] **Step 4: Commit**

```bash
git add -u src/components/
git commit -m "chore: remove obsolete SVG avatar components"
```
