"""Elite Intelligence 360 - CMS, portal editorial e governança do site público.

O módulo concentra conteúdo institucional, páginas, navegação, mídia, SEO,
revisões e auditoria. Conteúdo sensível de clientes e evidências não deve ser
armazenado neste CMS; permanece nos módulos protegidos do Elite Nexus.
"""
from __future__ import annotations

import hashlib
import logging
import os
import re
import unicodedata
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict, Field

from security import get_current_user
from server import db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/site", tags=["Elite Site CMS"])

CMS_ADMIN_ROLES = {"super_admin", "administrator", "editor"}
SITE_UPLOAD_DIR = Path(os.environ.get("SITE_UPLOAD_DIR", "/app/backend/uploads/site"))
SITE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_UPLOAD_BYTES = int(os.environ.get("SITE_MAX_UPLOAD_BYTES", 25 * 1024 * 1024))
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "video/mp4",
    "video/webm",
}


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", normalized).strip("-").lower()
    return normalized or str(uuid.uuid4())[:8]


def serialize_document(document: Optional[dict]) -> Optional[dict]:
    if not document:
        return document
    document.pop("_id", None)
    return document


async def require_site_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if user.get("role") not in CMS_ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Acesso restrito à administração editorial")
    return user


async def audit(user: Dict[str, Any], action: str, resource: str, resource_id: str, details: Optional[dict] = None) -> None:
    await db.site_audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": action,
        "resource": resource,
        "resource_id": resource_id,
        "actor_id": user.get("user_id"),
        "actor_email": user.get("email"),
        "actor_role": user.get("role"),
        "details": details or {},
        "created_at": utcnow(),
    })


async def save_revision(resource: str, resource_id: str, snapshot: dict, user: Dict[str, Any]) -> None:
    await db.site_revisions.insert_one({
        "id": str(uuid.uuid4()),
        "resource": resource,
        "resource_id": resource_id,
        "snapshot": snapshot,
        "actor_email": user.get("email"),
        "created_at": utcnow(),
    })


DEFAULT_SETTINGS = {
    "id": "global",
    "brand": {
        "name": "ELITE",
        "descriptor": "INTELLIGENCE 360",
        "tagline": "Inteligência que decide. Evidência que sustenta. Estratégia que transforma.",
        "signature": "Aqui é Elite. O selo é Black.",
    },
    "contact": {
        "phone": "+55 35 99775-2881",
        "email": "lauracdel@eliteintelligence360.com.br",
        "service_area": "Atendimento nacional",
        "whatsapp": "5535997752881",
    },
    "social": {
        "instagram": "",
        "linkedin": "",
        "youtube": "",
        "podcast": "",
    },
    "seo": {
        "title": "Elite Intelligence 360 | Advocacia, Perícia, Investigação e Gestão",
        "description": "Ecossistema integrado de advocacia especializada, perícia digital, investigação, inteligência, formação e gestão.",
        "keywords": ["advocacia especializada", "perícia digital", "investigação", "evidências digitais", "Elite Academy"],
        "og_image": "",
    },
    "theme": {
        "mode": "black",
        "primary": "#d7aa55",
        "secondary": "#19b6d2",
        "background": "#061421",
        "surface": "#0a1d2d",
    },
    "features": {
        "academy": True,
        "community": True,
        "events": True,
        "newsroom": True,
        "nexus": True,
        "pricing": False,
        "public_search": True,
    },
    "analytics": {"google_tag_id": "", "meta_pixel_id": ""},
    "updated_at": utcnow(),
}

DEFAULT_NAVIGATION = [
    {
        "id": "solutions",
        "label": "Soluções",
        "order": 1,
        "active": True,
        "columns": [
            {
                "title": "Jurídico e probatório",
                "items": [
                    {"label": "Advocacia especializada", "description": "Defesa, risco e estratégia processual", "url": "/solucoes/advocacia"},
                    {"label": "Perícia e prova digital", "description": "Integridade, contexto e cadeia de custódia", "url": "/solucoes/pericia-digital"},
                    {"label": "Investigação defensiva", "description": "Hipóteses, vínculos e cronologias", "url": "/solucoes/investigacao"},
                ],
            },
            {
                "title": "Inteligência aplicada",
                "items": [
                    {"label": "OSINT e inteligência", "description": "Pesquisa responsável e correlação", "url": "/solucoes/inteligencia"},
                    {"label": "Digital e eleitoral", "description": "Prevenção e resposta supervisionada", "url": "/solucoes/eleitoral"},
                    {"label": "Crimes financeiros", "description": "Fluxos, documentos e risco probatório", "url": "/solucoes/financeiro"},
                ],
            },
        ],
    },
    {
        "id": "intelligence",
        "label": "Ferramentas & Inteligência",
        "order": 2,
        "active": True,
        "columns": [
            {
                "title": "Prova digital",
                "items": [
                    {"label": "Auditoria da prova", "description": "Mídia, hash, metadados e logs", "url": "/hub/ferramentas#prova"},
                    {"label": "Análise de transcrições", "description": "Áudio, texto, contexto e divergências", "url": "/hub/ferramentas#transcricoes"},
                    {"label": "Linha do tempo", "description": "Eventos, arquivos e correspondência", "url": "/hub/ferramentas#timeline"},
                ],
            },
            {
                "title": "Pesquisa e decisão",
                "items": [
                    {"label": "Pesquisa jurídica", "description": "Legislação, precedentes e doutrina", "url": "/hub/ferramentas#juridico"},
                    {"label": "Agentes de IA supervisionados", "description": "Apoio à leitura e organização", "url": "/hub/ferramentas#ia"},
                    {"label": "Central de dossiês", "description": "Da informação dispersa ao material decisório", "url": "/hub/ferramentas#dossie"},
                ],
            },
        ],
    },
    {
        "id": "content",
        "label": "Conteúdo & Pesquisa",
        "order": 3,
        "active": True,
        "columns": [
            {
                "title": "Estudo estruturado",
                "items": [
                    {"label": "Trilhas de estudo", "description": "Percursos por tema e nível", "url": "/hub/conteudos#trilhas"},
                    {"label": "Artigos e pareceres", "description": "Leitura técnica e crítica", "url": "/hub/conteudos#artigos"},
                    {"label": "Materiais exclusivos", "description": "Checklists, matrizes e guias", "url": "/hub/conteudos#materiais"},
                ],
            },
            {
                "title": "Atualizações",
                "items": [
                    {"label": "Central de notícias", "description": "Curadoria jurídica e tecnológica", "url": "/hub/conteudos#noticias"},
                    {"label": "Dossiê Elite", "description": "Pesquisa, autoridade e doutrina aplicada", "url": "/hub/conteudos#dossie"},
                    {"label": "Podcasts e entrevistas", "description": "Debates e convidados", "url": "/hub/conteudos#podcasts"},
                ],
            },
        ],
    },
    {
        "id": "academy",
        "label": "Academy & Comunidade",
        "order": 4,
        "active": True,
        "columns": [
            {
                "title": "Formação",
                "items": [
                    {"label": "Cursos e certificações", "description": "Formação técnica e estratégica", "url": "/hub/academy#cursos"},
                    {"label": "Mentorias e laboratórios", "description": "Prática guiada e casos didáticos", "url": "/hub/academy#mentorias"},
                    {"label": "Imersões", "description": "Experiências intensivas", "url": "/hub/academy#imersoes"},
                ],
            },
            {
                "title": "Comunidade",
                "items": [
                    {"label": "Agenda da comunidade", "description": "Aulas, encontros e missões", "url": "/hub/comunidade#agenda"},
                    {"label": "Fóruns e grupos", "description": "Discussões técnicas moderadas", "url": "/hub/comunidade#forum"},
                    {"label": "Especialistas", "description": "Perfis e áreas de atuação", "url": "/hub/comunidade#especialistas"},
                ],
            },
        ],
    },
    {
        "id": "platform",
        "label": "Plataforma",
        "order": 5,
        "active": True,
        "columns": [
            {
                "title": "Meu ambiente",
                "items": [
                    {"label": "Elite Nexus", "description": "Login único e territórios autorizados", "url": "/login"},
                    {"label": "Portal do cliente", "description": "Casos, documentos, agenda e relatórios", "url": "/login"},
                    {"label": "Área do aluno", "description": "Aulas, atividades e certificados", "url": "/login"},
                ],
            },
            {
                "title": "Operação",
                "items": [
                    {"label": "Gestão 360", "description": "CRM, financeiro, fluxos e indicadores", "url": "/login"},
                    {"label": "Central de ajuda", "description": "Guias, suporte e boas práticas", "url": "/hub/plataforma#ajuda"},
                    {"label": "Painel administrativo", "description": "Gestão editorial e operacional", "url": "/admin/site"},
                ],
            },
        ],
    },
    {
        "id": "events",
        "label": "Eventos",
        "order": 6,
        "active": True,
        "columns": [
            {
                "title": "Agenda Elite",
                "items": [
                    {"label": "Próximos eventos", "description": "Aulas, imersões e encontros", "url": "/hub/eventos"},
                    {"label": "Calendário completo", "description": "Programação por data e formato", "url": "/hub/eventos#calendario"},
                    {"label": "Ingressos e inscrições", "description": "Acesso às experiências disponíveis", "url": "/hub/eventos#inscricoes"},
                ],
            }
        ],
    },
]

DEFAULT_HOME = {
    "id": "home",
    "slug": "home",
    "title": "Elite Intelligence 360",
    "status": "published",
    "sections": [
        {
            "id": "hero",
            "type": "hero",
            "eyebrow": "UM ECOSSISTEMA · DIFERENTES TERRITÓRIOS",
            "title": "Inteligência que decide. Evidência que sustenta. Estratégia que transforma.",
            "body": "A Elite integra Direito, perícia, investigação, tecnologia, educação e gestão para converter complexidade em leitura estratégica, prova tecnicamente defensável e decisão responsável.",
            "primary_cta": {"label": "Conhecer o ecossistema", "url": "#ecossistema"},
            "secondary_cta": {"label": "Acessar Elite Nexus", "url": "/login"},
        },
        {
            "id": "positioning",
            "type": "statement",
            "eyebrow": "POSICIONAMENTO",
            "title": "Quando o caso é complexo, a resposta precisa ser integrada.",
            "body": "Cada demanda passa por análise de contexto, risco, integridade e viabilidade antes da definição do próximo movimento.",
        },
    ],
    "seo": DEFAULT_SETTINGS["seo"],
    "updated_at": utcnow(),
}

DEFAULT_CONTENTS = [
    {
        "id": "cadeia-custodia-antes-analise",
        "title": "Cadeia de custódia começa antes da análise",
        "slug": "cadeia-de-custodia-comeca-antes-da-analise",
        "type": "article",
        "category": "Prova digital",
        "eyebrow": "PROVA DIGITAL",
        "excerpt": "Como decisões iniciais de preservação condicionam a confiabilidade do acervo.",
        "body": "A cadeia de custódia é a biografia da evidência. Ela conecta obtenção, preservação, acesso, análise e apresentação.",
        "tags": ["cadeia de custódia", "integridade", "evidência digital"],
        "status": "published",
        "featured": True,
        "author": "Elite Intelligence 360",
        "published_at": utcnow(),
        "created_at": utcnow(),
        "updated_at": utcnow(),
    },
    {
        "id": "deepfake-contexto-preservacao",
        "title": "Deepfake, contexto e preservação",
        "slug": "deepfake-contexto-e-preservacao",
        "type": "article",
        "category": "Inteligência",
        "eyebrow": "INTELIGÊNCIA",
        "excerpt": "O que preservar antes que a circulação do conteúdo apague parte do contexto.",
        "body": "Conteúdo sintético exige resposta coordenada: preservação, análise de origem, contexto e comunicação responsável.",
        "tags": ["deepfake", "IA", "preservação"],
        "status": "published",
        "featured": True,
        "author": "Elite Intelligence 360",
        "published_at": utcnow(),
        "created_at": utcnow(),
        "updated_at": utcnow(),
    },
    {
        "id": "primeiro-movimento",
        "title": "O primeiro movimento define o caso",
        "slug": "o-primeiro-movimento-define-o-caso",
        "type": "article",
        "category": "Estratégia",
        "eyebrow": "ESTRATÉGIA",
        "excerpt": "Antes de reagir, preserve, delimite o problema e organize as perguntas certas.",
        "body": "Em ambientes de pressão, estratégia não é velocidade sem direção. É escolher o primeiro movimento com informação suficiente.",
        "tags": ["estratégia", "risco", "decisão"],
        "status": "published",
        "featured": True,
        "author": "Elite Intelligence 360",
        "published_at": utcnow(),
        "created_at": utcnow(),
        "updated_at": utcnow(),
    },
]


class SiteSettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")
    brand: Optional[dict] = None
    contact: Optional[dict] = None
    social: Optional[dict] = None
    seo: Optional[dict] = None
    theme: Optional[dict] = None
    features: Optional[dict] = None
    analytics: Optional[dict] = None


class PagePayload(BaseModel):
    model_config = ConfigDict(extra="allow")
    title: str
    slug: Optional[str] = None
    status: str = "draft"
    sections: List[dict] = Field(default_factory=list)
    seo: Dict[str, Any] = Field(default_factory=dict)


class ContentPayload(BaseModel):
    model_config = ConfigDict(extra="allow")
    title: str
    slug: Optional[str] = None
    type: str = "article"
    category: str = "Institucional"
    eyebrow: Optional[str] = None
    excerpt: str = ""
    body: str = ""
    cover_url: str = ""
    tags: List[str] = Field(default_factory=list)
    status: str = "draft"
    featured: bool = False
    author: str = "Elite Intelligence 360"
    cta_label: Optional[str] = None
    cta_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    scheduled_at: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class NavigationPayload(BaseModel):
    model_config = ConfigDict(extra="allow")
    label: str
    order: int = 0
    active: bool = True
    columns: List[dict] = Field(default_factory=list)


async def ensure_defaults() -> None:
    if not await db.site_settings.find_one({"id": "global"}):
        await db.site_settings.insert_one(DEFAULT_SETTINGS.copy())
    if await db.site_navigation.count_documents({}) == 0:
        await db.site_navigation.insert_many(DEFAULT_NAVIGATION)
    if not await db.site_pages.find_one({"slug": "home"}):
        await db.site_pages.insert_one(DEFAULT_HOME.copy())
    if await db.site_contents.count_documents({}) == 0:
        await db.site_contents.insert_many(DEFAULT_CONTENTS)


@router.get("/bootstrap")
async def public_bootstrap() -> dict:
    await ensure_defaults()
    settings = serialize_document(await db.site_settings.find_one({"id": "global"}))
    navigation = await db.site_navigation.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(50)
    home = serialize_document(await db.site_pages.find_one({"slug": "home", "status": "published"}))
    featured = await db.site_contents.find({"status": "published", "featured": True}, {"_id": 0}).sort("published_at", -1).to_list(8)
    return {"settings": settings, "navigation": navigation, "home": home, "featured": featured}


@router.get("/settings")
async def public_settings() -> dict:
    await ensure_defaults()
    return serialize_document(await db.site_settings.find_one({"id": "global"}))


@router.get("/navigation")
async def public_navigation() -> List[dict]:
    await ensure_defaults()
    return await db.site_navigation.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(50)


@router.get("/pages/{slug}")
async def public_page(slug: str) -> dict:
    await ensure_defaults()
    page = await db.site_pages.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Página não encontrada")
    return page


@router.get("/content")
async def public_content(
    content_type: Optional[str] = Query(None, alias="type"),
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = Query(24, ge=1, le=100),
) -> List[dict]:
    await ensure_defaults()
    query: Dict[str, Any] = {"status": "published"}
    if content_type:
        query["type"] = content_type
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    return await db.site_contents.find(query, {"_id": 0}).sort("published_at", -1).to_list(limit)


@router.get("/content/{slug}")
async def public_content_detail(slug: str) -> dict:
    content = await db.site_contents.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not content:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    return content


@router.get("/search")
async def public_search(q: str = Query(..., min_length=2), limit: int = Query(20, ge=1, le=50)) -> dict:
    escaped = re.escape(q)
    query = {
        "status": "published",
        "$or": [
            {"title": {"$regex": escaped, "$options": "i"}},
            {"excerpt": {"$regex": escaped, "$options": "i"}},
            {"body": {"$regex": escaped, "$options": "i"}},
            {"tags": {"$regex": escaped, "$options": "i"}},
        ],
    }
    results = await db.site_contents.find(query, {"_id": 0}).sort("published_at", -1).to_list(limit)
    return {"query": q, "total": len(results), "results": results}


@router.get("/media/{asset_id}/file")
async def public_media_file(asset_id: str):
    asset = await db.site_media.find_one({"id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Mídia não encontrada")
    file_path = Path(asset["storage_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo indisponível")
    return FileResponse(file_path, media_type=asset.get("mime_type"), filename=asset.get("original_name"))


@router.get("/admin/overview")
async def admin_overview(user: dict = Depends(require_site_admin)) -> dict:
    await ensure_defaults()
    return {
        "contents": await db.site_contents.count_documents({}),
        "published": await db.site_contents.count_documents({"status": "published"}),
        "drafts": await db.site_contents.count_documents({"status": "draft"}),
        "scheduled": await db.site_contents.count_documents({"status": "scheduled"}),
        "pages": await db.site_pages.count_documents({}),
        "media": await db.site_media.count_documents({}),
        "messages": await db.contact_messages.count_documents({}),
        "unread_messages": await db.contact_messages.count_documents({"read": False}),
        "appointments": await db.appointments.count_documents({}),
        "last_update": utcnow(),
    }


@router.get("/admin/settings")
async def admin_get_settings(user: dict = Depends(require_site_admin)) -> dict:
    await ensure_defaults()
    return serialize_document(await db.site_settings.find_one({"id": "global"}))


@router.put("/admin/settings")
async def admin_update_settings(payload: SiteSettingsUpdate, user: dict = Depends(require_site_admin)) -> dict:
    await ensure_defaults()
    current = serialize_document(await db.site_settings.find_one({"id": "global"})) or DEFAULT_SETTINGS.copy()
    await save_revision("settings", "global", current, user)
    updates = {key: value for key, value in payload.model_dump(exclude_none=True).items()}
    updates["updated_at"] = utcnow()
    await db.site_settings.update_one({"id": "global"}, {"$set": updates}, upsert=True)
    await audit(user, "update", "settings", "global", {"fields": list(updates.keys())})
    return serialize_document(await db.site_settings.find_one({"id": "global"}))


@router.get("/admin/navigation")
async def admin_list_navigation(user: dict = Depends(require_site_admin)) -> List[dict]:
    await ensure_defaults()
    return await db.site_navigation.find({}, {"_id": 0}).sort("order", 1).to_list(100)


@router.post("/admin/navigation")
async def admin_create_navigation(payload: NavigationPayload, user: dict = Depends(require_site_admin)) -> dict:
    document = payload.model_dump()
    document.update({"id": str(uuid.uuid4()), "updated_at": utcnow()})
    await db.site_navigation.insert_one(document)
    await audit(user, "create", "navigation", document["id"])
    return serialize_document(document)


@router.put("/admin/navigation/{item_id}")
async def admin_update_navigation(item_id: str, payload: NavigationPayload, user: dict = Depends(require_site_admin)) -> dict:
    current = await db.site_navigation.find_one({"id": item_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Item de navegação não encontrado")
    await save_revision("navigation", item_id, current, user)
    updates = payload.model_dump()
    updates["updated_at"] = utcnow()
    await db.site_navigation.update_one({"id": item_id}, {"$set": updates})
    await audit(user, "update", "navigation", item_id)
    return serialize_document(await db.site_navigation.find_one({"id": item_id}))


@router.delete("/admin/navigation/{item_id}")
async def admin_delete_navigation(item_id: str, user: dict = Depends(require_site_admin)) -> dict:
    current = await db.site_navigation.find_one({"id": item_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Item de navegação não encontrado")
    await save_revision("navigation", item_id, current, user)
    await db.site_navigation.delete_one({"id": item_id})
    await audit(user, "delete", "navigation", item_id)
    return {"message": "Item excluído"}


@router.get("/admin/pages")
async def admin_list_pages(user: dict = Depends(require_site_admin)) -> List[dict]:
    await ensure_defaults()
    return await db.site_pages.find({}, {"_id": 0}).sort("updated_at", -1).to_list(100)


@router.post("/admin/pages")
async def admin_create_page(payload: PagePayload, user: dict = Depends(require_site_admin)) -> dict:
    page_slug = slugify(payload.slug or payload.title)
    if await db.site_pages.find_one({"slug": page_slug}):
        raise HTTPException(status_code=409, detail="Já existe uma página com este slug")
    document = payload.model_dump()
    document.update({"id": str(uuid.uuid4()), "slug": page_slug, "created_at": utcnow(), "updated_at": utcnow()})
    await db.site_pages.insert_one(document)
    await audit(user, "create", "page", document["id"], {"slug": page_slug})
    return serialize_document(document)


@router.put("/admin/pages/{page_id}")
async def admin_update_page(page_id: str, payload: PagePayload, user: dict = Depends(require_site_admin)) -> dict:
    current = await db.site_pages.find_one({"id": page_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Página não encontrada")
    await save_revision("page", page_id, current, user)
    updates = payload.model_dump()
    updates["slug"] = slugify(payload.slug or payload.title)
    updates["updated_at"] = utcnow()
    await db.site_pages.update_one({"id": page_id}, {"$set": updates})
    await audit(user, "update", "page", page_id)
    return serialize_document(await db.site_pages.find_one({"id": page_id}))


@router.delete("/admin/pages/{page_id}")
async def admin_delete_page(page_id: str, user: dict = Depends(require_site_admin)) -> dict:
    current = await db.site_pages.find_one({"id": page_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Página não encontrada")
    if current.get("slug") == "home":
        raise HTTPException(status_code=400, detail="A página inicial não pode ser excluída")
    await save_revision("page", page_id, current, user)
    await db.site_pages.delete_one({"id": page_id})
    await audit(user, "delete", "page", page_id)
    return {"message": "Página excluída"}


@router.get("/admin/contents")
async def admin_list_contents(
    status: Optional[str] = None,
    content_type: Optional[str] = Query(None, alias="type"),
    user: dict = Depends(require_site_admin),
) -> List[dict]:
    await ensure_defaults()
    query: Dict[str, Any] = {}
    if status:
        query["status"] = status
    if content_type:
        query["type"] = content_type
    return await db.site_contents.find(query, {"_id": 0}).sort("updated_at", -1).to_list(300)


@router.post("/admin/contents")
async def admin_create_content(payload: ContentPayload, user: dict = Depends(require_site_admin)) -> dict:
    content_slug = slugify(payload.slug or payload.title)
    if await db.site_contents.find_one({"slug": content_slug}):
        raise HTTPException(status_code=409, detail="Já existe conteúdo com este slug")
    document = payload.model_dump()
    document.update({
        "id": str(uuid.uuid4()),
        "slug": content_slug,
        "created_at": utcnow(),
        "updated_at": utcnow(),
        "published_at": utcnow() if payload.status == "published" else None,
    })
    await db.site_contents.insert_one(document)
    await audit(user, "create", "content", document["id"], {"slug": content_slug, "type": payload.type})
    return serialize_document(document)


@router.put("/admin/contents/{content_id}")
async def admin_update_content(content_id: str, payload: ContentPayload, user: dict = Depends(require_site_admin)) -> dict:
    current = await db.site_contents.find_one({"id": content_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    await save_revision("content", content_id, current, user)
    updates = payload.model_dump()
    updates["slug"] = slugify(payload.slug or payload.title)
    updates["updated_at"] = utcnow()
    if payload.status == "published" and not current.get("published_at"):
        updates["published_at"] = utcnow()
    await db.site_contents.update_one({"id": content_id}, {"$set": updates})
    await audit(user, "update", "content", content_id, {"status": payload.status})
    return serialize_document(await db.site_contents.find_one({"id": content_id}))


@router.post("/admin/contents/{content_id}/publish")
async def admin_publish_content(content_id: str, user: dict = Depends(require_site_admin)) -> dict:
    current = await db.site_contents.find_one({"id": content_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    await save_revision("content", content_id, current, user)
    await db.site_contents.update_one(
        {"id": content_id},
        {"$set": {"status": "published", "published_at": utcnow(), "updated_at": utcnow()}},
    )
    await audit(user, "publish", "content", content_id)
    return serialize_document(await db.site_contents.find_one({"id": content_id}))


@router.delete("/admin/contents/{content_id}")
async def admin_delete_content(content_id: str, user: dict = Depends(require_site_admin)) -> dict:
    current = await db.site_contents.find_one({"id": content_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    await save_revision("content", content_id, current, user)
    await db.site_contents.delete_one({"id": content_id})
    await audit(user, "delete", "content", content_id)
    return {"message": "Conteúdo excluído"}


@router.get("/admin/media")
async def admin_list_media(user: dict = Depends(require_site_admin)) -> List[dict]:
    return await db.site_media.find({}, {"_id": 0}).sort("created_at", -1).to_list(300)


@router.post("/admin/media")
async def admin_upload_media(
    file: UploadFile = File(...),
    alt_text: str = Form(""),
    caption: str = Form(""),
    rights: str = Form("Uso institucional autorizado"),
    user: dict = Depends(require_site_admin),
) -> dict:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail="Formato não permitido")
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Arquivo excede o limite configurado")
    original_name = Path(file.filename or "arquivo").name
    suffix = Path(original_name).suffix.lower()
    asset_id = str(uuid.uuid4())
    stored_name = f"{asset_id}{suffix}"
    storage_path = SITE_UPLOAD_DIR / stored_name
    storage_path.write_bytes(content)
    sha256 = hashlib.sha256(content).hexdigest()
    document = {
        "id": asset_id,
        "original_name": original_name,
        "stored_name": stored_name,
        "storage_path": str(storage_path),
        "mime_type": file.content_type,
        "size": len(content),
        "sha256": sha256,
        "alt_text": alt_text,
        "caption": caption,
        "rights": rights,
        "url": f"/api/site/media/{asset_id}/file",
        "created_by": user.get("email"),
        "created_at": utcnow(),
        "updated_at": utcnow(),
    }
    await db.site_media.insert_one(document)
    await audit(user, "upload", "media", asset_id, {"name": original_name, "sha256": sha256})
    return serialize_document(document)


@router.put("/admin/media/{asset_id}")
async def admin_update_media(
    asset_id: str,
    alt_text: str = Form(""),
    caption: str = Form(""),
    rights: str = Form("Uso institucional autorizado"),
    user: dict = Depends(require_site_admin),
) -> dict:
    current = await db.site_media.find_one({"id": asset_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Mídia não encontrada")
    await save_revision("media", asset_id, current, user)
    await db.site_media.update_one(
        {"id": asset_id},
        {"$set": {"alt_text": alt_text, "caption": caption, "rights": rights, "updated_at": utcnow()}},
    )
    await audit(user, "update", "media", asset_id)
    return serialize_document(await db.site_media.find_one({"id": asset_id}))


@router.delete("/admin/media/{asset_id}")
async def admin_delete_media(asset_id: str, user: dict = Depends(require_site_admin)) -> dict:
    current = await db.site_media.find_one({"id": asset_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Mídia não encontrada")
    file_path = Path(current.get("storage_path", ""))
    if file_path.exists() and SITE_UPLOAD_DIR in file_path.parents:
        file_path.unlink(missing_ok=True)
    await db.site_media.delete_one({"id": asset_id})
    await audit(user, "delete", "media", asset_id)
    return {"message": "Mídia excluída"}


@router.get("/admin/audit")
async def admin_audit(limit: int = Query(100, ge=1, le=500), user: dict = Depends(require_site_admin)) -> List[dict]:
    return await db.site_audit_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)


@router.get("/admin/revisions/{resource}/{resource_id}")
async def admin_revisions(resource: str, resource_id: str, user: dict = Depends(require_site_admin)) -> List[dict]:
    return await db.site_revisions.find(
        {"resource": resource, "resource_id": resource_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)


@router.post("/admin/seed")
async def admin_seed_defaults(user: dict = Depends(require_site_admin)) -> dict:
    await ensure_defaults()
    await audit(user, "seed", "site", "defaults")
    return {"message": "Estrutura editorial inicial confirmada"}
