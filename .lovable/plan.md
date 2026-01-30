

# Plano: Correções na Interface de Reordenação e Performance

## Problemas Identificados

### 1. Texto Incorreto
A mensagem ainda diz "Arraste ou **digite o número** para reordenar" mas a funcionalidade de digitar foi removida.

### 2. Botão "Atualizar" Desnecessário  
Após arrastar e soltar, aparece a mensagem de sucesso mas o usuário precisa clicar em "Atualizar" para ver a nova ordem. Isso não deveria acontecer - a atualização já está sendo feita localmente de forma otimista.

### 3. Demora no Carregamento Inicial
Quando entra no admin, carrega TODAS as seções (bolsa, pedidos, produtos, feedbacks, clientes) ao mesmo tempo, mesmo que o usuário só vá ver uma aba.

---

## Solução Proposta

### Parte 1: Corrigir Texto da Instrução

Alterar de:
```text
Arraste ou digite o número para reordenar • Salva automaticamente
```

Para:
```text
Arraste para reordenar • Salva automaticamente
```

### Parte 2: Tornar Reordenação Verdadeiramente Instantânea

O código atual já faz atualização local otimista (linhas 667-672), mas verificarei se há algum problema na ordenação do array após o `setProducts`.

**Possível causa**: Os produtos estão sendo ordenados por `display_order` no render, mas após a atualização local, a lista pode não estar re-renderizando na ordem correta.

**Solução**: Garantir que a lista de produtos filtrada pela escola seja ordenada por `display_order` antes de renderizar.

### Parte 3: Carregamento Sob Demanda por Aba

Ao invés de carregar tudo no `loadData()`, carregar apenas a aba ativa:

- Quando muda de aba, verifica se os dados já foram carregados
- Se não, carrega apenas aquela seção
- Mantém botão "Atualizar" mas ele só recarrega a seção atual (não tudo)

---

## Mudanças no Código

### Arquivo: `src/app/admin/page.tsx`

**1. Corrigir texto (linha 1231):**
```text
// De:
Arraste ou digite o número para reordenar • Salva automaticamente

// Para:
Arraste para reordenar • Salva automaticamente
```

**2. Ordenar produtos por display_order no render (linha 1253):**
```text
// Adicionar sort por display_order
{products
  .filter(p => p.school_slug === activeSchool)
  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
  .map((product, index) => (
```

**3. Adicionar estado para controlar quais seções já foram carregadas:**
```text
const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());
```

**4. Modificar loadData para carregar apenas seção ativa:**
```text
// Ao entrar no admin, carregar apenas a aba ativa (pedidos por padrão)
// Quando trocar de aba, carregar sob demanda
```

**5. Modificar botão Atualizar para recarregar só a seção atual:**
```text
// Ao invés de loadData(), usar reloadSection(activeTab)
```

---

## Resumo de Alterações

| Linha | Alteração |
|-------|-----------|
| 1231 | Remover "ou digite o número" do texto |
| 1253 | Adicionar `.sort()` por `display_order` |
| 982-988 | Botão Atualizar → recarrega só seção atual |
| 338-360 | loadData → carregar só aba ativa inicialmente |
| Novo | useEffect para carregar aba quando mudar |

---

## Resultado Esperado

- **Carregamento inicial**: Muito mais rápido (só carrega "Pedidos")
- **Troca de abas**: Carrega a seção sob demanda (com skeleton)
- **Reordenação**: Instantânea, sem precisar clicar em Atualizar
- **Animação**: Produtos deslizam suavemente para nova posição

