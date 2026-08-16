"""
Script de sincronização (o "import mode").

Roda SEPARADO do app Streamlit. Conecta no SQL Warehouse do Databricks,
baixa a tabela inteira uma vez e grava em um arquivo DuckDB local.
A partir daí, o app nunca mais precisa falar com o Databricks em tempo real.

Uso:
    python sync.py

Rode de novo sempre que quiser atualizar os dados locais (é seguro reexecutar,
a tabela local é substituída por completo a cada rodada).
"""
import os
import time

import duckdb
from databricks import sql

from config import (
    DATABRICKS_HTTP_PATH,
    DATABRICKS_SERVER_HOSTNAME,
    DATABRICKS_TABLE,
    DATABRICKS_TOKEN,
    LOCAL_DB_PATH,
    validar_credenciais,
)


def sync():
    validar_credenciais()
    os.makedirs(os.path.dirname(LOCAL_DB_PATH), exist_ok=True)

    print(f"Conectando ao warehouse Databricks ({DATABRICKS_SERVER_HOSTNAME})...")
    inicio = time.time()

    connection = sql.connect(
        server_hostname=DATABRICKS_SERVER_HOSTNAME,
        http_path=DATABRICKS_HTTP_PATH,
        access_token=DATABRICKS_TOKEN,
    )
    cursor = connection.cursor()

    print(f"Executando SELECT * FROM {DATABRICKS_TABLE} ...")
    cursor.execute(f"SELECT * FROM {DATABRICKS_TABLE}")

    print("Baixando resultado como Arrow (pode levar alguns minutos para ~22M linhas)...")
    arrow_table = cursor.fetchall_arrow()

    cursor.close()
    connection.close()

    print(f"Recebidas {arrow_table.num_rows:,} linhas. Gravando localmente em {LOCAL_DB_PATH}...")

    con = duckdb.connect(LOCAL_DB_PATH)
    # DuckDB consegue ler a variável Python 'arrow_table' diretamente no SQL
    con.execute("CREATE OR REPLACE TABLE empresas AS SELECT * FROM arrow_table")
    total = con.execute("SELECT COUNT(*) FROM empresas").fetchone()[0]
    con.close()

    duracao = time.time() - inicio
    print(f"OK — {total:,} linhas gravadas em {LOCAL_DB_PATH} ({duracao:.1f}s)")


if __name__ == "__main__":
    try:
        sync()
    except Exception as e:
        print(f"\nFalha na sincronização: {e}")
        print(
            "\nSe o erro for de autenticação/conexão, confira:\n"
            "  1. DATABRICKS_HTTP_PATH está correto (SQL Warehouses > seu warehouse > Connection details)\n"
            "  2. O warehouse está ligado (Databricks desliga por inatividade)\n"
            "  3. O token não expirou\n"
            "Se nada disso resolver, o plano B é exportar a tabela como Parquet direto de um\n"
            "notebook Databricks e apontar duckdb.read_parquet() pro arquivo baixado localmente."
        )
        raise
