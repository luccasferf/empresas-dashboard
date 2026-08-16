"""
Cache em memória por processo, papel equivalente ao `st.cache_data` do app
Streamlit: os dados locais só mudam quando alguém roda `sync.py` e reinicia
o servidor, então cachear pela vida do processo é seguro e elimina
reprocessar a mesma agregação em requisições repetidas.

O primeiro argumento de toda função decorada é `con` — um cursor NOVO a cada
requisição (ver db.py, necessário pra segurança entre threads), então não
pode entrar na chave do cache (senão o cache nunca acerta). A chave usa só o
resto dos argumentos — `Filtros` é um dataclass frozen (tuplas, não listas),
então já é hashable.
"""
from functools import wraps


def cached(fn):
    store: dict = {}

    @wraps(fn)
    def inner(con, *args, **kwargs):
        key = (args, tuple(sorted(kwargs.items())))
        if key not in store:
            store[key] = fn(con, *args, **kwargs)
        return store[key]

    return inner
