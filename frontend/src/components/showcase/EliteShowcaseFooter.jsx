import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Instagram,
  Linkedin,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Youtube,
} from 'lucide-react';

const EliteShowcaseFooter = ({ settings = {} }) => {
  const brand = settings.brand || {};
  const contact = settings.contact || {};

  return (
    <footer className="showcase-footer">
      <div className="showcase-footer__top showcase-shell">
        <div className="showcase-footer__brand">
          <span className="showcase-footer__eyebrow">ELITE INTELLIGENCE 360</span>
          <h2>Direito para sustentar.<br />Inteligência para decidir.<br /><em>Tecnologia para avançar.</em></h2>
          <p>
            Um ecossistema jurídico, pericial, tecnológico, educacional e de gestão criado para transformar complexidade em direção.
          </p>
          <div className="showcase-footer__signature">{brand.signature || 'Aqui é Elite. O selo é Black.'}</div>
        </div>

        <div className="showcase-footer__grid">
          <div>
            <span>Ecossistema</span>
            <a href="#a-elite">A Elite</a>
            <a href="#solucoes">Soluções estratégicas</a>
            <a href="#elite-360">Elite 360</a>
            <a href="#elite-ia">Elite IA</a>
            <a href="#academy">Elite Academy</a>
          </div>
          <div>
            <span>Acessos</span>
            <Link to="/login">Elite Nexus</Link>
            <Link to="/login">Portal do cliente</Link>
            <Link to="/login">Área do aluno</Link>
            <Link to="/admin/site">Administração geral</Link>
            <Link to="/hub">Hub de inteligência</Link>
          </div>
          <div>
            <span>Institucional</span>
            <Link to="/about">Sobre a Elite</Link>
            <Link to="/services">Áreas de atuação</Link>
            <Link to="/hub/conteudos">Conteúdos</Link>
            <Link to="/hub/eventos">Eventos</Link>
            <Link to="/contact">Contato</Link>
          </div>
          <div className="showcase-footer__contact">
            <span>Contato</span>
            <a href={`tel:${(contact.phone || '').replace(/\D/g, '')}`}><Phone size={15} />{contact.phone || '(35) 99775-2881'}</a>
            <a href={`mailto:${contact.email || 'lauracdel@eliteintelligence360.com.br'}`}><Mail size={15} />{contact.email || 'lauracdel@eliteintelligence360.com.br'}</a>
            <p><MapPin size={15} />{contact.service_area || 'Atendimento nacional'}</p>
            <Link to="/contact" className="showcase-text-link">Iniciar triagem <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </div>

      <div className="showcase-footer__security showcase-shell">
        <div><ShieldCheck size={17} /><span>Sigilo, necessidade, controle de acesso e rastreabilidade.</span></div>
        <div><LockKeyhole size={17} /><span>Dados sensíveis somente em ambientes autenticados.</span></div>
      </div>

      <div className="showcase-footer__bottom showcase-shell">
        <div>
          <strong>{brand.name || 'ELITE'} <small>{brand.descriptor || 'INTELLIGENCE 360'}</small></strong>
          <span>© 2026 Elite Intelligence 360. Todos os direitos reservados.</span>
        </div>
        <div className="showcase-footer__legal">
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/termos">Termos</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/acessibilidade">Acessibilidade</Link>
        </div>
        <div className="showcase-footer__social">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={18} /></a>
        </div>
      </div>
    </footer>
  );
};

export default EliteShowcaseFooter;
