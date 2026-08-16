# DataNimbus — Cenário Empresarial Brasileiro

Plataforma de dados sobre empresas brasileiras a partir de dados públicos da
Receita Federal (~22,1M linhas pré-agregadas, sincronizadas do Databricks para
um arquivo DuckDB local — "modo import", sem consultar o Databricks a cada
interação do usuário).

O projeto tem **dois frontends** sobre a mesma base local (`data/dados_locais.duckdb`),
gerada uma vez por `sync.py`:

- **`app.py`** — o dashboard original em Streamlit, self-contained (lê o
  `.duckdb` direto no processo).
- **`backend/` + `frontend/`** — a versão de produção: uma API FastAPI fina
  sobre o mesmo `.duckdb` e um frontend React + TypeScript, pensados pra
  publicação pública. Ver `backend/README.md` e `frontend/README.md`.

Nenhum dos dois altera dado, schema ou regra de negócio — só apresentam a
mesma base de formas diferentes.

## Estrutura

```
empresas-dashboard/
├── .env.example          # copie para .env e preencha suas credenciais do Databricks
├── config.py              # lê e valida as variáveis de ambiente
├── sync.py                 # PASSO 1: puxa os dados do Databricks -> data/dados_locais.duckdb
├── app.py                   # dashboard Streamlit (lê só do arquivo local)
├── utils/                    # queries, tema, componentes do app Streamlit
├── data/
│   ├── dados_locais.duckdb     # gerado pelo sync.py (não vai pro git)
│   ├── br_uf.geojson             # malha IBGE por UF
│   ├── br_municipios.geojson     # malha IBGE por município
│   └── municipios_crosswalk.json # nome (Receita) -> código IBGE
├── backend/                   # API FastAPI sobre o mesmo .duckdb
└── frontend/                  # React + TypeScript + Vite
```

## Como rodar (dados)

1. Ambiente virtual + dependências:
   ```
   python -m venv .venv
   source .venv/bin/activate      # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Copie `.env.example` para `.env` e preencha com suas credenciais do
   Databricks (hostname do warehouse, HTTP path, token e a tabela de origem).

3. Importe os dados (roda uma vez, ou sempre que quiser atualizar):
   ```
   python sync.py
   ```
   Baixa a tabela inteira (~22M linhas) do Databricks e grava em
   `data/dados_locais.duckdb`. Leva alguns minutos na primeira vez.

## Como rodar cada frontend

- **Streamlit**: `streamlit run app.py` (depois do passo 3 acima).
- **React + API**: ver `backend/README.md` (sobe a API) e `frontend/README.md`
  (sobe o React) — precisam rodar juntos.

## Nota sobre o sync.py

Se a conexão via `databricks-sql-connector` falhar por causa de alguma
restrição do Databricks Free Edition, o plano B é exportar a tabela como
Parquet direto de um notebook Databricks
(`spark.table(...).coalesce(1).write.parquet(caminho)`), baixar o arquivo
e trocar a lógica do `sync.py` para ler com `duckdb.read_parquet()` no
lugar do `databricks-sql-connector`.
