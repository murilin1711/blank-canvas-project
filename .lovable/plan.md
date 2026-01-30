
# Plano: Novo Rodapé Estilo Osklen Adaptado

## Resumo
Redesenhar o rodapé principal (`footer.tsx`) seguindo o layout das imagens de referência, com seções organizadas em colunas e uma barra inferior com informações da empresa.

## Estrutura do Novo Rodapé

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [Logo Goiás Minas]                                                     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Políticas           Minha conta        Fale conosco    Redes sociais   │
│  ─────────           ───────────        ────────────    ──────────────  │
│  Prazo de entrega    Meus pedidos       Central de      Instagram       │
│  Trocas & Devoluções Meus dados         atendimento     Facebook        │
│  Formas de pagamento Meu perfil         Fale conosco    Email           │
│  Termos e condições                                                     │
│  Privacidade &                                                          │
│  Segurança                                                              │
│  Ética e                                                                │
│  Sustentabilidade                                                       │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Goiás Minas Uniformes Ind. e Com.de Unif. Esc. e Emp. S/A              │
│  CNPJ 01.184.449/0001-10 Rua Guimarães Natal, 50. Setor Central.        │
│  GO Brasil. CEP 75040030.                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Alterações a Implementar

### 1. Adicionar Nova Estrutura de Colunas
Criar um grid responsivo com 4 colunas (2 em mobile) contendo:

**Coluna 1 - Políticas:**
- Prazo de entrega
- Trocas & Devoluções  
- Formas de pagamento
- Termos e condições
- Privacidade & Segurança
- Ética e Sustentabilidade

**Coluna 2 - Minha conta:**
- Meus pedidos (`/meus-pedidos`)
- Meus dados
- Meu perfil

**Coluna 3 - Fale conosco:**
- Central de atendimento
- Fale conosco

**Coluna 4 - Redes sociais:**
- Instagram (link: https://www.instagram.com/goiasminas/)
- Facebook (link: https://www.facebook.com/p/Goiás-Minas-Uniformes-100075856991982/)
- Email (link: mailto:suporte@goiasminas.com)

### 2. Barra Inferior
Adicionar uma barra com fundo levemente mais escuro contendo:
> "Goiás Minas Uniformes Ind. e Com.de Unif. Esc. e Emp. S/A CNPJ 01.184.449/0001-10 Rua Guimarães Natal, 50. Setor Central. GO Brasil. CEP 75040030."

### 3. Manter Elementos Existentes
- Logo Goiás Minas no topo
- Cor de fundo `#f8f8f8`
- Tipografia consistente com o resto do site

## Detalhes Técnicos

### Links das Redes Sociais
- **Instagram:** `https://www.instagram.com/goiasminas/`
- **Facebook:** `https://www.facebook.com/p/Goiás-Minas-Uniformes-100075856991982/`
- **Email:** `mailto:suporte@goiasminas.com`

### Layout Responsivo
- **Desktop (lg+):** Grid de 4 colunas
- **Tablet (md):** Grid de 2 colunas
- **Mobile:** Stack vertical

### Arquivo a Modificar
- `src/components/sections/footer.tsx`

### Estilização
- Títulos das seções: Texto preto, negrito, tamanho pequeno
- Links: Texto cinza escuro, fundo cinza claro (pill/badge), hover sutil
- Barra inferior: Fundo levemente mais escuro, texto cinza centralizado
