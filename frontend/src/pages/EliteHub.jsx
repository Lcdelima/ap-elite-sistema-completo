import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  Fingerprint,
  GraduationCap,
  Landmark,
  LockKeyhole,
  MessageSquareText,
  Network,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Vote,
  Workflow,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { fallbackFeatured, fallbackSettings, hubFeatures } from '../data/eliteSiteDefaults';
import { siteCms } from '../services/siteCms';

const pageDefinitions = {
  hub: {
    eyebrow: 'ELITE HUB',
    title: 'Ferramentas, conteúdo, comunidade e plataforma em uma única experiência.',
    description: 'Um ambiente público para descobrir o ecossistema e territórios protegidos para trabalhar, estudar, acompanhar casos e administrar a operação.',
    icon: Sparkles,
  },
  ferramentas: {
    eyebrow: 'FERRAMENTAS & INTELIGÊNCIA',
    title: 'Tecnologia com supervisão humana, contexto e finalidade definida.',
    description: 'Pesquisa, leitura, transcrição, organização, auditoria, dossiês e agentes de apoio integrados à governança Elite.',
    icon: BrainCircuit,
  },
  conteudos: {
    eyebrow: 'CONTEÚDO & PESQUISA',
    title: 'Acervo estruturado para profissionais que precisam decidir melhor.',
    description: 'Trilhas, artigos, materiais, notícias, podcasts, entrevistas, livros e pesquisas conectados aos riscos reais da prática.',
    icon: BookOpenCheck,
  },
  academy: {
    eyebrow: 'ELITE ACADEMY',
    title: 'Conhecimento que sai da superfície e vira método de trabalho.',
    description: 'Cursos, mentorias, laboratórios, imersões, missões, comunidade e certificações com aplicação prática.',
    icon: GraduationCap,
  },
  comunidade: {
    eyebrow: 'COMUNIDADE ELITE',
    title: 'Aprender com método também significa construir rede, repertório e troca qualificada.',
    description: 'Agenda, fóruns moderados, grupos temáticos, especialistas, missões, reconhecimento e colaboração profissional.',
    icon: Users,
  },
  plataforma: {
    eyebrow: 'ELITE NEXUS',
    title: 'Um login. Diferentes territórios. Acesso somente ao que foi autorizado.',
    description: 'Cliente, aluno, equipe, advogado, perito, auditor e administração navegam por ambientes próprios, com permissões e auditoria.',
    icon: LockKeyhole,
  },
  eventos: {
    eyebrow: 'AGENDA ELITE',
    title: 'Experiências presenciais e digitais conectadas à formação e à prática.',
    description: 'Calendário, inscrições, ingressos, materiais, gravações, certificados e comunicação com participantes.',
    icon: CalendarDays,
  },
  pesquisa: {
    eyebrow: 'PESQUISA TRANSVERSAL',
    title: 'Encontre assuntos, materiais, cursos, eventos e soluções.',
    description: 'A pesquisa pública percorre o acervo editorial. Dados operacionais e de clientes permanecem protegidos no Nexus.',
    icon: Search,
  },
};

const territoryDefinitions = {
  advocacia: {
    eyebrow: 'ADVOCACIA ESPECIALIZADA',
    title: 'Direito, prova e estratégia para demandas de alta complexidade.',
    description: 'Leitura de risco, planejamento processual, integração probatória, resposta documentada e coordenação com especialistas.',
    icon: Landmark,
    capabilities: ['Estratégia criminal e processual', 'Análise de risco e cenários', 'Integração com assistência técnica', 'Memoriais, pareceres e dossiês', 'Atuação preventiva e contenciosa', 'Coordenação em grandes operações'],
  },
  'pericia-digital': {
    eyebrow: 'PERÍCIA E PROVA DIGITAL',
    title: 'A prova precisa ser preservada, compreendida e verificável.',
    description: 'Análise forense, cadeia de custódia, metadados, mídia, logs, cronologia, integridade, laudos e pareceres.',
    icon: Fingerprint,
    capabilities: ['Triagem e protocolo de recebimento', 'Análise de documentos e dispositivos', 'Áudio, imagem e vídeo', 'Metadados, hashes e logs', 'Reconstrução de eventos', 'Laudos e assistência técnica'],
  },
  investigacao: {
    eyebrow: 'INVESTIGAÇÃO DEFENSIVA',
    title: 'Hipóteses não são fatos. O método separa, testa e documenta.',
    description: 'Organização de fontes, pessoas, vínculos, eventos, cronologias, lacunas e providências sob supervisão jurídica.',
    icon: Network,
    capabilities: ['Plano de investigação', 'Matriz de hipóteses', 'Linha do tempo', 'Mapeamento de vínculos', 'Gestão de fontes e documentos', 'Relatórios verificáveis'],
  },
  inteligencia: {
    eyebrow: 'INTELIGÊNCIA & OSINT',
    title: 'Pesquisa responsável para decisões que exigem contexto.',
    description: 'Fontes abertas, monitoramento, análise de vínculos, inteligência reputacional, risco e prevenção em ambiente digital.',
    icon: BrainCircuit,
    capabilities: ['OSINT supervisionada', 'Monitoramento de sinais públicos', 'Inteligência reputacional', 'Análise de redes e vínculos', 'Cibersegurança e incidentes', 'Relatórios de contexto'],
  },
  eleitoral: {
    eyebrow: 'DIGITAL & ELEITORAL',
    title: 'No ambiente eleitoral, prevenir é mais estratégico do que reagir tarde.',
    description: 'Apoio jurídico e técnico a candidaturas, equipes, partidos e organizações em riscos digitais, reputacionais e probatórios.',
    icon: Vote,
    capabilities: ['Monitoramento de risco', 'Protocolo de preservação', 'Conteúdo e propaganda', 'Crises e resposta rápida', 'Evidências digitais', 'Relatórios e estratégia'],
  },
  financeiro: {
    eyebrow: 'CRIMES FINANCEIROS',
    title: 'Fluxos, documentos e vínculos precisam ser lidos em conjunto.',
    description: 'Estratégia jurídica integrada à leitura de movimentações, documentos, comunicações e evidências digitais em casos complexos.',
    icon: ChartNoAxesCombined,
    capabilities: ['Matriz de fluxos', 'Cronologia financeira', 'Análise documental', 'Vínculos entre atores', 'Risco probatório', 'Estratégia defensiva'],
  },
  sentinel: {
    eyebrow: 'SENTINEL REPUTACIONAL',
    title: 'Sinais públicos exigem triagem, preservação e resposta supervisionada.',
    description: 'Uma camada integrada de monitoramento, evidência digital e orientação jurídica para reduzir reação impulsiva e perda de contexto.',
    icon: ShieldCheck,
    capabilities: ['Monitoramento de menções', 'Preservação de conteúdo', 'Classificação de risco', 'Fluxo de resposta', 'Dossiê de incidente', 'Governança reputacional'],
  },
};

const Pill = ({ children }) => <span className="elite-hub-pill">{children}</span>;

const EliteHub = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [settings, setSettings] = useState(fallbackSettings);
  const [contents, setContents] = useState(fallbackFeatured);
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') || '');
  const [loading, setLoading] = useState(false);

  const isTerritory = location.pathname.startsWith('/solucoes/');
  const segment = isTerritory ? params.slug : (params.section || 'hub');
  const definition = isTerritory ? (territoryDefinitions[segment] || territoryDefinitions.advocacia) : (pageDefinitions[segment] || pageDefinitions.hub);
  const Icon = definition.icon;

  useEffect(() => {
    siteCms.bootstrap().then((data) => setSettings(data.settings || fallbackSettings)).catch(() => {});
  }, []);

  useEffect(() => {
    if (segment === 'pesquisa' && query.trim().length >= 2) {
      setLoading(true);
      siteCms.search(query).then((data) => setContents(data.results || [])).catch(() => setContents([])).finally(() => setLoading(false));
      return;
    }
    siteCms.content({ limit: 24 }).then((data) => data.length && setContents(data)).catch(() => {});
  }, [segment]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitSearch = (event) => {
    event.preventDefault();
    if (query.trim().length < 2) return;
    navigate(`/hub/pesquisa?q=${encodeURIComponent(query.trim())}`);
    setLoading(true);
    siteCms.search(query.trim()).then((data) => setContents(data.results || [])).catch(() => setContents([])).finally(() => setLoading(false));
  };

  const featureCards = useMemo(() => {
    if (isTerritory) return (definition.capabilities || []).map((title, index) => ({
      title,
      description: [
        'Escopo definido, responsáveis identificados e documentação do percurso.',
        'Leitura integrada para separar fatos, hipóteses, indícios e riscos.',
        'Comunicação clara com cliente, equipe e especialistas envolvidos.',
      ][index % 3],
      icon: [ShieldCheck, Search, Workflow, Fingerprint, Network, MessageSquareText][index % 6],
    }));
    return hubFeatures;
  }, [definition, isTerritory]);

  return (
    <div className="elite-site">
      <Navigation />
      <main>
        <section className="elite-hub-hero">
          <div className="elite-container elite-hub-hero__layout">
            <div>
              <span className="elite-kicker">{definition.eyebrow}</span>
              <h1>{definition.title}</h1>
              <p>{definition.description}</p>
              <div className="elite-hero__actions">
                {isTerritory ? (
                  <>
                    <Link to="/contact" className="elite-button elite-button--gold">Solicitar triagem <ArrowRight size={17} /></Link>
                    <Link to="/hub/conteudos" className="elite-button elite-button--ghost">Explorar conteúdo</Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="elite-button elite-button--gold"><LockKeyhole size={16} />Acessar Nexus</Link>
                    <Link to="/contact" className="elite-button elite-button--ghost">Falar com a Elite</Link>
                  </>
                )}
              </div>
            </div>
            <div className="elite-hub-hero__visual">
              <Icon size={92} />
              <div className="elite-hub-hero__orbit orbit-one" /><div className="elite-hub-hero__orbit orbit-two" />
              <span className="elite-hub-hero__node node-a" /><span className="elite-hub-hero__node node-b" /><span className="elite-hub-hero__node node-c" />
              <small>ELITE CORE UI</small><strong>360°</strong>
            </div>
          </div>
        </section>

        {segment === 'pesquisa' && (
          <section className="elite-section elite-section--paper elite-search-page">
            <div className="elite-container">
              <form onSubmit={submitSearch} className="elite-search-page__form">
                <Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquise por assunto, tipo ou palavra-chave" /><button className="elite-button elite-button--dark">Pesquisar</button>
              </form>
              <div className="elite-search-page__meta">{loading ? 'Pesquisando...' : `${contents.length} resultado(s) localizado(s)`}</div>
            </div>
          </section>
        )}

        <section className="elite-section elite-section--paper">
          <div className="elite-container">
            <div className="elite-hub-intro">
              <div><span className="elite-kicker">ARQUITETURA DA EXPERIÊNCIA</span><h2>{isTerritory ? 'Atuação com escopo, método e coordenação.' : 'Tudo o que importa, sem transformar o site em um labirinto.'}</h2></div>
              <p>{isTerritory ? 'Cada frente pode operar isoladamente ou em conjunto, conforme o caso concreto. A triagem define limites, responsáveis, objetivos e o ambiente adequado para documentos sensíveis.' : 'A navegação pública permite descobrir. O Nexus permite trabalhar. O Site Studio permite administrar. A governança liga as três camadas.'}</p>
            </div>
            <div className="elite-hub-feature-grid">
              {featureCards.map(({ icon: FeatureIcon, title, description }) => (
                <article className="elite-hub-feature" key={title}><FeatureIcon /><h3>{title}</h3><p>{description}</p><span className="elite-inline-link">Conhecer <ArrowRight size={14} /></span></article>
              ))}
            </div>
          </div>
        </section>

        {!isTerritory && segment !== 'pesquisa' && (
          <section className="elite-section elite-section--black elite-hub-showcase">
            <div className="elite-container">
              <div className="elite-hub-showcase__head"><div><span className="elite-kicker">EXPERIÊNCIA UNIFICADA</span><h2>Do menu ao ambiente autenticado.</h2></div><p>Um padrão visual e funcional consistente reduz a curva de aprendizado e preserva a identidade Elite em todos os territórios.</p></div>
              <div className="elite-hub-showcase__screens">
                {['Pesquisar e descobrir', 'Organizar e acompanhar', 'Aprender e colaborar', 'Administrar e publicar'].map((title, index) => (
                  <div key={title} className={`elite-hub-screen screen-${index + 1}`}><div><i /><i /><i /></div><span>0{index + 1}</span><h3>{title}</h3><p>{['Conteúdo, ferramentas, soluções e eventos.', 'Casos, documentos, tarefas e comunicações.', 'Trilhas, missões, fóruns e certificados.', 'CMS, menu, mídia, SEO, leads e auditoria.'][index]}</p></div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="elite-section elite-section--content">
          <div className="elite-container">
            <div className="elite-content-heading-row"><div><span className="elite-kicker">ACERVO ELITE</span><h2>{segment === 'pesquisa' ? 'Resultados da pesquisa' : 'Conteúdo conectado a este território.'}</h2></div><div className="elite-hub-filters"><Pill>Artigos</Pill><Pill>Materiais</Pill><Pill>Eventos</Pill><Pill>Formações</Pill></div></div>
            <div className="elite-content-grid">
              {contents.slice(0, 9).map((item, index) => (
                <Link to={`/conteudo/${item.slug}`} className="elite-content-card" key={item.id || item.slug}>
                  <div className={`elite-content-card__visual visual-${(index % 3) + 1}`}>{index % 3 === 0 ? <Fingerprint /> : index % 3 === 1 ? <Newspaper /> : <BrainCircuit />}</div>
                  <small>{item.eyebrow || item.category || item.type}</small><h3>{item.title}</h3><p>{item.excerpt || 'Conteúdo técnico e estratégico da Elite Intelligence 360.'}</p><span className="elite-inline-link">Abrir conteúdo <ArrowRight size={15} /></span>
                </Link>
              ))}
              {!loading && contents.length === 0 && <div className="elite-empty-state"><Search /><h3>Nenhum conteúdo localizado.</h3><p>Tente outro termo ou explore os territórios do Hub.</p></div>}
            </div>
          </div>
        </section>

        <section className="elite-section elite-section--cta">
          <div className="elite-container elite-hub-final-cta">
            <div><span className="elite-kicker">PRÓXIMO MOVIMENTO</span><h2>{isTerritory ? 'Sua demanda precisa de leitura inicial antes de qualquer promessa.' : 'Entre no território certo com segurança.'}</h2><p>{isTerritory ? 'A triagem identifica escopo, urgência, riscos, documentação disponível e a necessidade de integração entre áreas.' : 'O Elite Nexus organiza acessos para clientes, alunos, equipe e administração, preservando permissões e contexto.'}</p></div>
            <div className="elite-hero__actions"><Link to={isTerritory ? '/contact' : '/login'} className="elite-button elite-button--gold">{isTerritory ? 'Solicitar análise' : 'Entrar no Nexus'} <ArrowRight size={17} /></Link><Link to="/" className="elite-button elite-button--ghost">Voltar ao ecossistema</Link></div>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export default EliteHub;
