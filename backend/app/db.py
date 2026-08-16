"""
Conexão com o banco local (o resultado do sync.py na raiz do projeto).

FastAPI roda cada endpoint síncrono (`def`, não `async def`) numa threadpool —
duas requisições simultâneas (ex: o frontend disparando KPIs, mapa e gráficos
juntos a cada troca de filtro) caem em threads diferentes. Uma única conexão
DuckDB compartilhada entre threads sem coordenação corrompe resultados sob
concorrência (silenciosamente — sem exceção, só dado errado). A própria doc do
DuckDB recomenda `connection.cursor()` por thread para uso concorrente; aqui
isso vira "um cursor novo por requisição" via dependency do FastAPI, todos
compartilhando a mesma conexão de base (aberta uma vez, read-only).
"""
import os
from functools import lru_cache

import duckdb

_DEFAULT_DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data",
    "dados_locais.duckdb",
)
# Em produção (Docker) a estrutura de pastas não espelha o repo local — ver
# backend/Dockerfile e backend/scripts/download_db.py, que setam DUCKDB_PATH
# explicitamente em vez de depender dessa heurística de caminho relativo.
LOCAL_DB_PATH = os.getenv("DUCKDB_PATH", _DEFAULT_DB_PATH)


@lru_cache(maxsize=1)
def _base_connection() -> duckdb.DuckDBPyConnection:
    if not os.path.exists(LOCAL_DB_PATH):
        raise RuntimeError(
            f"Banco local não encontrado em {LOCAL_DB_PATH}. Rode `python sync.py` na raiz do "
            "projeto antes de subir a API."
        )
    return duckdb.connect(LOCAL_DB_PATH, read_only=True)


def get_connection() -> duckdb.DuckDBPyConnection:
    """Cursor novo por chamada — seguro para uso concorrente entre threads."""
    return _base_connection().cursor()


def db_last_modified() -> float:
    """mtime real do arquivo .duckdb — usado como 'última atualização dos dados'."""
    return os.path.getmtime(LOCAL_DB_PATH)
