

# Plano: Corrigir Galeria de Fotos e Melhorar Qualidade

## 1. Bug do Deslizar no Celular (Fotos Pulando)

**Problema**: O sistema de swipe atual usa `onTouchStart`/`onTouchEnd` com uma abordagem simplificada que causa conflitos. A logica de transicao CSS compara indices de forma direta (`i < activeIndex` / `i > activeIndex`), o que nao trata bem a navegacao circular. Alem disso, o threshold de 50px e sensivel demais, e nao ha prevencao de scroll vertical durante o swipe horizontal.

**Solucao**: Reescrever o handler de toque para:
- Rastrear `touchStartX` e `touchStartY` usando `useRef` em vez de propriedades no DOM
- Adicionar deteccao de direcao: se o movimento for mais vertical que horizontal, ignorar o swipe
- Aumentar threshold para 60px para evitar swipes acidentais
- Usar `e.preventDefault()` apenas quando detectar swipe horizontal
- Rastrear a direcao da animacao (esquerda/direita) para que a transicao CSS deslize corretamente sem "pular"

## 2. Setas de Navegacao no Desktop

**Problema**: No desktop, a unica forma de navegar e clicar na imagem (avanca) ou nas thumbnails. Nao ha setas visiveis.

**Solucao**: Adicionar botoes de seta esquerda/direita sobre a imagem principal no desktop:
- Setas com icones `ChevronLeft` e `ChevronRight` do Lucide
- Posicionadas nos lados esquerdo e direito da imagem
- Aparecem com hover na imagem (semi-transparentes, ficam opacas no hover)
- Estilo minimalista: fundo branco/80 com backdrop-blur, arredondado
- So aparecem se houver mais de 1 imagem

## 3. Reduzir Compressao das Fotos (Melhor Qualidade)

**Problema**: O servico de redimensionamento do Supabase aplica compressao padrao que pode degradar a qualidade. A funcao `getOptimizedImageUrl` nao especifica um parametro de qualidade.

**Solucao**: Adicionar o parametro `quality=90` nas URLs de transformacao do Supabase. Isso mantém o carregamento rapido (imagem ainda e redimensionada) mas com qualidade visivelmente melhor. O padrao do Supabase e `quality=80`, entao subir para 90 melhora a nitidez sem impacto significativo no tamanho.

---

## Detalhes Tecnicos

### Arquivo: `src/components/ProductPage.tsx`

**Galeria Mobile (linhas 222-286)**:

Substituir o handler de toque inline por refs e logica melhorada:

```text
// Adicionar refs no componente:
const touchStartX = useRef(0);
const touchStartY = useRef(0);
const touchDirection = useRef<'horizontal' | 'vertical' | null>(null);
const swipeDirection = useRef<'left' | 'right'>('left');

// onTouchStart: salvar posicao inicial e resetar direcao
// onTouchMove: detectar se e horizontal ou vertical (lock de direcao)
// onTouchEnd: se horizontal e diff > 60px, navegar e definir swipeDirection

// Transicao CSS: usar swipeDirection para animar corretamente
// em vez de comparar i < activeIndex
```

**Galeria Desktop (linhas 289-327)**:

Adicionar setas de navegacao sobre a imagem principal:

```text
// Dentro do container da imagem desktop, adicionar:
// Seta esquerda (visivel no hover do container)
<button onClick={prevImage} className="absolute left-3 top-1/2 ...">
  <ChevronLeft />
</button>

// Seta direita
<button onClick={nextImage} className="absolute right-3 top-1/2 ...">
  <ChevronRight />
</button>
```

### Arquivo: `src/lib/utils.ts`

Adicionar parametro `quality=90` nas URLs otimizadas:

```text
// Na funcao getOptimizedImageUrl, ao montar os params:
const params = [`width=${width}`];
if (height) params.push(`height=${height}`);
params.push('resize=contain');
params.push('quality=90');  // Nova linha
```

---

## Resumo

| Arquivo | O que muda |
|---------|-----------|
| `src/components/ProductPage.tsx` | Corrigir swipe mobile com refs e deteccao de direcao; adicionar setas no desktop |
| `src/lib/utils.ts` | Adicionar `quality=90` para melhorar qualidade das fotos mantendo performance |
