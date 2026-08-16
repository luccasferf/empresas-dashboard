# DataNimbus API

Casca HTTP fina em FastAPI sobre `data/dados_locais.duckdb` (gerado por
`sync.py` na raiz do projeto). Mesma lógica de negócio de `utils/queries.py`
(o app Streamlit) — WHERE, filtros e métricas idênticos, só expostos como
JSON em vez de renderizados em Python.

## Rodar localmente

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# a raiz do projeto precisa já ter data/dados_locais.duckdb (rode
# `python sync.py` na raiz antes, se ainda não tiver)

CORS_ORIGINS="http://localhost:5173" uvicorn app.main:app --reload --port 8000
```

Endpoints em `http://localhost:8000/docs` (Swagger gerado automaticamente
pelo FastAPI).

## Variáveis de ambiente

- `CORS_ORIGINS` — lista separada por vírgula das origens do frontend
  autorizadas (dev: `http://localhost:5173`; produção: o domínio publicado).

## Concorrência

Cada requisição abre seu próprio cursor DuckDB (`db.py::get_connection`) em
cima de uma única conexão de base — necessário porque FastAPI roda rotas
síncronas numa threadpool, e uma conexão DuckDB compartilhada entre threads
sem isso corrompe resultados sob carga concorrente. O cache em memória
(`cache.py`) é por chave de filtros, não por conexão.

## Deploy

`Dockerfile` incluso. Ponto de atenção real: `data/dados_locais.duckdb` tem
[algumas centenas de MB] e não vai pro git — no ambiente de produção ele
precisa estar disponível via volume persistente ou copiado no build da
imagem (fora do fluxo automático deste repo).
