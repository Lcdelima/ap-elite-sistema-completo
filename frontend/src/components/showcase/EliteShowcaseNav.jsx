import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  ChevronDown,
  GraduationCap,
  LockKeyhole,
  Menu,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Workflow,
  X,
} from 'lucide-react';

const ecosystemColumns = [
  {
    title: 'Soluções estratégicas',
    items: [
      { icon: Scale, label: 'Direito e alta complexidade', description: 'Estratégia jurídica, prova e decisão.', href: '#solucoes' },
      { icon: ShieldCheck, label: 'Perícia e inteligência', description: 'Evidência digital, investigação e contexto.', href: '#solucoes' },
    ],
  },
  {
    title: 'Tecnologia Elite',
    items: [
      { icon: Workflow, label: 'Elite 360', description: 'Sistema completo para operação, gestão e desempenho.', href: '#elite-360' },
      { icon: BrainCircuit, label: 'Elite IA', description: 'Inteligência supervisionada dentro do fluxo real.', href: '#elite-ia' },
      { icon: Smartphone, label: 'Sistema e app', description: 'Uma experiência contínua em todos os dispositivos.', href: '#elite-360' },
    ],
  },
  {
    title: 'Formação e comunidade',
    items: [
      { icon: GraduationCap, label: 'Elite Academy', description: 'Um universo de trilhas, laboratórios e certificações.', href: '#academy' },
      { icon: Sparkles, label: 'Doutrina Black', description: 'Método, estratégia e leitura do tabuleiro.', href: '#academy' },
    ],
  },
];

const SmartLink = ({ href, className = '', children, onClick }) => {
  if ((href || '').startsWith('#')) {
    return <a href={href} className={className} onClick={onClick}>{children}</a>;
  }
  if (/^https?:\/\//i.test(href || '')) {
    return <a href={href} className={className} target="_blank" rel="noreferrer" onClick={onClick}>{children}</a>;
  }
  return <Link to={href || '/'} className={className} onClick={onClick}>{children}</Link>;
};

const EliteShowcaseNav = ({ brand = {} }) => {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const closeAll = () => {
    setMegaOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className={`showcase-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="showcase-nav__bar showcase-shell">
        <Link to="/" className="showcase-brand" aria-label="Elite Intelligence 360 — início">
          <span className="showcase-brand__mark" aria-hidden="true">
            <i /><b>E</b><i />
          </span>
          <span className="showcase-brand__copy">
            <strong>{brand.name || 'ELITE'}</strong>
            <small>{brand.descriptor || 'INTELLIGENCE 360'}</small>
          </span>
        </Link>

        <nav className="showcase-nav__links" aria-label="Navegação principal">
          <SmartLink href="#a-elite">A Elite</SmartLink>
          <button
            type="button"
            className={megaOpen ? 'is-open' : ''}
            onClick={() => setMegaOpen((value) => !value)}
            aria-expanded={megaOpen}
          >
            Ecossistema <ChevronDown size={15} />
          </button>
          <SmartLink href="#elite-360">Elite 360</SmartLink>
          <SmartLink href="#academy">Academy</SmartLink>
          <SmartLink href="#conteudo">Inteligência & Conteúdo</SmartLink>
          <SmartLink href="#contato">Contato</SmartLink>
        </nav>

        <div className="showcase-nav__actions">
          <SmartLink href="/login" className="showcase-nav__nexus">
            <LockKeyhole size={15} /> Acessar Nexus
          </SmartLink>
          <SmartLink href="#contato" className="showcase-nav__cta">
            Solicitar análise <ArrowRight size={15} />
          </SmartLink>
          <button
            type="button"
            className="showcase-nav__mobile-trigger"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {megaOpen && (
        <div className="showcase-mega" role="dialog" aria-label="Ecossistema Elite">
          <button type="button" className="showcase-mega__backdrop" onClick={() => setMegaOpen(false)} aria-label="Fechar menu" />
          <div className="showcase-mega__panel showcase-shell">
            <div className="showcase-mega__manifesto">
              <span>ELITE INTELLIGENCE 360</span>
              <h2>Uma empresa.<br />Três forças.<br /><em>Um ecossistema.</em></h2>
              <p>Direito, inteligência e tecnologia reunidos para resolver, operar e formar.</p>
              <SmartLink href="#ecossistema" className="showcase-text-link" onClick={closeAll}>
                Ver arquitetura completa <ArrowRight size={15} />
              </SmartLink>
            </div>
            <div className="showcase-mega__columns">
              {ecosystemColumns.map((column) => (
                <div className="showcase-mega__column" key={column.title}>
                  <span>{column.title}</span>
                  {column.items.map(({ icon: Icon, label, description, href }) => (
                    <SmartLink href={href} key={label} className="showcase-mega__item" onClick={closeAll}>
                      <Icon size={19} />
                      <span><strong>{label}</strong><small>{description}</small></span>
                      <ArrowRight size={14} />
                    </SmartLink>
                  ))}
                </div>
              ))}
            </div>
            <div className="showcase-mega__footer">
              <ShieldCheck size={17} />
              <span>O site apresenta o ecossistema. Dados operacionais permanecem em ambientes autenticados.</span>
            </div>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="showcase-mobile-menu">
          <div className="showcase-mobile-menu__inner">
            <SmartLink href="#a-elite" onClick={closeAll}>A Elite</SmartLink>
            <SmartLink href="#ecossistema" onClick={closeAll}>Ecossistema</SmartLink>
            <SmartLink href="#elite-360" onClick={closeAll}>Elite 360</SmartLink>
            <SmartLink href="#elite-ia" onClick={closeAll}>Elite IA</SmartLink>
            <SmartLink href="#academy" onClick={closeAll}>Elite Academy</SmartLink>
            <SmartLink href="#solucoes" onClick={closeAll}>Soluções</SmartLink>
            <SmartLink href="#conteudo" onClick={closeAll}>Inteligência & Conteúdo</SmartLink>
            <SmartLink href="#contato" onClick={closeAll}>Contato</SmartLink>
            <div className="showcase-mobile-menu__actions">
              <SmartLink href="/login" className="showcase-nav__nexus" onClick={closeAll}><LockKeyhole size={15} />Acessar Nexus</SmartLink>
              <SmartLink href="#contato" className="showcase-nav__cta" onClick={closeAll}>Solicitar análise <ArrowRight size={15} /></SmartLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default EliteShowcaseNav;
