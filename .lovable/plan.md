

# Plano: Remover compressao de imagens AVIF

## Problema

A funcao `getOptimizedImageUrl` em `src/lib/utils.ts` aplica transformacao server-side do Supabase em todas as imagens, convertendo a URL de `/object/public/` para `/render/image/public/` e adicionando parametros de redimensionamento (`width`, `resize`). O servico de redimensionamento do Supabase nao suporta AVIF, entao ele provavelmente esta convertendo a imagem para outro formato (PNG/JPEG) e comprimindo, anulando a vantagem do AVIF.

## Solucao

Modificar a funcao `getOptimizedImageUrl` para detectar arquivos `.avif` e retornar a URL original sem nenhuma transformacao. Como as imagens AVIF ja sao enviadas no tamanho correto de exibicao (800-1000px), nao precisam de redimensionamento server-side.

## Detalhe Tecnico

### Arquivo: `src/lib/utils.ts`

Adicionar uma verificacao no inicio da funcao: se a URL termina em `.avif`, retornar a URL original sem modificar. Isso garante que:

- Imagens AVIF sao servidas diretamente do storage, sem compressao
- Imagens em outros formatos (PNG, JPEG, WebP) continuam sendo otimizadas normalmente
- A URL usa o caminho `/object/public/` (acesso direto) em vez de `/render/image/public/` (transformacao)

## Resumo

| Arquivo | O que muda |
|---------|-----------|
| `src/lib/utils.ts` | Pular otimizacao para arquivos `.avif`, retornando URL original |

