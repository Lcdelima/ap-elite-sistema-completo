import React from 'react';
import { ArrowUp, Instagram, Linkedin, Mail, Phone, ShieldCheck, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fallbackSettings } from '../data/eliteSiteDefaults';

const FooterColumn = ({ title, items }) => (
  <div className="elite-footer__column">
    <h3>{title}</h3>
    {items.map((item) => (
      <Link to={item.url} key={item.label}>{item.label}</Link>
    ))}
  </div>
);

const Footer = ({ settings = fallbackSettings }) => {
  const contact = settings?.contact || fallbackSettings.contact;
  const brand = settings?.brand || fallbackSettings.brand;

  return (
    <footer className="elite-footer">
      <div className="elite-footer__top elite-container">
        <div className="elite-footer__brand">
          <Link to="/" className="elite-brand elite-brand--footer">
            <span className="elite-brand__mark"><span>E</span></span>
            <span className="elite-brand__copy">
              <strong>{brand.name}</strong>
              <small>{brand.descriptor}</small>
            </span>
          </Link>
          <p>O site apresenta autoridade. O Nexus organiza acessos. O método conduz a decisão.</p>
          <strong>Um ecossistema. Uma única identidade.</strong>
          <div className="elite-footer__social">
            <a href={settings?.social?.linkedin || '#'} aria-label="LinkedIn"><Linkedin size={18} /></a>
            <a href={settings?.social?.instagram || '#'} aria-label="Instagram"><Instagram size={18} /></a>
            <a href={settings?.social?.youtube || '#'} aria-label="YouTube"><Youtube size={18} /></a>
          </div>
        </div>

        <FooterColumn title="Institucional" items={[
          { label: 'A Elite', url: '/about' },
          { label: 'Equipe', url: '/about#lideranca' },
          { label: 'Dossiê Elite', url: '/hub/conteudos#dossie' },
          { label: 'Contato', url: '/contact' },
        ]} />
        <FooterColumn title="Territórios" items={[
          { label: 'Advocacia especializada', url: '/solucoes/advocacia' },
          { label: 'Perícia e investigação', url: '/solucoes/pericia-digital' },
          { label: 'Inteligência e cibersegurança', url: '/solucoes/inteligencia' },
          { label: 'Gestão 360', url: '/login' },
          { label: 'Elite Academy', url: '/hub/academy' },
        ]} />
        <FooterColumn title="Acessos" items={[
          { label: 'Elite Nexus', url: '/login' },
          { label: 'Portal do cliente', url: '/login' },
          { label: 'Portal do aluno', url: '/login' },
          { label: 'Site Studio', url: '/admin/site' },
        ]} />
        <div className="elite-footer__column elite-footer__contact">
          <h3>Contato</h3>
          <a href={`tel:${contact.phone?.replace(/\D/g, '')}`}><Phone size={16} />{contact.phone}</a>
          <a href={`mailto:${contact.email}`}><Mail size={16} />{contact.email}</a>
          <span><ShieldCheck size={16} />{contact.service_area}</span>
          <Link to="/contact" className="elite-inline-link">Solicitar triagem estratégica</Link>
        </div>
      </div>

      <div className="elite-footer__bottom elite-container">
        <span>© {new Date().getFullYear()} Elite Intelligence 360. Todos os direitos reservados.</span>
        <nav>
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/termos">Termos</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/acessibilidade">Acessibilidade</Link>
        </nav>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Voltar ao topo">
          <ArrowUp size={18} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
