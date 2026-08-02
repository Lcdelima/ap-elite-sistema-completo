import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Share2, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { fallbackFeatured, fallbackSettings } from '../data/eliteSiteDefaults';
import { siteCms } from '../services/siteCms';

const ContentDetail = () => {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [settings, setSettings] = useState(fallbackSettings);

  useEffect(() => {
    siteCms.bootstrap().then((data) => setSettings(data.settings || fallbackSettings)).catch(() => {});
    siteCms.contentDetail(slug).then(setContent).catch(() => {
      setContent(fallbackFeatured.find((item) => item.slug === slug) || null);
    });
  }, [slug]);

  if (!content) {
    return <div className="elite-site"><Navigation /><main className="elite-content-loading"><span>Conteúdo não encontrado.</span><Link to="/hub/conteudos">Voltar ao acervo</Link></main><Footer settings={settings} /></div>;
  }

  return (
    <div className="elite-site">
      <Navigation />
      <main>
        <article className="elite-article">
          <header className="elite-article__header">
            <div className="elite-container">
              <Link to="/hub/conteudos" className="elite-inline-link"><ArrowLeft size={15} />Voltar ao acervo</Link>
              <span className="elite-kicker">{content.eyebrow || content.category || 'CONTEÚDO ELITE'}</span>
              <h1>{content.title}</h1>
              <p>{content.excerpt}</p>
              <div className="elite-article__meta"><span><CalendarDays size={15} />{content.published_at ? new Date(content.published_at).toLocaleDateString('pt-BR') : 'Conteúdo institucional'}</span><span><ShieldCheck size={15} />{content.author || 'Elite Intelligence 360'}</span></div>
            </div>
          </header>
          <div className="elite-container elite-article__layout">
            <div className="elite-article__body">
              {(content.body || content.excerpt || '').split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              <div className="elite-article__notice"><ShieldCheck /><div><strong>Leitura responsável</strong><p>Conteúdo informativo e educacional. Não substitui análise jurídica, pericial ou técnica do caso concreto.</p></div></div>
            </div>
            <aside className="elite-article__aside">
              <div><span>TIPO</span><strong>{content.type || 'Artigo'}</strong></div><div><span>CATEGORIA</span><strong>{content.category || 'Institucional'}</strong></div>
              {(content.tags || []).length > 0 && <div><span>TAGS</span><p>{content.tags.join(' · ')}</p></div>}
              <button type="button" onClick={() => navigator.share?.({ title: content.title, url: window.location.href })}><Share2 />Compartilhar</button>
              <Link to="/contact" className="elite-button elite-button--gold">Solicitar análise <ArrowRight size={16} /></Link>
            </aside>
          </div>
        </article>
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export default ContentDetail;
