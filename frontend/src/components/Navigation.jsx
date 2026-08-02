import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  LockKeyhole,
  Menu,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { fallbackNavigation, fallbackSettings } from '../data/eliteSiteDefaults';
import { siteCms } from '../services/siteCms';

const SmartLink = ({ to, children, className = '', onClick }) => {
  const isExternal = /^https?:\/\//i.test(to || '');
  if (isExternal) {
    return <a href={to} className={className} target="_blank" rel="noreferrer" onClick={onClick}>{children}</a>;
  }
  return <Link to={to || '/'} className={className} onClick={onClick}>{children}</Link>;
};

const Navigation = ({ showBackButton = false, title = '', siteData = null }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [remoteData, setRemoteData] = useState(null);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (siteData) return;
    let active = true;
    siteCms.bootstrap().then((data) => active && setRemoteData(data)).catch(() => {});
    return () => { active = false; };
  }, [siteData]);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) setOpenMenu(null);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const data = siteData || remoteData || {};
  const settings = data.settings || fallbackSettings;
  const navigation = useMemo(
    () => (data.navigation?.length ? data.navigation : fallbackNavigation).filter((item) => item.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)),
    [data.navigation],
  );

  return (
    <>
      <header className="elite-header" ref={navRef}>
        <div className="elite-header__signal">
          <span>ELITE INTELLIGENCE 360</span>
          <span className="elite-header__signal-divider" />
          <span>Atendimento nacional · Entrada protegida por triagem</span>
        </div>

        <div className="elite-header__main elite-container">
          <div className="elite-header__brand-group">
            {showBackButton && (
              <button type="button" className="elite-icon-button" onClick={() => window.history.back()} aria-label="Voltar">
                <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
              </button>
            )}
            <Link to="/" className="elite-brand" aria-label="Elite Intelligence 360 - Início">
              <span className="elite-brand__mark" aria-hidden="true"><span>E</span></span>
              <span className="elite-brand__copy">
                <strong>{settings.brand?.name || 'ELITE'}</strong>
                <small>{settings.brand?.descriptor || 'INTELLIGENCE 360'}</small>
              </span>
            </Link>
            {title && <span className="elite-header__page-title">{title}</span>}
          </div>

          <nav className="elite-desktop-nav" aria-label="Navegação principal">
            <SmartLink to="/about" className="elite-nav-link">A Elite</SmartLink>
            {navigation.map((item) => (
              <div className="elite-nav-item" key={item.id}>
                <button
                  type="button"
                  className={`elite-nav-link elite-nav-button ${openMenu === item.id ? 'is-open' : ''}`}
                  onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                  aria-expanded={openMenu === item.id}
                >
                  {item.label}<ChevronDown size={15} />
                </button>
                {openMenu === item.id && (
                  <div className="elite-mega-menu" role="menu">
                    <div className="elite-mega-menu__intro">
                      <span className="elite-kicker">TERRITÓRIO ELITE</span>
                      <h3>{item.label}</h3>
                      <p>Escolha a frente adequada. A plataforma organiza o caminho sem misturar públicos, permissões ou responsabilidades.</p>
                      <SmartLink to="/hub" className="elite-inline-link">Ver visão completa <ArrowRight size={15} /></SmartLink>
                    </div>
                    <div className="elite-mega-menu__columns">
                      {(item.columns || []).map((column) => (
                        <div key={column.title} className="elite-mega-column">
                          <span>{column.title}</span>
                          {(column.items || []).map((entry) => (
                            <SmartLink to={entry.url} key={`${entry.label}-${entry.url}`} className="elite-mega-link">
                              <strong>{entry.label}</strong>
                              <small>{entry.description}</small>
                              <ArrowRight size={15} />
                            </SmartLink>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="elite-mega-menu__footer">
                      <ShieldCheck size={17} />
                      <span>Ambiente público institucional. Dados operacionais permanecem nos territórios autenticados.</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="elite-header__actions">
            <button type="button" className="elite-icon-button elite-search-trigger" onClick={() => setSearchOpen(true)} aria-label="Pesquisar">
              <Search size={19} />
            </button>
            <SmartLink to="/contact" className="elite-button elite-button--ghost">Solicitar análise</SmartLink>
            <SmartLink to="/login" className="elite-button elite-button--gold"><LockKeyhole size={16} />Entrar no Nexus</SmartLink>
            <button type="button" className="elite-mobile-trigger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menu">
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="elite-mobile-menu">
            <SmartLink to="/about" className="elite-mobile-menu__root">A Elite</SmartLink>
            {navigation.map((item) => (
              <details key={item.id} className="elite-mobile-menu__group">
                <summary>{item.label}<ChevronDown size={17} /></summary>
                {(item.columns || []).map((column) => (
                  <div className="elite-mobile-menu__column" key={column.title}>
                    <span>{column.title}</span>
                    {(column.items || []).map((entry) => (
                      <SmartLink to={entry.url} key={entry.label} onClick={() => setMobileOpen(false)}>
                        <strong>{entry.label}</strong><small>{entry.description}</small>
                      </SmartLink>
                    ))}
                  </div>
                ))}
              </details>
            ))}
            <div className="elite-mobile-menu__actions">
              <SmartLink to="/contact" className="elite-button elite-button--ghost">Solicitar análise</SmartLink>
              <SmartLink to="/login" className="elite-button elite-button--gold"><LockKeyhole size={16} />Entrar no Nexus</SmartLink>
            </div>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="elite-search-modal" role="dialog" aria-modal="true" aria-label="Pesquisa Elite">
          <button className="elite-search-modal__backdrop" onClick={() => setSearchOpen(false)} aria-label="Fechar pesquisa" />
          <div className="elite-search-modal__panel">
            <button type="button" className="elite-search-modal__close" onClick={() => setSearchOpen(false)}><X /></button>
            <span className="elite-kicker">PESQUISA TRANSVERSAL</span>
            <h2>O que você precisa localizar?</h2>
            <p>Pesquise conteúdos, soluções, materiais, cursos, eventos e territórios da Elite.</p>
            <form action="/hub/pesquisa" method="get" className="elite-search-modal__form">
              <Search size={21} />
              <input name="q" autoFocus placeholder="Ex.: cadeia de custódia, interceptações, eleitoral..." />
              <button type="submit" className="elite-button elite-button--gold">Pesquisar</button>
            </form>
            <div className="elite-search-modal__suggestions">
              {['Evidências digitais', 'Método D.O.S.S.I.Ê', 'Elite Academy', 'Crimes financeiros'].map((term) => (
                <Link key={term} to={`/hub/pesquisa?q=${encodeURIComponent(term)}`} onClick={() => setSearchOpen(false)}>{term}</Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
