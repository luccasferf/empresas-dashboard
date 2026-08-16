"""
Configuração central do projeto.
Lê as credenciais do Databricks a partir do arquivo .env (nunca hardcode aqui).
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABRICKS_SERVER_HOSTNAME = os.getenv("DATABRICKS_SERVER_HOSTNAME")
DATABRICKS_HTTP_PATH = os.getenv("DATABRICKS_HTTP_PATH")
DATABRICKS_TOKEN = os.getenv("DATABRICKS_TOKEN")
DATABRICKS_TABLE = os.getenv("DATABRICKS_TABLE")

# Onde o banco local (o "import") fica gravado depois do sync.py
LOCAL_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "dados_locais.duckdb")

_OBRIGATORIAS = {
    "DATABRICKS_SERVER_HOSTNAME": DATABRICKS_SERVER_HOSTNAME,
    "DATABRICKS_HTTP_PATH": DATABRICKS_HTTP_PATH,
    "DATABRICKS_TOKEN": DATABRICKS_TOKEN,
    "DATABRICKS_TABLE": DATABRICKS_TABLE,
}


def validar_credenciais():
    """Levanta um erro claro se alguma variável do .env estiver faltando."""
    faltando = [nome for nome, valor in _OBRIGATORIAS.items() if not valor]
    if faltando:
        raise RuntimeError(
            "Faltam variáveis no .env: "
            + ", ".join(faltando)
            + ". Copie .env.example para .env e preencha com suas credenciais do Databricks."
        )
