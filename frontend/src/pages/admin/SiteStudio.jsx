import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Activity,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  FilePenLine,
  FileText,
  Globe2,
  Image,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquareText,
  Newspaper,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { siteCms, resolveMediaUrl } from '../../services/siteCms';
import { fallbackSettings } from '../../data/eliteSiteDefaults';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const emptyContent = {
  title: '', slug: '', type: 'article', category: 'Institucional', eyebrow: '', excerpt: '', body: '', cover_url: '',
  tags: [], status: 'draft', featured: false, author: 'Elite Intelligence 360', cta_label: '', cta_url: '',
  seo_title: '', seo_description: '', scheduled_at: '', metadata: {},
};
const emptyPage = { title: '', slug: '', status: 'draft', sections: [], seo: {} };
const emptyNav = { label: '', order: 0, active: true, columns: [] };

const NavItem = ({ active, icon: Icon, label, count, onClick }) => (
  <button type="button" className={`site-studio-nav__item ${active ? 'is-active' : ''}`} onClick={onClick}>
    <Icon size={18} /><span>{label}</span>{count !== undefined && <b>{count}</b>}
  </button>
);

const Field = ({ label, children, hint, wide = false }) => (
  <label className={`site-studio-field ${wide ? 'is-wide' : ''}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
);

const StatusBadge = ({ status }) => <span className={`site-studio-status status-${status || 'draft'}`}>{({ published: 'Publicado', draft: 'Rascunho', scheduled: 'Agendado', review: 'Em revisão' }[status] || status || 'Rascunho')}</span>;

const SiteStudio = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [overview, setOverview] = useState({});
  const [contents, setContents] = useState([]);
  const [pages, setPages] = useState([]);
  const [navigation, setNavigation] = useState([]);
  const [media, setMedia] = useState([]);
  const [audit, setAudit] = useState([]);
  const [settings, setSettings] = useState(fallbackSettings);
  const [messages, setMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [contentForm, setContentForm] = useState(emptyContent);
  const [contentEditingId, setContentEditingId] = useState(null);
  const [contentEditorOpen, setContentEditorOpen] = useState(false);
  const [pageForm, setPageForm] = useState(emptyPage);
  const [pageEditingId, setPageEditingId] = useState(null);
  const [pageEditorOpen, setPageEditorOpen] = useState(false);
  const [navForm, setNavForm] = useState(emptyNav);
  const [navEditingId, setNavEditingId] = useState(null);
  const [navEditorOpen, setNavEditorOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mediaMeta, setMediaMeta] = useState({ alt_text: '', caption: '', rights: 'Uso institucional autorizado' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [user, setUser] = useState(null);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('ap_elite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('ap_elite_token');
    const rawUser = localStorage.getItem('ap_elite_user');
    if (!token || !rawUser) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(rawUser);
      if (!['super_admin', 'administrator', 'editor'].includes(parsed.role)) {
        toast.error('Seu perfil não possui acesso ao Site Studio.');
        navigate('/admin/dashboard');
        return;
      }
      setUser(parsed);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const fetchLeads = useCallback(async () => {
    try {
      const [messagesResponse, appointmentsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/contact`, { headers: authHeaders() }),
        axios.get(`${BACKEND_URL}/api/appointments`, { headers: authHeaders() }),
      ]);
      setMessages(Array.isArray(messagesResponse.data) ? messagesResponse.data : []);
      setAppointments(Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : []);
    } catch {
      setMessages([]);
      setAppointments([]);
    }
  }, [authHeaders]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await siteCms.admin.seed().catch(() => {});
      const [overviewData, settingsData, navData, contentData, pageData, mediaData, auditData] = await Promise.all([
        siteCms.admin.overview(), siteCms.admin.settings(), siteCms.admin.navigation(), siteCms.admin.contents(),
        siteCms.admin.pages(), siteCms.admin.media(), siteCms.admin.audit(),
      ]);
      setOverview(overviewData || {});
      setSettings(settingsData || fallbackSettings);
      setNavigation(navData || []);
      setContents(contentData || []);
      setPages(pageData || []);
      setMedia(mediaData || []);
      setAudit(auditData || []);
      await fetchLeads();
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Sessão inválida ou sem permissão para o CMS.');
        navigate('/login');
      } else {
        toast.error('Não foi possível carregar todos os dados do Site Studio.');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchLeads, navigate]);

  useEffect(() => { if (user) loadAll(); }, [user, loadAll]);

  const filteredContents = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return contents;
    return contents.filter((item) => [item.title, item.category, item.type, ...(item.tags || [])].join(' ').toLowerCase().includes(normalized));
  }, [contents, query]);

  const updateSettingsField = (group, key, value) => setSettings((current) => ({ ...current, [group]: { ...(current[group] || {}), [key]: value } }));

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updated = await siteCms.admin.updateSettings({
        brand: settings.brand, contact: settings.contact, social: settings.social, seo: settings.seo,
        theme: settings.theme, features: settings.features, analytics: settings.analytics,
      });
      setSettings(updated);
      toast.success('Marca, SEO e configurações atualizados.');
    } catch { toast.error('Não foi possível salvar as configurações.'); }
    finally { setSaving(false); }
  };

  const openContentEditor = (item = null) => {
    setContentEditingId(item?.id || null);
    setContentForm(item ? { ...emptyContent, ...item, tags: item.tags || [], metadata: item.metadata || {} } : emptyContent);
    setContentEditorOpen(true);
  };

  const saveContent = async (publish = false) => {
    if (!contentForm.title.trim()) return toast.error('Informe o título do conteúdo.');
    setSaving(true);
    try {
      const payload = { ...contentForm, status: publish ? 'published' : contentForm.status, tags: Array.isArray(contentForm.tags) ? contentForm.tags : String(contentForm.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean) };
      let saved;
      if (contentEditingId) saved = await siteCms.admin.updateContent(contentEditingId, payload);
      else saved = await siteCms.admin.createContent(payload);
      if (publish && saved.status !== 'published') saved = await siteCms.admin.publishContent(saved.id);
      setContents((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setContentEditorOpen(false); setContentEditingId(null); setContentForm(emptyContent);
      toast.success(publish ? 'Conteúdo publicado.' : 'Conteúdo salvo.');
      setOverview(await siteCms.admin.overview());
    } catch (error) { toast.error(error?.response?.data?.detail || 'Erro ao salvar conteúdo.'); }
    finally { setSaving(false); }
  };

  const publishContent = async (item) => {
    try {
      const saved = await siteCms.admin.publishContent(item.id);
      setContents((current) => current.map((entry) => entry.id === item.id ? saved : entry));
      toast.success('Conteúdo publicado.');
    } catch { toast.error('Falha ao publicar.'); }
  };

  const deleteContent = async (item) => {
    if (!window.confirm(`Excluir “${item.title}”? Uma revisão será mantida para auditoria.`)) return;
    try { await siteCms.admin.deleteContent(item.id); setContents((current) => current.filter((entry) => entry.id !== item.id)); toast.success('Conteúdo excluído.'); }
    catch { toast.error('Falha ao excluir conteúdo.'); }
  };

  const openPageEditor = (item = null) => {
    setPageEditingId(item?.id || null);
    setPageForm(item ? { ...emptyPage, ...item, sections: item.sections || [], seo: item.seo || {} } : emptyPage);
    setPageEditorOpen(true);
  };

  const savePage = async () => {
    if (!pageForm.title.trim()) return toast.error('Informe o título da página.');
    setSaving(true);
    try {
      const saved = pageEditingId ? await siteCms.admin.updatePage(pageEditingId, pageForm) : await siteCms.admin.createPage(pageForm);
      setPages((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setPageEditorOpen(false); setPageEditingId(null); setPageForm(emptyPage);
      toast.success('Página salva.');
    } catch (error) { toast.error(error?.response?.data?.detail || 'Erro ao salvar página.'); }
    finally { setSaving(false); }
  };

  const deletePage = async (item) => {
    if (!window.confirm(`Excluir a página “${item.title}”?`)) return;
    try { await siteCms.admin.deletePage(item.id); setPages((current) => current.filter((entry) => entry.id !== item.id)); toast.success('Página excluída.'); }
    catch (error) { toast.error(error?.response?.data?.detail || 'Falha ao excluir página.'); }
  };

  const openNavEditor = (item = null) => {
    setNavEditingId(item?.id || null);
    setNavForm(item ? { ...emptyNav, ...item, columns: item.columns || [] } : emptyNav);
    setNavEditorOpen(true);
  };

  const saveNavigation = async () => {
    if (!navForm.label.trim()) return toast.error('Informe o nome do menu.');
    setSaving(true);
    try {
      const saved = navEditingId ? await siteCms.admin.updateNavigation(navEditingId, navForm) : await siteCms.admin.createNavigation(navForm);
      setNavigation((current) => [saved, ...current.filter((item) => item.id !== saved.id)].sort((a, b) => (a.order || 0) - (b.order || 0)));
      setNavEditorOpen(false); setNavEditingId(null); setNavForm(emptyNav);
      toast.success('Navegação atualizada.');
    } catch { toast.error('Erro ao salvar navegação.'); }
    finally { setSaving(false); }
  };

  const deleteNavigation = async (item) => {
    if (!window.confirm(`Excluir o menu “${item.label}”?`)) return;
    try { await siteCms.admin.deleteNavigation(item.id); setNavigation((current) => current.filter((entry) => entry.id !== item.id)); toast.success('Menu excluído.'); }
    catch { toast.error('Falha ao excluir menu.'); }
  };

  const uploadMedia = async () => {
    if (!selectedFile) return toast.error('Selecione um arquivo.');
    setSaving(true);
    try {
      const saved = await siteCms.admin.uploadMedia(selectedFile, mediaMeta);
      setMedia((current) => [saved, ...current]);
      setSelectedFile(null); setMediaMeta({ alt_text: '', caption: '', rights: 'Uso institucional autorizado' });
      toast.success('Mídia enviada com hash e metadados registrados.');
    } catch (error) { toast.error(error?.response?.data?.detail || 'Erro no upload.'); }
    finally { setSaving(false); }
  };

  const deleteMedia = async (item) => {
    if (!window.confirm(`Excluir “${item.original_name}”?`)) return;
    try { await siteCms.admin.deleteMedia(item.id); setMedia((current) => current.filter((entry) => entry.id !== item.id)); toast.success('Mídia excluída.'); }
    catch { toast.error('Falha ao excluir mídia.'); }
  };

  const markMessageRead = async (message) => {
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, read: true } : item));
    toast.success('Mensagem marcada como lida no painel local.');
  };

  const navCounts = { content: contents.length, media: media.length, leads: messages.filter((m) => !m.read).length, audit: audit.length };

  return (
    <div className="site-studio">
      <aside className="site-studio-sidebar">
        <Link to="/" className="site-studio-brand"><span>E</span><div><strong>ELITE</strong><small>SITE STUDIO</small></div></Link>
        <div className="site-studio-sidebar__context"><span>ADMINISTRAÇÃO GERAL</span><strong>{user?.name || 'Administradora'}</strong><small>{user?.email}</small></div>
        <nav>
          <NavItem active={activeTab === 'overview'} icon={LayoutDashboard} label="Visão geral" onClick={() => setActiveTab('overview')} />
          <NavItem active={activeTab === 'content'} icon={Newspaper} label="Conteúdos" count={navCounts.content} onClick={() => setActiveTab('content')} />
          <NavItem active={activeTab === 'pages'} icon={FilePenLine} label="Páginas" count={pages.length} onClick={() => setActiveTab('pages')} />
          <NavItem active={activeTab === 'navigation'} icon={Menu} label="Menu e navegação" count={navigation.length} onClick={() => setActiveTab('navigation')} />
          <NavItem active={activeTab === 'media'} icon={Image} label="Biblioteca de mídia" count={navCounts.media} onClick={() => setActiveTab('media')} />
          <NavItem active={activeTab === 'brand'} icon={Settings} label="Marca, SEO e integrações" onClick={() => setActiveTab('brand')} />
          <NavItem active={activeTab === 'leads'} icon={MessageSquareText} label="Leads e atendimento" count={navCounts.leads} onClick={() => setActiveTab('leads')} />
          <NavItem active={activeTab === 'audit'} icon={Activity} label="Auditoria e revisões" count={navCounts.audit} onClick={() => setActiveTab('audit')} />
        </nav>
        <div className="site-studio-sidebar__bottom">
          <Link to="/admin/dashboard"><BarChart3 size={17} />Gestão 360</Link>
          <Link to="/" target="_blank"><Globe2 size={17} />Abrir site</Link>
          <Link to="/login"><ChevronRight size={17} style={{ transform: 'rotate(180deg)' }} />Trocar acesso</Link>
        </div>
      </aside>

      <main className="site-studio-main">
        <header className="site-studio-header">
          <div><span className="elite-kicker">ELITE INTELLIGENCE 360</span><h1>{({ overview: 'Centro de comando editorial', content: 'Conteúdo e autoridade', pages: 'Páginas e experiências', navigation: 'Arquitetura de navegação', media: 'Biblioteca de mídia', brand: 'Marca, SEO e integrações', leads: 'Leads e atendimento', audit: 'Auditoria e revisões' })[activeTab]}</h1></div>
          <div className="site-studio-header__actions"><button onClick={loadAll} className="site-studio-button secondary"><RefreshCw size={16} />Atualizar</button><Link to="/" target="_blank" className="site-studio-button"><Globe2 size={16} />Visualizar site</Link></div>
        </header>

        {loading ? <div className="site-studio-loading"><RefreshCw className="spin" /><span>Carregando governança editorial...</span></div> : (
          <>
            {activeTab === 'overview' && (
              <section className="site-studio-section">
                <div className="site-studio-metrics">
                  {[
                    ['Conteúdos', overview.contents || 0, Newspaper], ['Publicados', overview.published || 0, Check], ['Rascunhos', overview.drafts || 0, FileText],
                    ['Páginas', overview.pages || 0, Globe2], ['Mídias', overview.media || 0, Image], ['Leads não lidos', overview.unread_messages || 0, Mail],
                  ].map(([label, value, Icon]) => <article key={label}><div><Icon /><span>{label}</span></div><strong>{value}</strong></article>)}
                </div>
                <div className="site-studio-overview-grid">
                  <div className="site-studio-panel site-studio-quick-actions"><div className="site-studio-panel__head"><div><span>PUBLICAÇÃO</span><h2>Ações rápidas</h2></div><Sparkles /></div><div className="site-studio-quick-grid"><button onClick={() => { setActiveTab('content'); openContentEditor(); }}><Plus /><strong>Novo conteúdo</strong><small>Artigo, curso, notícia, evento ou material</small></button><button onClick={() => { setActiveTab('pages'); openPageEditor(); }}><FilePenLine /><strong>Nova página</strong><small>Landing page ou território institucional</small></button><button onClick={() => setActiveTab('media')}><Upload /><strong>Enviar mídia</strong><small>Com alt text, direitos e SHA-256</small></button><button onClick={() => setActiveTab('navigation')}><Menu /><strong>Ajustar menu</strong><small>Estrutura e mega menus</small></button></div></div>
                  <div className="site-studio-panel"><div className="site-studio-panel__head"><div><span>SAÚDE EDITORIAL</span><h2>Governança do site</h2></div><ShieldCheck /></div><ul className="site-studio-health"><li><span>Conteúdo publicado</span><b>{overview.published || 0}</b></li><li><span>Conteúdo em rascunho</span><b>{overview.drafts || 0}</b></li><li><span>Conteúdo agendado</span><b>{overview.scheduled || 0}</b></li><li><span>Itens de mídia registrados</span><b>{overview.media || 0}</b></li><li><span>Mensagens recebidas</span><b>{overview.messages || 0}</b></li></ul></div>
                  <div className="site-studio-panel site-studio-recent"><div className="site-studio-panel__head"><div><span>ÚLTIMAS ATUALIZAÇÕES</span><h2>Auditoria editorial</h2></div><Activity /></div>{audit.slice(0, 8).map((item) => <div key={item.id}><span>{item.action}</span><strong>{item.resource}</strong><small>{item.actor_email || 'Sistema'} · {new Date(item.created_at).toLocaleString('pt-BR')}</small></div>)}{audit.length === 0 && <p>Nenhuma ação registrada ainda.</p>}</div>
                  <div className="site-studio-panel site-studio-architecture"><div className="site-studio-panel__head"><div><span>ARQUITETURA</span><h2>Quatro camadas coordenadas</h2></div><Globe2 /></div><div className="site-studio-architecture__flow"><div><b>01</b><strong>Site público</strong><small>Autoridade, descoberta e captação</small></div><ChevronRight /><div><b>02</b><strong>Site Studio</strong><small>Conteúdo, menu, mídia e SEO</small></div><ChevronRight /><div><b>03</b><strong>Elite Nexus</strong><small>Login, perfis e permissões</small></div><ChevronRight /><div><b>04</b><strong>Gestão 360</strong><small>Casos, clientes e operação</small></div></div></div>
                </div>
              </section>
            )}

            {activeTab === 'content' && (
              <section className="site-studio-section">
                <div className="site-studio-toolbar"><div className="site-studio-search"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar título, categoria, tipo ou tag" /></div><button className="site-studio-button" onClick={() => openContentEditor()}><Plus size={17} />Novo conteúdo</button></div>
                <div className="site-studio-table-wrap"><table className="site-studio-table"><thead><tr><th>Conteúdo</th><th>Tipo</th><th>Categoria</th><th>Status</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>{filteredContents.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>/{item.slug}</small></td><td>{item.type}</td><td>{item.category}</td><td><StatusBadge status={item.status} /></td><td>{item.updated_at ? new Date(item.updated_at).toLocaleString('pt-BR') : '—'}</td><td><div className="site-studio-row-actions"><button onClick={() => openContentEditor(item)} title="Editar"><FilePenLine /></button>{item.status !== 'published' && <button onClick={() => publishContent(item)} title="Publicar"><Send /></button>}<Link to={`/conteudo/${item.slug}`} target="_blank" title="Pré-visualizar"><Globe2 /></Link><button className="danger" onClick={() => deleteContent(item)} title="Excluir"><Trash2 /></button></div></td></tr>)}</tbody></table></div>
              </section>
            )}

            {activeTab === 'pages' && (
              <section className="site-studio-section"><div className="site-studio-toolbar"><p>Páginas institucionais, territórios e landing pages com seções editáveis.</p><button className="site-studio-button" onClick={() => openPageEditor()}><Plus size={17} />Nova página</button></div><div className="site-studio-card-list">{pages.map((item) => <article key={item.id}><div><Globe2 /><div><strong>{item.title}</strong><small>/{item.slug}</small></div></div><StatusBadge status={item.status} /><div className="site-studio-row-actions"><button onClick={() => openPageEditor(item)}><FilePenLine /></button><Link to={item.slug === 'home' ? '/' : `/pagina/${item.slug}`} target="_blank"><Globe2 /></Link>{item.slug !== 'home' && <button className="danger" onClick={() => deletePage(item)}><Trash2 /></button>}</div></article>)}</div></section>
            )}

            {activeTab === 'navigation' && (
              <section className="site-studio-section"><div className="site-studio-toolbar"><p>Controle os mega menus, colunas, descrições, links, ordem e visibilidade.</p><button className="site-studio-button" onClick={() => openNavEditor()}><Plus size={17} />Novo menu</button></div><div className="site-studio-navigation-list">{navigation.map((item) => <article key={item.id}><span className="drag-handle">{String(item.order || 0).padStart(2, '0')}</span><div><strong>{item.label}</strong><small>{(item.columns || []).reduce((total, column) => total + (column.items || []).length, 0)} links · {item.active ? 'visível' : 'oculto'}</small></div><div className="site-studio-row-actions"><button onClick={() => openNavEditor(item)}><FilePenLine /></button><button className="danger" onClick={() => deleteNavigation(item)}><Trash2 /></button></div></article>)}</div></section>
            )}

            {activeTab === 'media' && (
              <section className="site-studio-section"><div className="site-studio-media-upload"><div><Upload /><h2>Enviar mídia institucional</h2><p>Fotos pessoais não são necessárias. Priorize visuais abstratos, jurídicos, forenses, tecnológicos e editoriais com autorização de uso.</p></div><div className="site-studio-media-form"><Field label="Arquivo"><input type="file" accept="image/*,application/pdf,video/mp4,video/webm" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} /></Field><Field label="Texto alternativo"><input value={mediaMeta.alt_text} onChange={(e) => setMediaMeta({ ...mediaMeta, alt_text: e.target.value })} placeholder="Descreva a imagem para acessibilidade" /></Field><Field label="Legenda"><input value={mediaMeta.caption} onChange={(e) => setMediaMeta({ ...mediaMeta, caption: e.target.value })} placeholder="Legenda ou finalidade" /></Field><Field label="Direitos de uso"><input value={mediaMeta.rights} onChange={(e) => setMediaMeta({ ...mediaMeta, rights: e.target.value })} /></Field><button onClick={uploadMedia} disabled={saving} className="site-studio-button"><Upload size={16} />Enviar e registrar</button></div></div><div className="site-studio-media-grid">{media.map((item) => <article key={item.id}>{item.mime_type?.startsWith('image/') ? <img src={resolveMediaUrl(item.url)} alt={item.alt_text || item.original_name} /> : <div className="site-studio-media-placeholder"><FileText /></div>}<div><strong>{item.original_name}</strong><small>{item.mime_type} · {(item.size / 1024).toFixed(1)} KB</small><p>{item.alt_text || 'Sem texto alternativo'}</p><code>SHA-256 {item.sha256?.slice(0, 16)}…</code><button className="danger" onClick={() => deleteMedia(item)}><Trash2 size={15} />Excluir</button></div></article>)}</div></section>
            )}

            {activeTab === 'brand' && (
              <section className="site-studio-section"><div className="site-studio-settings-grid"><div className="site-studio-panel"><div className="site-studio-panel__head"><div><span>MARCA-MÃE</span><h2>Identidade institucional</h2></div><Sparkles /></div><div className="site-studio-form-grid"><Field label="Nome"><input value={settings.brand?.name || ''} onChange={(e) => updateSettingsField('brand', 'name', e.target.value)} /></Field><Field label="Descritor"><input value={settings.brand?.descriptor || ''} onChange={(e) => updateSettingsField('brand', 'descriptor', e.target.value)} /></Field><Field label="Posicionamento" wide><textarea value={settings.brand?.tagline || ''} onChange={(e) => updateSettingsField('brand', 'tagline', e.target.value)} /></Field><Field label="Assinatura" wide><input value={settings.brand?.signature || ''} onChange={(e) => updateSettingsField('brand', 'signature', e.target.value)} /></Field></div></div><div className="site-studio-panel"><div className="site-studio-panel__head"><div><span>CONTATO</span><h2>Dados públicos</h2></div><Mail /></div><div className="site-studio-form-grid"><Field label="Telefone"><input value={settings.contact?.phone || ''} onChange={(e) => updateSettingsField('contact', 'phone', e.target.value)} /></Field><Field label="WhatsApp"><input value={settings.contact?.whatsapp || ''} onChange={(e) => updateSettingsField('contact', 'whatsapp', e.target.value)} /></Field><Field label="E-mail" wide><input value={settings.contact?.email || ''} onChange={(e) => updateSettingsField('contact', 'email', e.target.value)} /></Field><Field label="Área de atendimento" wide><input value={settings.contact?.service_area || ''} onChange={(e) => updateSettingsField('contact', 'service_area', e.target.value)} /></Field></div></div><div className="site-studio-panel"><div className="site-studio-panel__head"><div><span>SEO</span><h2>Busca e compartilhamento</h2></div><Search /></div><div className="site-studio-form-grid"><Field label="Título SEO" wide><input value={settings.seo?.title || ''} onChange={(e) => updateSettingsField('seo', 'title', e.target.value)} /></Field><Field label="Descrição SEO" wide><textarea value={settings.seo?.description || ''} onChange={(e) => updateSettingsField('seo', 'description', e.target.value)} /></Field><Field label="Imagem social" wide><input value={settings.seo?.og_image || ''} onChange={(e) => updateSettingsField('seo', 'og_image', e.target.value)} placeholder="URL da imagem Open Graph" /></Field></div></div><div className="site-studio-panel"><div className="site-studio-panel__head"><div><span>ANALYTICS</span><h2>Integrações de medição</h2></div><BarChart3 /></div><div className="site-studio-form-grid"><Field label="Google Tag ID"><input value={settings.analytics?.google_tag_id || ''} onChange={(e) => updateSettingsField('analytics', 'google_tag_id', e.target.value)} /></Field><Field label="Meta Pixel ID"><input value={settings.analytics?.meta_pixel_id || ''} onChange={(e) => updateSettingsField('analytics', 'meta_pixel_id', e.target.value)} /></Field></div><p className="site-studio-helper">Scripts devem ser ativados pela camada de deploy após validação de privacidade e consentimento.</p></div></div><div className="site-studio-savebar"><span>Alterações ficam registradas no histórico editorial.</span><button onClick={saveSettings} disabled={saving} className="site-studio-button"><Save size={16} />Salvar configurações</button></div></section>
            )}

            {activeTab === 'leads' && (
              <section className="site-studio-section"><div className="site-studio-lead-metrics"><div><Mail /><span>Mensagens</span><strong>{messages.length}</strong></div><div><CalendarDays /><span>Agendamentos</span><strong>{appointments.length}</strong></div><div><MessageSquareText /><span>Não lidas</span><strong>{messages.filter((m) => !m.read).length}</strong></div></div><div className="site-studio-leads-grid"><div className="site-studio-panel"><div className="site-studio-panel__head"><div><span>ENTRADAS DO SITE</span><h2>Mensagens</h2></div><Mail /></div><div className="site-studio-lead-list">{messages.map((message) => <article key={message.id} className={!message.read ? 'is-unread' : ''}><div><strong>{message.name}</strong><span>{message.subject}</span><small>{message.email} · {message.phone || 'sem telefone'}</small><p>{message.message}</p></div><button onClick={() => markMessageRead(message)}>{message.read ? <Check /> : <Globe2 />}</button></article>)}{messages.length === 0 && <p>Nenhuma mensagem recebida.</p>}</div></div><div className="site-studio-panel"><div className="site-studio-panel__head"><div><span>AGENDA</span><h2>Solicitações de atendimento</h2></div><CalendarDays /></div><div className="site-studio-lead-list">{appointments.map((appointment) => <article key={appointment.id}><div><strong>{appointment.name}</strong><span>{appointment.service}</span><small>{appointment.datetime ? new Date(appointment.datetime).toLocaleString('pt-BR') : 'Data não informada'} · {appointment.status}</small><p>{appointment.description}</p></div><ChevronRight /></article>)}{appointments.length === 0 && <p>Nenhuma solicitação recebida.</p>}</div></div></div></section>
            )}

            {activeTab === 'audit' && (
              <section className="site-studio-section"><div className="site-studio-audit-banner"><ShieldCheck /><div><h2>Rastreabilidade editorial</h2><p>Criação, atualização, publicação, upload e exclusão são registradas com ator, horário e recurso.</p></div></div><div className="site-studio-table-wrap"><table className="site-studio-table"><thead><tr><th>Data</th><th>Ação</th><th>Recurso</th><th>Identificador</th><th>Responsável</th></tr></thead><tbody>{audit.map((item) => <tr key={item.id}><td>{new Date(item.created_at).toLocaleString('pt-BR')}</td><td><StatusBadge status={item.action} /></td><td>{item.resource}</td><td><code>{item.resource_id}</code></td><td>{item.actor_email || 'Sistema'}</td></tr>)}</tbody></table></div></section>
            )}
          </>
        )}
      </main>

      {contentEditorOpen && (
        <div className="site-studio-modal"><button className="site-studio-modal__backdrop" onClick={() => setContentEditorOpen(false)} /><div className="site-studio-modal__panel site-studio-modal__panel--wide"><header><div><span>EDITORIAL</span><h2>{contentEditingId ? 'Editar conteúdo' : 'Novo conteúdo'}</h2></div><button onClick={() => setContentEditorOpen(false)}><X /></button></header><div className="site-studio-form-grid"><Field label="Título" wide><input value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} /></Field><Field label="Slug"><input value={contentForm.slug || ''} onChange={(e) => setContentForm({ ...contentForm, slug: e.target.value })} placeholder="gerado-automaticamente" /></Field><Field label="Tipo"><select value={contentForm.type} onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })}><option value="article">Artigo</option><option value="news">Notícia</option><option value="course">Curso</option><option value="event">Evento</option><option value="material">Material</option><option value="podcast">Podcast</option><option value="tool">Ferramenta</option></select></Field><Field label="Categoria"><input value={contentForm.category} onChange={(e) => setContentForm({ ...contentForm, category: e.target.value })} /></Field><Field label="Chamada"><input value={contentForm.eyebrow || ''} onChange={(e) => setContentForm({ ...contentForm, eyebrow: e.target.value })} /></Field><Field label="Resumo" wide><textarea value={contentForm.excerpt} onChange={(e) => setContentForm({ ...contentForm, excerpt: e.target.value })} /></Field><Field label="Corpo do conteúdo" wide><textarea className="is-large" value={contentForm.body} onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })} /></Field><Field label="Imagem de capa"><input value={contentForm.cover_url || ''} onChange={(e) => setContentForm({ ...contentForm, cover_url: e.target.value })} placeholder="URL da biblioteca de mídia" /></Field><Field label="Tags"><input value={(contentForm.tags || []).join(', ')} onChange={(e) => setContentForm({ ...contentForm, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} /></Field><Field label="Status"><select value={contentForm.status} onChange={(e) => setContentForm({ ...contentForm, status: e.target.value })}><option value="draft">Rascunho</option><option value="review">Em revisão</option><option value="scheduled">Agendado</option><option value="published">Publicado</option></select></Field><Field label="Autor"><input value={contentForm.author} onChange={(e) => setContentForm({ ...contentForm, author: e.target.value })} /></Field><Field label="Título SEO" wide><input value={contentForm.seo_title || ''} onChange={(e) => setContentForm({ ...contentForm, seo_title: e.target.value })} /></Field><Field label="Descrição SEO" wide><textarea value={contentForm.seo_description || ''} onChange={(e) => setContentForm({ ...contentForm, seo_description: e.target.value })} /></Field><label className="site-studio-checkbox"><input type="checkbox" checked={contentForm.featured} onChange={(e) => setContentForm({ ...contentForm, featured: e.target.checked })} /><span>Destacar na página inicial</span></label></div><footer><button className="site-studio-button secondary" onClick={() => saveContent(false)} disabled={saving}><Save size={16} />Salvar rascunho</button><button className="site-studio-button" onClick={() => saveContent(true)} disabled={saving}><Send size={16} />Salvar e publicar</button></footer></div></div>
      )}

      {pageEditorOpen && (
        <div className="site-studio-modal"><button className="site-studio-modal__backdrop" onClick={() => setPageEditorOpen(false)} /><div className="site-studio-modal__panel site-studio-modal__panel--wide"><header><div><span>PÁGINAS</span><h2>{pageEditingId ? 'Editar página' : 'Nova página'}</h2></div><button onClick={() => setPageEditorOpen(false)}><X /></button></header><div className="site-studio-form-grid"><Field label="Título" wide><input value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} /></Field><Field label="Slug"><input value={pageForm.slug || ''} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} /></Field><Field label="Status"><select value={pageForm.status} onChange={(e) => setPageForm({ ...pageForm, status: e.target.value })}><option value="draft">Rascunho</option><option value="published">Publicado</option></select></Field><Field label="Seções (JSON)" wide hint="Estrutura avançada para blocos da página. O editor visual entra na próxima camada."><textarea className="is-code is-large" value={JSON.stringify(pageForm.sections || [], null, 2)} onChange={(e) => { try { setPageForm({ ...pageForm, sections: JSON.parse(e.target.value) }); } catch {} }} /></Field><Field label="SEO (JSON)" wide><textarea className="is-code" value={JSON.stringify(pageForm.seo || {}, null, 2)} onChange={(e) => { try { setPageForm({ ...pageForm, seo: JSON.parse(e.target.value) }); } catch {} }} /></Field></div><footer><button className="site-studio-button" onClick={savePage} disabled={saving}><Save size={16} />Salvar página</button></footer></div></div>
      )}

      {navEditorOpen && (
        <div className="site-studio-modal"><button className="site-studio-modal__backdrop" onClick={() => setNavEditorOpen(false)} /><div className="site-studio-modal__panel site-studio-modal__panel--wide"><header><div><span>NAVEGAÇÃO</span><h2>{navEditingId ? 'Editar mega menu' : 'Novo mega menu'}</h2></div><button onClick={() => setNavEditorOpen(false)}><X /></button></header><div className="site-studio-form-grid"><Field label="Rótulo"><input value={navForm.label} onChange={(e) => setNavForm({ ...navForm, label: e.target.value })} /></Field><Field label="Ordem"><input type="number" value={navForm.order} onChange={(e) => setNavForm({ ...navForm, order: Number(e.target.value) })} /></Field><label className="site-studio-checkbox"><input type="checkbox" checked={navForm.active} onChange={(e) => setNavForm({ ...navForm, active: e.target.checked })} /><span>Exibir no site</span></label><Field label="Colunas e links (JSON)" wide hint='Exemplo: [{"title":"Grupo","items":[{"label":"Item","description":"Descrição","url":"/rota"}]}]'><textarea className="is-code is-large" value={JSON.stringify(navForm.columns || [], null, 2)} onChange={(e) => { try { setNavForm({ ...navForm, columns: JSON.parse(e.target.value) }); } catch {} }} /></Field></div><footer><button className="site-studio-button" onClick={saveNavigation} disabled={saving}><Save size={16} />Salvar menu</button></footer></div></div>
      )}
    </div>
  );
};

export default SiteStudio;
