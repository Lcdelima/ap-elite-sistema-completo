import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Fingerprint,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import {
  evidenceCapabilities,
  fallbackFeatured,
  fallbackSettings,
  hubFeatures,
  methodSteps,
  missions,
  solutions,
  territories,
} from '../data/eliteSiteDefaults';
import { siteCms } from '../services/siteCms';

const SectionHeading = ({ eyebrow, title, body, align = 'left' }) => (
  <div className={`elite-section-heading elite-section-heading--${align}`}>
    {eyebrow && <span className="elite-kicker">{eyebrow}</span>}
    <h2>{title}</h2>
    {body && <p>{body}</p>}
  </div>
);

const VisualCommandCenter = () => (
  <div className="elite-command" aria-label="Representação abstrata do ecossistema de inteligência Elite">
    <div className="elite-command__grid" />
    <div className="elite-command__network">
      {[0, 1, 2, 3, 4, 5, 6].map((node) => <span key={node} className={`node node-${node}`} />)}
      <i className="line line-1" /><i className="line line-2" /><i className="line line-3" /><i className="line line-4" />
    </div>
    <div className="elite-command__dossier">
      <span className="elite-command__dossier-label">DOSSIÊ SEGURO</span>
      <ShieldCheck size={58} />
      <strong>ELITE 360</strong>
      <small>integridade · contexto · estratégia</small>
    </div>
    <div className="elite-command__fingerprint"><Fingerprint size={98} /><span>evidência #2471</span></div>
    <div className="elite-command__panel panel-a"><span>ANÁLISE FORENSE</span><b>HASH VERIFICADO</b><i /></div>
    <div className="elite-command__panel panel-b"><span>RISCO</span><b>CONTROLADO</b><i /></div>
    <div className="elite-command__seal">E</div>
  </div>
);

const Home = () => {
  const [siteData, setSiteData] = useState(null);

  useEffect(() => {
    let mounted = true;
    siteCms.bootstrap().then((data) => mounted && setSiteData(data)).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const settings = siteData?.settings || fallbackSettings;
  const featured = siteData?.featured?.length ? siteData.featured : fallbackFeatured;
  const hero = siteData?.home?.sections?.find((section) => section.id === 'hero') || {
    eyebrow: 'UM ECOSSISTEMA · DIFERENTES TERRITÓRIOS',
    title: settings.brand.tagline,
    body: 'A Elite integra Direito, perícia, investigação, tecnologia, educação e gestão para converter complexidade em leitura estratégica, prova tecnicamente defensável e decisão responsável.',
    primary_cta: { label: 'Conhecer o ecossistema', url: '#ecossistema' },
    secondary_cta: { label: 'Acessar Elite Nexus', url: '/login' },
  };

  const metrics = useMemo(() => [
    { value: '360°', label: 'visão integrada' },
    { value: '06', label: 'territórios coordenados' },
    { value: '01', label: 'identidade e governança' },
  ], []);

  return (
    <div className="elite-site">
      <Navigation siteData={siteData} />

      <main>
        <section className="elite-hero">
          <div className="elite-hero__noise" />
          <div className="elite-container elite-hero__layout">
            <div className="elite-hero__copy">
              <span className="elite-kicker">{hero.eyebrow}</span>
              <h1>
                <span>Inteligência que decide.</span>
                <span>Evidência que sustenta.</span>
                <em>Estratégia que transforma.</em>
              </h1>
              <p>{hero.body}</p>
              <div className="elite-hero__actions">
                <a href={hero.primary_cta?.url || '#ecossistema'} className="elite-button elite-button--gold">
                  {hero.primary_cta?.label || 'Conhecer o ecossistema'}<ArrowRight size={17} />
                </a>
                <Link to={hero.secondary_cta?.url || '/login'} className="elite-button elite-button--ghost">
                  <LockKeyhole size={16} />{hero.secondary_cta?.label || 'Acessar Elite Nexus'}
                </Link>
              </div>
              <div className="elite-hero__trust">
                <ShieldCheck size={18} />
                <span>Triagem responsável · Sigilo por necessidade · Evidência recebida somente em ambiente protegido</span>
              </div>
            </div>
            <VisualCommandCenter />
          </div>
          <div className="elite-container elite-hero__metrics">
            {metrics.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}
          </div>
        </section>

        <section id="ecossistema" className="elite-section elite-section--paper elite-territories-section">
          <div className="elite-container">
            <SectionHeading
              eyebrow="MARCA-MÃE"
              title="Um ecossistema. Diferentes territórios."
              body="Uma única identidade institucional. Competências coordenadas conforme a missão, sem misturar funções, públicos ou responsabilidades."
              align="center"
            />
            <div className="elite-territories">
              {territories.map(({ icon: Icon, title, description, url }, index) => (
                <Link to={url} className="elite-territory-card" key={title}>
                  <span className="elite-territory-card__index">0{index + 1}</span>
                  <span className="elite-territory-card__icon"><Icon /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="elite-inline-link">Explorar território <ArrowRight size={15} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="elite-section elite-section--navy">
          <div className="elite-container">
            <SectionHeading
              eyebrow="01 · QUAL É A SUA MISSÃO?"
              title="Você não precisa conhecer nossa estrutura para encontrar o caminho certo."
              body="Escolha o que precisa resolver. A Elite apresenta a frente adequada e organiza a entrada para o setor responsável."
            />
            <div className="elite-missions">
              {missions.map(({ number, icon: Icon, title, description, url }) => (
                <Link to={url} key={title} className="elite-mission-card">
                  <span>{number}</span><Icon /><h3>{title}</h3><p>{description}</p><ArrowRight size={18} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="elite-section elite-section--paper elite-positioning">
          <div className="elite-container elite-positioning__layout">
            <div>
              <SectionHeading
                eyebrow="02 · POSICIONAMENTO"
                title="Quando o caso é complexo, a resposta precisa ser integrada."
                body="Informação dispersa precisa virar entendimento. Vestígio precisa virar evidência auditável. Evidência precisa conversar com a decisão."
              />
              <Link to="/about" className="elite-inline-link elite-inline-link--dark">Conheça nossa atuação <ArrowRight size={17} /></Link>
            </div>
            <div className="elite-principles">
              {[
                ['Método', 'Nenhuma conclusão sem percurso documentado.'],
                ['Sigilo', 'Informação sensível tratada com necessidade, limite e responsabilidade.'],
                ['Precisão', 'Fatos, indícios, hipóteses e interpretações permanecem separados.'],
                ['Integração', 'Direito, tecnologia, investigação e gestão operam no mesmo fluxo.'],
              ].map(([title, text], index) => (
                <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="elite-section elite-section--black">
          <div className="elite-container">
            <SectionHeading
              eyebrow="03 · SOLUÇÕES INTEGRADAS"
              title="Especialidades que operam juntas."
              body="Da primeira triagem à resposta documentada, cada unidade contribui com método, escopo e responsabilidade definidos."
            />
            <div className="elite-solutions">
              {solutions.map(({ icon: Icon, index, kicker, title, description, url }) => (
                <Link to={url} className="elite-solution-card" key={title}>
                  <div className="elite-solution-card__top"><span>{index}</span><Icon /></div>
                  <small>{kicker}</small><h3>{title}</h3><p>{description}</p>
                  <span className="elite-inline-link">Solicitar análise <ArrowRight size={15} /></span>
                </Link>
              ))}
            </div>
            <div className="elite-section-action"><Link to="/services" className="elite-button elite-button--outline-gold">Conhecer todas as soluções <ArrowRight size={17} /></Link></div>
          </div>
        </section>

        <section className="elite-section elite-section--evidence">
          <div className="elite-container elite-evidence-layout">
            <div className="elite-evidence-copy">
              <span className="elite-kicker">PROVA E EVIDÊNCIA DIGITAL</span>
              <h2>A prova não precisa apenas existir.<br /><em>Ela precisa resistir.</em></h2>
              <p>Legalidade, origem, contexto, integridade, rastreabilidade e cadeia de custódia são tratados desde o primeiro contato. Evidências sensíveis somente são recebidas em área protegida após triagem e autorização.</p>
              <Link to="/solucoes/pericia-digital" className="elite-button elite-button--gold">Conhecer a perícia <ArrowRight size={17} /></Link>
            </div>
            <div className="elite-evidence-grid">
              {evidenceCapabilities.map(({ icon: Icon, label }) => (
                <div key={label}><Icon /><span>{label}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="elite-section elite-section--paper">
          <div className="elite-container">
            <SectionHeading
              eyebrow="04 · MÉTODO D.O.S.S.I.Ê"
              title="Do ruído à evidência. Da evidência à decisão."
              body="Um fluxo técnico e estratégico para dar ordem ao acervo, reduzir improviso e tornar cada conclusão compreensível e verificável."
              align="center"
            />
            <div className="elite-method">
              {methodSteps.map((step, index) => (
                <div className="elite-method__step" key={step.title}>
                  <div className="elite-method__number">{step.number}</div>
                  <div className="elite-method__connector" />
                  <h3>{step.title}</h3><p>{step.description}</p>
                  {index < methodSteps.length - 1 && <ArrowRight className="elite-method__arrow" size={19} />}
                </div>
              ))}
            </div>
            <div className="elite-method__manifesto">
              <span>D</span><span>O</span><span>S</span><span>S</span><span>I</span><span>Ê</span>
              <p>Diagnosticar · Organizar · Selar · Sustentar · Interpretar · Elaborar</p>
            </div>
          </div>
        </section>

        <section className="elite-section elite-section--academy">
          <div className="elite-container elite-academy-layout">
            <div className="elite-academy-seal">
              <div><GraduationCap size={62} /><strong>ELITE</strong><span>ACADEMY</span></div>
            </div>
            <div>
              <span className="elite-kicker">06 · ELITE ACADEMY</span>
              <h2>Conhecimento que move líderes.</h2>
              <p>Formação técnica, prática e estratégica para profissionais que não aceitam atuar no improviso. Trilhas, cursos, mentorias, laboratórios, comunidade, eventos e certificações em uma experiência integrada.</p>
              <blockquote>“Não seja a peça. Leia o tabuleiro.”</blockquote>
              <div className="elite-hero__actions">
                <Link to="/hub/academy" className="elite-button elite-button--gold">Conhecer as formações <ArrowRight size={17} /></Link>
                <Link to="/hub/academy#doutrina" className="elite-button elite-button--ghost">Explorar a Doutrina Black</Link>
              </div>
            </div>
            <div className="elite-academy-door" aria-hidden="true"><span /><i /><b>ACESSO</b></div>
          </div>
        </section>

        <section className="elite-section elite-section--navy elite-platform-section">
          <div className="elite-container">
            <SectionHeading
              eyebrow="07 · TECNOLOGIA PROPRIETÁRIA"
              title="Tecnologia a serviço da inteligência e da justiça."
              body="Ambientes diferentes para cada público, unidos pelo Elite Core UI, login único, permissões granulares e auditoria."
            />
            <div className="elite-platform-grid">
              {[
                ['NEXUS', 'Elite Nexus', 'Login único e acesso somente aos territórios autorizados.', '/login'],
                ['CLIENTE', 'Portal protegido', 'Casos, documentos, agenda, mensagens e relatórios com discrição.', '/login'],
                ['OPERAÇÃO', 'Gestão 360', 'CRM, financeiro, documentos, projetos, perícias e auditoria.', '/login'],
                ['FORMAÇÃO', 'Elite Academy', 'Aulas, missões, atividades, comunidade e certificações.', '/hub/academy'],
              ].map(([kicker, title, description, url], index) => (
                <Link to={url} className="elite-platform-card" key={title}>
                  <div className={`elite-platform-card__screen screen-${index + 1}`}><span /><i /><b /></div>
                  <small>{kicker}</small><h3>{title}</h3><p>{description}</p><span className="elite-inline-link">Acessar ambiente <ArrowRight size={15} /></span>
                </Link>
              ))}
            </div>
            <p className="elite-platform-disclaimer"><LockKeyhole size={15} />Indicadores operacionais, dados de casos e informações sensíveis são exibidos somente em ambientes autenticados.</p>
          </div>
        </section>

        <section className="elite-section elite-section--paper elite-hub-section">
          <div className="elite-container">
            <SectionHeading
              eyebrow="PLATAFORMA DE CONHECIMENTO E COMUNIDADE"
              title="Mais do que um site. Um hub vivo de inteligência profissional."
              body="A Elite reúne as experiências que você espera de uma plataforma premium: ferramentas, acervo, formação, comunidade, eventos, pesquisa e área pessoal — com identidade própria e integração ao Nexus."
              align="center"
            />
            <div className="elite-hub-grid">
              {hubFeatures.map(({ icon: Icon, title, description }) => (
                <div className="elite-hub-card" key={title}><Icon /><h3>{title}</h3><p>{description}</p></div>
              ))}
            </div>
            <div className="elite-section-action"><Link to="/hub" className="elite-button elite-button--dark">Explorar o Hub Elite <ArrowRight size={17} /></Link></div>
          </div>
        </section>

        <section className="elite-section elite-section--content">
          <div className="elite-container">
            <div className="elite-content-heading-row">
              <SectionHeading eyebrow="CONTEÚDO E AUTORIDADE" title="Análise para quem precisa decidir." body="Materiais técnicos conectados aos riscos reais de cada área." />
              <Link to="/hub/conteudos" className="elite-inline-link">Ver todos os conteúdos <ArrowRight size={16} /></Link>
            </div>
            <div className="elite-content-grid">
              {featured.slice(0, 3).map((item, index) => (
                <Link to={`/conteudo/${item.slug}`} className="elite-content-card" key={item.id || item.slug}>
                  <div className={`elite-content-card__visual visual-${index + 1}`}>
                    {index === 0 ? <Fingerprint /> : index === 1 ? <BrainCircuit /> : <Sparkles />}
                  </div>
                  <small>{item.eyebrow || item.category}</small><h3>{item.title}</h3><p>{item.excerpt}</p>
                  <span className="elite-inline-link">Ler abordagem <ArrowRight size={15} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="elite-section elite-section--cta">
          <div className="elite-container elite-cta-layout">
            <div>
              <span className="elite-kicker">ATENDIMENTO ESTRATÉGICO</span>
              <h2>Seu caso exige método antes de movimento.</h2>
              <p>Conte-nos o essencial, sem anexar evidências sensíveis. A equipe fará a triagem inicial com confidencialidade e responsabilidade.</p>
              <ul>
                {['Análise de contexto e urgência', 'Definição do território responsável', 'Orientação segura para envio de material'].map((item) => <li key={item}><Check size={16} />{item}</li>)}
              </ul>
            </div>
            <form className="elite-contact-preview" action="/contact">
              <div><label>Nome</label><input name="name" placeholder="Seu nome completo" /></div>
              <div><label>E-mail</label><input name="email" type="email" placeholder="seu@email.com" /></div>
              <div><label>Tipo de demanda</label><select name="subject"><option>Selecione</option><option>Advocacia especializada</option><option>Perícia digital</option><option>Investigação</option><option>Eleitoral e reputacional</option><option>Formação</option></select></div>
              <div><label>Mensagem inicial</label><textarea name="message" placeholder="Descreva o objetivo e a urgência sem expor dados sensíveis." /></div>
              <button type="submit" className="elite-button elite-button--gold">Solicitar análise estratégica <LockKeyhole size={16} /></button>
              <small>O envio deste formulário não constitui contratação nem substitui análise jurídica ou pericial formal.</small>
            </form>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
};

export default Home;
