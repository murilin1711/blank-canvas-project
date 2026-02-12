
# Plano: Corrigir Restauracao de Scroll

## Problema

A abordagem atual usa timeouts fixos (ate 1500ms) para tentar restaurar o scroll, mas isso nao funciona porque:
- A pagina de produtos carrega dados do banco de forma assincrona
- Enquanto `loading` e `true`, a pagina mostra um loader/skeleton sem altura suficiente
- O carregamento pode demorar mais que 1500ms dependendo da conexao
- Mesmo dentro de 1500ms, o scroll e aplicado mas a pagina "encolhe" de volta quando o conteudo muda de skeleton para produtos reais

## Solucao

Substituir os timeouts fixos por um sistema mais robusto que observa mudancas no DOM. O componente vai usar um `MutationObserver` + `requestAnimationFrame` para monitorar quando a pagina atinge a altura necessaria e so entao restaurar o scroll. Isso garante que funcione independente do tempo de carregamento.

### Logica:

1. Ao detectar navegacao POP (voltar), em vez de disparar timeouts cegos, iniciar um observador que monitora a altura do documento
2. Quando `document.body.scrollHeight >= savedPosition + window.innerHeight` (ou seja, a pagina tem altura suficiente para scrollar ate a posicao salva), restaurar o scroll
3. Timeout maximo de 5 segundos como fallback, para nao ficar observando infinitamente
4. Cancelar o observador assim que o scroll for restaurado com sucesso

---

## Detalhes Tecnicos

### Arquivo: `src/components/ScrollToTop.tsx`

Reescrever o trecho de restauracao de scroll para usar:

```text
// Ao detectar POP com posicao salva:
1. Tentar scrollar imediatamente (caso conteudo ja esteja pronto)
2. Criar MutationObserver no document.body com { childList: true, subtree: true }
3. A cada mutacao, verificar se document.body.scrollHeight > savedPosition
4. Se sim, fazer window.scrollTo e desconectar o observer
5. Timeout de 5s como fallback para desconectar
```

Isso resolve o problema porque o observer dispara toda vez que o React renderiza novos elementos (ex: quando os produtos carregam e substituem o skeleton), garantindo que o scroll so e restaurado quando ha conteudo suficiente na pagina.

---

## Resumo

| Arquivo | O que muda |
|---------|-----------|
| `src/components/ScrollToTop.tsx` | Substituir timeouts fixos por MutationObserver que aguarda o conteudo carregar antes de restaurar scroll |
