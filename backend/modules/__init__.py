"""Módulos de Perícia, Investigação e Experiência Digital da Elite."""
import logging

logger = logging.getLogger(__name__)


def _register_site_cms() -> None:
    """Registra o CMS quando o pacote é carregado pelo servidor principal.

    O servidor cria ``app`` e ``db`` antes de importar os módulos forenses, por
    isso o registro por pacote evita alterar o grande arquivo legado enquanto a
    arquitetura é modularizada gradualmente.
    """
    try:
        from server import app
        from .site_cms import router as site_cms_router

        already_registered = any(
            getattr(route, "path", "").startswith("/api/site")
            for route in app.routes
        )
        if not already_registered:
            app.include_router(site_cms_router)
            logger.info("✅ Elite Site CMS registrado")
    except Exception as exc:  # pragma: no cover - proteção durante imports parciais
        logger.warning("⚠️ Elite Site CMS não pôde ser registrado: %s", exc)


_register_site_cms()
