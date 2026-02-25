

# Imagem por Variacao -- Ao clicar numa opcao, a foto muda

## O que vai mudar

Quando o administrador cadastrar uma variacao (ex: Tamanho P, M, G), ele podera opcionalmente associar uma foto a cada opcao. Na pagina do produto, ao clicar numa opcao que tem foto associada, a galeria automaticamente mostra essa foto.

---

## Detalhes Tecnicos

### 1. Atualizar a interface `VariationOption` (ambos arquivos)

Adicionar campo opcional `image` ao tipo `VariationOption`:

```typescript
interface VariationOption {
  value: string;
  price: number | null;
  image?: string | null; // URL da foto associada (opcional)
}
```

**Arquivos:** `src/components/ProductPage.tsx` e `src/components/admin/ProductFormModal.tsx`

### 2. Painel Admin -- Upload de imagem por opcao

**Arquivo:** `src/components/admin/ProductFormModal.tsx`

Na secao onde cada opcao de variacao e exibida (o chip com valor + preco + botao X), adicionar:
- Uma miniatura da imagem se existir (`option.image`)
- Um botao pequeno de upload (icone de camera/imagem) ao lado de cada opcao
- Reutilizar a mesma logica de upload que ja existe para as fotos do produto (upload para Supabase Storage)
- Um input file oculto por opcao, acionado pelo botao

Quando o admin adicionar uma nova opcao, o campo `image` comeca como `null`. O admin pode clicar no icone para fazer upload de uma foto especifica para aquela opcao.

Na area de adicionar opcao, incluir um botao de upload ao lado dos inputs de nome e preco.

### 3. Pagina do Produto -- Trocar foto ao selecionar variacao

**Arquivo:** `src/components/ProductPage.tsx`

Quando o usuario clicar num tamanho/variacao:
1. Verificar se a opcao selecionada tem campo `image` preenchido
2. Se sim, procurar o indice dessa imagem no array `images` do produto
3. Se a imagem nao estiver no array `images`, simplesmente exibir como imagem principal temporariamente
4. Chamar `setActiveIndex()` para o indice correspondente ou usar um estado auxiliar para sobrescrever a imagem principal

Logica simplificada:
```typescript
const handleSelectVariation = (option: VariationOption) => {
  setSelectedSize(option.value);
  if (option.image) {
    // Procurar no array de imagens
    const idx = images.findIndex(img => img === option.image);
    if (idx >= 0) {
      setActiveIndex(idx);
    }
    // Se nao encontrar, a imagem da variacao nao esta no array principal
    // entao definir como override temporario
  }
};
```

### 4. Helper para extrair imagem da opcao

Adicionar helper `getOptionImage` em ambos os arquivos:
```typescript
const getOptionImage = (option: string | VariationOption): string | null => {
  return typeof option === 'string' ? null : (option.image || null);
};
```

---

## Resumo

| Arquivo | O que muda |
|---------|-----------|
| `src/components/admin/ProductFormModal.tsx` | Adicionar campo `image` ao tipo, botao de upload por opcao de variacao, salvar URL da imagem |
| `src/components/ProductPage.tsx` | Adicionar campo `image` ao tipo, ao clicar numa variacao com foto, mudar a galeria para mostrar essa foto |

## Observacoes

- O campo `image` e **opcional** -- se nao tiver foto, o comportamento e identico ao atual
- A imagem da variacao deve ser uma das imagens ja cadastradas no produto (o admin seleciona qual imagem do array `images` corresponde a cada opcao, ou faz upload de uma nova)
- Nao precisa de migracao no banco de dados, pois `variations` ja e JSONB e aceita qualquer estrutura

