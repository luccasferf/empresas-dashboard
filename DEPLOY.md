# Deploy — DataNimbus (grátis)

Frontend no Vercel, backend no Render. O banco local (`data/dados_locais.duckdb`,
~640MB) não vai pro git nem pra imagem Docker — fica como anexo de uma
GitHub Release e é baixado pelo container no start (ver
`backend/scripts/download_db.py`).

Tudo que pode ser preparado em arquivo já está pronto (`render.yaml`,
`backend/Dockerfile`). Os passos abaixo são os que só dá pra fazer logado nos
sites (GitHub/Render/Vercel) — leva uns 10-15 minutos.

## 1. Subir o código pro GitHub

O repositório já foi inicializado e commitado localmente. Só falta criar o
repo remoto e empurrar:

1. Em github.com, crie um repositório novo (público, sem README/gitignore —
   já temos os dois). Copie a URL dele.
2. No terminal, na raiz do projeto:
   ```bash
   git remote add origin https://github.com/<seu-usuario>/<seu-repo>.git
   git branch -M main
   git push -u origin main
   ```

## 2. Publicar o banco como asset de Release

1. No repositório no GitHub: **Releases** → **Create a new release**.
2. Tag: `data-v1` (ou qualquer nome). Título: o que quiser.
3. Arraste `data/dados_locais.duckdb` pra área "Attach binaries" (643MB,
   dentro do limite de 2GB por asset do GitHub).
4. **Publish release**.
5. Clique com o botão direito no nome do arquivo anexado → "Copy link" (ou
   abra e copie a URL da barra de endereços). Vai ser algo como:
   ```
   https://github.com/<seu-usuario>/<seu-repo>/releases/download/data-v1/dados_locais.duckdb
   ```
   Guarde essa URL — é o `DUCKDB_URL` do passo 3.

## 3. Backend no Render

1. Em render.com: **New** → **Blueprint** → conecte o repositório do GitHub.
2. O Render lê o `render.yaml` da raiz e propõe criar o serviço
   `datanimbus-api` (Docker, plano free). Confirme.
3. Em **Environment**, preencha:
   - `DUCKDB_URL` = a URL copiada no passo 2
   - `CORS_ORIGINS` = `*` por enquanto (ajusta no passo 5)
4. Deploy. A primeira subida demora um pouco mais (baixa o banco, ~640MB).
5. Quando terminar, copie a URL pública do serviço, algo como
   `https://datanimbus-api.onrender.com`. Teste em `.../health` — deve
   responder `{"status":"ok"}`.

**Nota sobre o plano free do Render:** o serviço "dorme" depois de ~15min
sem tráfego. A primeira visita depois disso demora uns 30-60s pra acordar
(reboot + baixar o banco de novo, já que o disco free não é persistente).
Pra sua publicação no LinkedIn, vale abrir a URL uma vez antes de postar pra
"acordar" o serviço — ou configurar um ping gratuito (ex: UptimeRobot,
batendo em `/health` a cada 10min) pra mantê-lo sempre ativo.

## 4. Frontend no Vercel

1. Em vercel.com: **Add New** → **Project** → importe o mesmo repositório.
2. Em **Root Directory**, selecione `frontend`. O Vercel detecta Vite
   automaticamente (build `npm run build`, output `dist`).
3. Em **Environment Variables**, adicione:
   - `VITE_API_BASE_URL` = a URL do Render do passo 3 (sem barra no final)
4. Deploy. Copie a URL pública, algo como `https://datanimbus.vercel.app`
   (dá pra trocar por um domínio próprio depois, em Project Settings).

## 5. Fechar o CORS

Volte no Render → o serviço `datanimbus-api` → **Environment** → edite
`CORS_ORIGINS` pra URL exata do Vercel (ex: `https://datanimbus.vercel.app`,
sem barra no final). Salvar já reinicia o serviço.

## 6. Testar

Abra a URL do Vercel, navegue pelas views, abra o DevTools → Network e
confirme que as chamadas pra `/api/...` retornam 200 (sem erro de CORS).
Pronto — é essa URL que entra no post do LinkedIn.

---

### Atualizando os dados depois

Quando rodar `sync.py` de novo localmente pra atualizar o banco, repita o
passo 2 (nova Release ou substituir o asset), atualize `DUCKDB_URL` no
Render se a URL mudar, e faça um **Manual Deploy** no serviço pra ele baixar
a versão nova.
