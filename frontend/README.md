# DataNimbus — Frontend

React + TypeScript + Vite. Consome a API em `../backend` (nunca lê
`.duckdb` diretamente — ver `src/lib/api.ts`).

## Rodar localmente

```bash
npm install
npm run dev       # http://localhost:5173, lê VITE_API_BASE_URL de .env.development
```

Precisa do backend rodando em paralelo (`../backend`, porta 8000 por padrão).

## Build de produção

```bash
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serve o build de dist/ localmente, pra conferir antes de publicar
```

Antes de publicar, crie `.env.production` com `VITE_API_BASE_URL` apontando
pro domínio real da API.

## Stack

Tailwind CSS (design tokens em `src/index.css`, portados 1:1 da paleta do app
Streamlit) · Radix UI (primitivos acessíveis em `src/components/ui`) ·
Recharts (gráficos) · react-simple-maps + d3-geo (mapa coroplético,
lazy-loaded) · TanStack Query (cache/estado de rede) · motion (microinterações).

## Estrutura

```
src/
├── components/
│   ├── ui/          # primitivos (button, select, tooltip, slider…)
│   ├── layout/       # header, footer, theme toggle, section header
│   └── dashboard/     # hero KPI, filtros, mapa, gráficos, about
├── hooks/            # useFilters, useApiQueries (TanStack Query)
├── lib/              # api client, paleta, tema, formatação, escalas de cor
└── types/            # espelham os schemas Pydantic do backend
```
