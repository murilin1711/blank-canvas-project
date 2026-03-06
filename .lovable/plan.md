
# Corrigir Deploy na Vercel

## Diagnostico

O erro de JSX (`Expected corresponding JSX closing tag for <main>`) ja foi corrigido na ultima edicao. A estrutura do `ProductPage.tsx` esta balanceada.

O problema do deploy na Vercel pode ter duas causas:

1. **Build antigo**: A Vercel fez o build antes da correcao ser aplicada. Um redeploy resolve.
2. **Deteccao errada de framework**: O `tsconfig.json` tem referencias a Next.js (`plugins: [{name: "next"}]`, `include: ["next-env.d.ts"]`) mas o projeto usa Vite. Isso pode confundir a Vercel.

## Plano

### 1. Limpar tsconfig.json de referencias Next.js

Remover o plugin Next.js e a referencia a `next-env.d.ts` do `tsconfig.json`, ja que este projeto usa Vite:

**Antes:**
```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"]
}
```

**Depois:**
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "plugins": []
  },
  "include": ["src", "**/*.ts", "**/*.tsx", "**/*.mts"]
}
```

Alteracoes:
- Remover `"plugins": [{"name": "next"}]`
- Remover `"next-env.d.ts"`, `".next/types/**/*.ts"`, `".next/dev/types/**/*.ts"` do include
- Mudar `jsx` de `"preserve"` para `"react-jsx"` (compativel com Vite + SWC)

### 2. Verificar se nao ha outros erros de build

O arquivo `ProductPage.tsx` ja esta com a estrutura JSX correta apos a ultima correcao.

| Arquivo | O que muda |
|---------|-----------|
| `tsconfig.json` | Remover referencias Next.js, ajustar jsx para react-jsx |
