
# Plano: Adicionar Todos os Produtos do Colégio Militar

## Resumo
Inserir todos os produtos listados no documento LISTA_PRODUTOS.docx na tabela `products` do banco de dados, organizados nas categorias e ordem especificadas pelo usuário.

## Produtos Identificados no Documento (35 produtos)

### Categoria: Roupa (ordem: 1-5)
1. **Calça Tectel Marrom padrão CEPMG Unissex (Ensino Fundamental)** - R$ 0,00
2. **Calça Tectel Marrom padrão CEPMG Unissex (Ensino Médio)** - R$ 0,00
3. **Camiseta Bege Manga Curta padrão CEPMG Unissex** - R$ 0,00
4. **Agasalho Tectel Marrom padrão CEPMG Unissex** - R$ 0,00
5. **Agasalho Gabardine Marrom padrão CEPMG** - R$ 0,00

### Categoria: Farda (ordem: 6-9)
6. **Calça Social Marrom padrão CEPMG** - R$ 0,00
7. **Saia Marrom padrão CEPMG** - R$ 0,00
8. **Camisa Social Bege padrão CEPMG Unissex** - R$ 0,00
9. **Camisa Branca Manga Longa Masculina** - R$ 0,00
10. **Camisete Branco Manga Longa Feminino** - R$ 0,00

### Categoria: Túnicas (ordem: 11-14)
11. **Túnica Branca Masculina 3ª série** - R$ 0,00
12. **Túnica Branca Feminina 3ª série** - R$ 0,00
13. **Túnica Marrom Masculina** - R$ 0,00
14. **Túnica Marrom Feminina** - R$ 0,00

### Categoria: Calçados (ordem: 15-22) - Tênis primeiro, depois Sapatos
15. **Tênis Unissex Olympikus Eros** - R$ 0,00
16. **Tênis Unissex Olympikus Marte** - R$ 0,00
17. **Tênis Unissex Randal** - R$ 0,00
18. **Tênis Unissex Lynd** - R$ 0,00
19. **Sapato Social Saad Masculino** - R$ 0,00
20. **Sapato Social Calprado Masculino** - R$ 0,00
21. **Sapato Social BootWear Masculino** - R$ 0,00
22. **Sapato Social Modare Feminino** - R$ 0,00

### Categoria: Acessórios (ordem: 23-35) - Luvas, Bibico, Boina, Plaqueta, Cinto primeiro
23. **Luva de Ombro p/ Camisa Social** - R$ 0,00
24. **Luva de Ombro p/ Agasalho Gabardine e Túnica Marrom** - R$ 0,00
25. **Luva de Ombro p/ Túnica Branca** - R$ 0,00
26. **Bibico Marrom Padrão CEPMG Unissex** - R$ 0,00
27. **Boina Pralana Marrom Unissex** - R$ 0,00
28. **Plaqueta de Identificação Unissex** - R$ 0,00
29. **Cinto com Fivela padrão CEPMG** - R$ 0,00
30. **Distintivo de Metal para Boina** - R$ 0,00
31. **Gravata Marrom Masculina** - R$ 0,00
32. **Gravata Marrom Feminina** - R$ 0,00
33. **Meia Branca Selene Esportiva Unissex** - R$ 0,00
34. **Meia Social Preta Masculina** - R$ 0,00

## Dados a Inserir para Cada Produto

| Campo | Valor |
|-------|-------|
| `name` | Nome do produto conforme documento |
| `description` | Descrição do documento |
| `price` | 0 (para editar depois) |
| `school_slug` | `colegio-militar` |
| `category` | Roupa, Farda, Túnicas, Calçados ou Acessórios |
| `display_order` | Número sequencial conforme ordem definida |
| `is_active` | `true` |
| `sizes` | `{}` (array vazio - sem tamanhos por enquanto) |
| `images` | `{}` (array vazio - sem imagens por enquanto) |
| `variations` | `[]` (vazio) |

## Implementação

### Passo 1: Inserir Produtos via SQL
Executar um INSERT com todos os 34 produtos na ordem especificada:
- Roupa (1-5)
- Farda (6-10)  
- Túnicas (11-14)
- Calçados - Tênis primeiro (15-18), Sapatos depois (19-22)
- Acessórios - Luvas (23-25), Bibico (26), Boina (27), Plaqueta (28), Cinto (29), depois restante (30-34)

### Observações Importantes
- Preços definidos como **R$ 0,00** para edição posterior no painel admin
- Tamanhos deixados **vazios** conforme solicitado
- Imagens deixadas **vazias** para upload posterior
- Descrições completas extraídas do documento
- `display_order` garante a ordem correta de exibição no site e no admin
