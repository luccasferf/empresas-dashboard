"""
Conexão com o banco local (o resultado do sync.py).
Cacheada por processo via st.cache_resource — abre uma vez só,
igual um dataset publicado fica residente no serviço do Power BI.
"""
import os

import duckdb
import streamlit as st

from config import LOCAL_DB_PATH


@st.cache_resource
def get_connection():
    if not os.path.exists(LOCAL_DB_PATH):
        st.error(
            f"Banco local não encontrado em `{LOCAL_DB_PATH}`.\n\n"
            "Rode `python sync.py` no terminal antes de abrir o app."
        )
        st.stop()
    return duckdb.connect(LOCAL_DB_PATH, read_only=True)
