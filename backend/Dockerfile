FROM python:3.11-slim

WORKDIR /srv

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY backend/scripts ./scripts

# O banco local (~640MB) não vai na imagem nem no git — é baixado no start a
# partir de um asset de GitHub Release (ver scripts/download_db.py). DUCKDB_URL
# é setada no ambiente do serviço (Render/Fly/etc); DUCKDB_PATH tem que bater
# com o caminho real dentro do container (não com a estrutura do repo local).
ENV DUCKDB_PATH=/srv/data/dados_locais.duckdb
ENV CORS_ORIGINS=""
EXPOSE 8000

CMD ["sh", "-c", "python scripts/download_db.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
