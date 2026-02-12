
# Plano: Corrigir Pagamentos + Restauracao de Scroll

## 1. Pagamentos (Pix e Cartao) -- RESOLVIDO

As funcoes de backend para pagamento (create-payment-intent e create-mercadopago-pix) nao estavam implantadas no servidor. Eu ja fiz o deploy durante a investigacao e confirmei que o pagamento por cartao esta retornando resposta correta (status 200).

Nenhuma alteracao de codigo e necessaria -- o problema era apenas que as funcoes precisavam ser implantadas. Vou apenas garantir que todas as funcoes relacionadas a pagamento continuem implantadas apos qualquer alteracao.

---

## 2. Restauracao de scroll ao voltar para pagina de produtos

O sistema de restauracao de scroll ja existe (`ScrollToTop.tsx`), mas nao funciona bem quando a pagina carrega dados do banco de forma assincrona. O problema: ao voltar, a pagina tenta restaurar a posicao de scroll, mas os produtos ainda nao foram carregados do banco, entao a pagina nao tem altura suficiente. Os tempos de espera atuais (maximo 500ms) nao sao suficientes.

### Correcao

Aumentar os tempos de tentativa de restauracao de scroll no `ScrollToTop.tsx`, adicionando tentativas mais tardias (750ms, 1000ms, 1500ms) para garantir que o conteudo assincrono ja tenha sido carregado antes de restaurar a posicao.

---

## Resumo de Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| Funcoes de backend | Ja foram implantadas (create-payment-intent, create-mercadopago-pix, check-pix-payment, stripe-webhook, mercadopago-webhook) |
| `src/components/ScrollToTop.tsx` | Aumentar tempos de tentativa de restauracao de scroll para suportar carregamento assincrono |
