"""
Baixa o .duckdb pra dentro do container no start, se ele ainda não existir.

O arquivo (~640MB) não vai pro git (ver .gitignore) nem pra imagem Docker —
em vez disso fica anexado como asset de uma GitHub Release, e a URL direta
desse asset entra como env var DUCKDB_URL no serviço (Render/Fly/etc). Isso
evita Git LFS e mantém a imagem Docker leve; o custo é baixar de novo a cada
cold start em planos free sem disco persistente.

Não faz nada se DUCKDB_PATH já existir (redeploys/instâncias com volume
persistente) ou se DUCKDB_URL não estiver configurada (dev local, onde o
arquivo já foi gerado por sync.py).
"""
import os
import sys
import urllib.request

DB_PATH = os.getenv("DUCKDB_PATH", "")
DB_URL = os.getenv("DUCKDB_URL", "")


def main() -> None:
    if not DB_PATH:
        print("DUCKDB_PATH não definida — nada a fazer (uso local).")
        return
    if os.path.exists(DB_PATH):
        print(f"{DB_PATH} já existe, pulando download.")
        return
    if not DB_URL:
        print(f"AVISO: {DB_PATH} não existe e DUCKDB_URL não foi configurada.", file=sys.stderr)
        return

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    print(f"Baixando banco de {DB_URL} para {DB_PATH}...")
    tmp_path = DB_PATH + ".tmp"
    with urllib.request.urlopen(DB_URL) as resp, open(tmp_path, "wb") as f:
        total = int(resp.headers.get("Content-Length", 0))
        lido = 0
        while chunk := resp.read(1024 * 1024):
            f.write(chunk)
            lido += len(chunk)
            if total:
                print(f"  {lido / 1_048_576:.0f}MB / {total / 1_048_576:.0f}MB", end="\r")
    os.rename(tmp_path, DB_PATH)
    print(f"\nDownload concluído: {DB_PATH}")


if __name__ == "__main__":
    main()
