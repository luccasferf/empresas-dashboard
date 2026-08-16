import { useCallback, useEffect, useState } from "react";
import { isViewId, type ViewId } from "@/lib/views";

function lerHash(): ViewId {
  const hash = window.location.hash.replace("#", "");
  return isViewId(hash) ? hash : "overview";
}

/** Aba ativa da navegação principal, sincronizada com o hash da URL — permite
 * recarregar a página ou compartilhar um link direto pra uma view sem precisar
 * de um router. */
export function useActiveView() {
  const [view, setViewState] = useState<ViewId>(lerHash);

  useEffect(() => {
    function onHashChange() {
      setViewState(lerHash());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setView = useCallback((v: ViewId) => {
    setViewState(v);
    const url = `${window.location.pathname}${window.location.search}#${v}`;
    window.history.replaceState(null, "", url);
  }, []);

  return { view, setView };
}
