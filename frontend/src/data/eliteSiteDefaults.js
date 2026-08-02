import {
  Scale,
  Fingerprint,
  Radar,
  GraduationCap,
  Gauge,
  FolderLock,
  ShieldCheck,
  Search,
  Network,
  Vote,
  Landmark,
  FileSearch,
  Headphones,
  ScanSearch,
  LockKeyhole,
  BookOpenCheck,
  Users,
  CalendarDays,
  Newspaper,
  BrainCircuit,
  Workflow,
  ChartNoAxesCombined,
  MessageSquareText,
  LibraryBig,
} from 'lucide-react';

export const fallbackSettings = {
  brand: {
    name: 'ELITE',
    descriptor: 'INTELLIGENCE 360',
    tagline: 'Inteligência que decide. Evidência que sustenta. Estratégia que transforma.',
    signature: 'Aqui é Elite. O selo é Black.',
  },
  contact: {
    phone: '(35) 99775-2881',
    email: 'lauracdel@eliteintelligence360.com.br',
    service_area: 'Atendimento nacional',
    whatsapp: '5535997752881',
  },
  features: {
    academy: true,
    community: true,
    events: true,
    newsroom: true,
    nexus: true,
    public_search: true,
  },
};

export const fallbackNavigation = [
  {
    id: 'solutions',
    label: 'Soluções',
    order: 1,
    columns: [
      {
        title: 'Jurídico e probatório',
        items: [
          { label: 'Advocacia especializada', description: 'Defesa, risco e estratégia processual', url: '/solucoes/advocacia' },
          { label: 'Perícia e prova digital', description: 'Integridade, contexto e cadeia de custódia', url: '/solucoes/pericia-digital' },
          { label: 'Investigação defensiva', description: 'Hipóteses, vínculos e cronologias', url: '/solucoes/investigacao' },
        ],
      },
      {
        title: 'Inteligência aplicada',
        items: [
          { label: 'OSINT e inteligência', description: 'Pesquisa responsável e correlação', url: '/solucoes/inteligencia' },
          { label: 'Digital e eleitoral', description: 'Prevenção e resposta supervisionada', url: '/solucoes/eleitoral' },
          { label: 'Crimes financeiros', description: 'Fluxos, documentos e risco probatório', url: '/solucoes/financeiro' },
        ],
      },
    ],
  },
  {
    id: 'intelligence',
    label: 'Ferramentas & Inteligência',
    order: 2,
    columns: [
      {
        title: 'Prova digital',
        items: [
          { label: 'Auditoria da prova', description: 'Mídia, hash, metadados e logs', url: '/hub/ferramentas#prova' },
          { label: 'Análise de transcrições', description: 'Áudio, texto, contexto e divergências', url: '/hub/ferramentas#transcricoes' },
          { label: 'Linha do tempo', description: 'Eventos, arquivos e correspondência', url: '/hub/ferramentas#timeline' },
        ],
      },
      {
        title: 'Pesquisa e decisão',
        items: [
          { label: 'Pesquisa jurídica', description: 'Legislação, precedentes e doutrina', url: '/hub/ferramentas#juridico' },
          { label: 'Agentes de IA supervisionados', description: 'Apoio à leitura e organização', url: '/hub/ferramentas#ia' },
          { label: 'Central de dossiês', description: 'Da informação dispersa ao material decisório', url: '/hub/ferramentas#dossie' },
        ],
      },
    ],
  },
  {
    id: 'content',
    label: 'Conteúdo & Pesquisa',
    order: 3,
    columns: [
      {
        title: 'Estudo estruturado',
        items: [
          { label: 'Trilhas de estudo', description: 'Percursos por tema e nível', url: '/hub/conteudos#trilhas' },
          { label: 'Artigos e pareceres', description: 'Leitura técnica e crítica', url: '/hub/conteudos#artigos' },
          { label: 'Materiais exclusivos', description: 'Checklists, matrizes e guias', url: '/hub/conteudos#materiais' },
        ],
      },
      {
        title: 'Atualizações',
        items: [
          { label: 'Central de notícias', description: 'Curadoria jurídica e tecnológica', url: '/hub/conteudos#noticias' },
          { label: 'Dossiê Elite', description: 'Pesquisa, autoridade e doutrina aplicada', url: '/hub/conteudos#dossie' },
          { label: 'Podcasts e entrevistas', description: 'Debates e convidados', url: '/hub/conteudos#podcasts' },
        ],
      },
    ],
  },
  {
    id: 'academy',
    label: 'Academy & Comunidade',
    order: 4,
    columns: [
      {
        title: 'Formação',
        items: [
          { label: 'Cursos e certificações', description: 'Formação técnica e estratégica', url: '/hub/academy#cursos' },
          { label: 'Mentorias e laboratórios', description: 'Prática guiada e casos didáticos', url: '/hub/academy#mentorias' },
          { label: 'Imersões', description: 'Experiências intensivas', url: '/hub/academy#imersoes' },
        ],
      },
      {
        title: 'Comunidade',
        items: [
          { label: 'Agenda da comunidade', description: 'Aulas, encontros e missões', url: '/hub/comunidade#agenda' },
          { label: 'Fóruns e grupos', description: 'Discussões técnicas moderadas', url: '/hub/comunidade#forum' },
          { label: 'Especialistas', description: 'Perfis e áreas de atuação', url: '/hub/comunidade#especialistas' },
        ],
      },
    ],
  },
  {
    id: 'platform',
    label: 'Plataforma',
    order: 5,
    columns: [
      {
        title: 'Meu ambiente',
        items: [
          { label: 'Elite Nexus', description: 'Login único e territórios autorizados', url: '/login' },
          { label: 'Portal do cliente', description: 'Casos, documentos, agenda e relatórios', url: '/login' },
          { label: 'Área do aluno', description: 'Aulas, atividades e certificados', url: '/login' },
        ],
      },
      {
        title: 'Operação',
        items: [
          { label: 'Gestão 360', description: 'CRM, financeiro, fluxos e indicadores', url: '/login' },
          { label: 'Central de ajuda', description: 'Guias, suporte e boas práticas', url: '/hub/plataforma#ajuda' },
          { label: 'Painel administrativo', description: 'Gestão editorial e operacional', url: '/admin/site' },
        ],
      },
    ],
  },
  {
    id: 'events',
    label: 'Eventos',
    order: 6,
    columns: [
      {
        title: 'Agenda Elite',
        items: [
          { label: 'Próximos eventos', description: 'Aulas, imersões e encontros', url: '/hub/eventos' },
          { label: 'Calendário completo', description: 'Programação por data e formato', url: '/hub/eventos#calendario' },
          { label: 'Ingressos e inscrições', description: 'Acesso às experiências disponíveis', url: '/hub/eventos#inscricoes' },
        ],
      },
    ],
  },
];

export const missions = [
  { number: '01', icon: Scale, title: 'Estratégia jurídica', description: 'Compreender riscos, defesa, prova e próximos movimentos.', url: '/solucoes/advocacia' },
  { number: '02', icon: ScanSearch, title: 'Analisar uma prova', description: 'Avaliar integridade, contexto, mídia e risco probatório.', url: '/solucoes/pericia-digital' },
  { number: '03', icon: Radar, title: 'Investigar um fato', description: 'Organizar fontes, vínculos, cronologias e hipóteses.', url: '/solucoes/investigacao' },
  { number: '04', icon: GraduationCap, title: 'Quero me especializar', description: 'Cursos, mentorias, laboratórios e certificação.', url: '/hub/academy' },
  { number: '05', icon: Workflow, title: 'Organizar minha operação', description: 'Documentos, fluxos, CRM, financeiro e indicadores.', url: '/login' },
  { number: '06', icon: LockKeyhole, title: 'Já sou cliente ou aluno', description: 'Acessar com segurança os territórios do Elite Nexus.', url: '/login' },
];

export const territories = [
  { icon: Scale, title: 'Advocacia Especializada', description: 'Direito, prova e estratégia processual.', url: '/solucoes/advocacia' },
  { icon: Fingerprint, title: 'Perícia e Investigação', description: 'Integridade, análise forense e inteligência.', url: '/solucoes/pericia-digital' },
  { icon: ShieldCheck, title: 'Inteligência e Cibersegurança', description: 'Contexto, incidentes, OSINT e prevenção.', url: '/solucoes/inteligencia' },
  { icon: GraduationCap, title: 'Elite Academy', description: 'Formação técnica, prática e estratégica.', url: '/hub/academy' },
  { icon: Gauge, title: 'Gestão 360', description: 'Operação, CRM, documentos e desempenho.', url: '/login' },
  { icon: FolderLock, title: 'Dossiê Elite', description: 'Pesquisa, organização e autoridade.', url: '/hub/conteudos#dossie' },
];

export const solutions = [
  { icon: Scale, index: '01', kicker: 'DEFESA, PROCESSO E DECISÃO', title: 'Advocacia estratégica', description: 'Atuação jurídica em demandas criminais e situações de alta complexidade, com leitura de risco, estratégia processual e integração probatória.', url: '/solucoes/advocacia' },
  { icon: Fingerprint, index: '02', kicker: 'INTEGRIDADE ANTES DA INTERPRETAÇÃO', title: 'Perícia e prova digital', description: 'Preservação, organização e análise técnica de documentos, dispositivos, imagens, áudios, vídeos, metadados e registros digitais.', url: '/solucoes/pericia-digital' },
  { icon: Network, index: '03', kicker: 'CONTEXTO, VÍNCULOS E CRONOLOGIA', title: 'Inteligência e OSINT', description: 'Pesquisa responsável em fontes abertas, correlação de informações e linhas do tempo para apoiar decisões verificáveis.', url: '/solucoes/inteligencia' },
  { icon: ShieldCheck, index: '04', kicker: 'SINAIS PÚBLICOS, RESPOSTA SUPERVISIONADA', title: 'Sentinel reputacional', description: 'Triagem de riscos públicos, preservação de conteúdo e articulação do fluxo técnico-jurídico.', url: '/solucoes/sentinel' },
  { icon: Vote, index: '05', kicker: 'PREVENÇÃO EM AMBIENTE DE PRESSÃO', title: 'Digital e eleitoral', description: 'Apoio jurídico e técnico a candidaturas, equipes e organizações em situações digitais, eleitorais e informacionais.', url: '/solucoes/eleitoral' },
  { icon: GraduationCap, index: '06', kicker: 'CONHECIMENTO QUE VIRA MÉTODO', title: 'Elite Academy', description: 'Formações, mentorias, laboratórios e materiais aplicados para profissionais do Direito, perícia e investigação.', url: '/hub/academy' },
];

export const evidenceCapabilities = [
  { icon: FileSearch, label: 'Análise forense digital' },
  { icon: ShieldCheck, label: 'Cadeia de custódia' },
  { icon: Fingerprint, label: 'Metadados e integridade' },
  { icon: Headphones, label: 'Áudio, imagem e vídeo' },
  { icon: BookOpenCheck, label: 'Laudos e pareceres' },
  { icon: Network, label: 'Reconstrução de eventos' },
  { icon: Search, label: 'Auditoria da prova digital' },
  { icon: Users, label: 'Assistência técnica' },
];

export const methodSteps = [
  { number: '01', title: 'Diagnosticar', description: 'Compreender demanda, urgência, risco, objetivo e limites.' },
  { number: '02', title: 'Organizar', description: 'Estruturar pessoas, fatos, documentos, eventos e perguntas.' },
  { number: '03', title: 'Selar integridade', description: 'Preservar mídia, hashes, origem e controle do acervo.' },
  { number: '04', title: 'Sustentar cadeia', description: 'Reconstruir recebimento, acesso, exportação e custódia.' },
  { number: '05', title: 'Interpretar', description: 'Ler lacunas, incongruências, contexto e limites da conclusão.' },
  { number: '06', title: 'Elaborar', description: 'Transformar o acervo em dossiê claro para decisão e contraditório.' },
];

export const hubFeatures = [
  { icon: BrainCircuit, title: 'Agentes de IA supervisionados', description: 'Apoio à leitura, pesquisa, organização e produção com rastreabilidade humana.' },
  { icon: LibraryBig, title: 'Acervo estruturado', description: 'Conteúdos, trilhas, artigos, materiais, jurisprudência e notícias em uma experiência unificada.' },
  { icon: Users, title: 'Comunidade profissional', description: 'Agenda, fóruns, especialistas, grupos, missões e reconhecimento por participação.' },
  { icon: CalendarDays, title: 'Eventos e imersões', description: 'Calendário, inscrições, ingressos, materiais, gravações e certificados.' },
  { icon: ChartNoAxesCombined, title: 'Gestão e desempenho', description: 'Perfis, atividades, coleções, favoritos, indicadores e permissões.' },
  { icon: Newspaper, title: 'Newsroom Elite', description: 'Curadoria jurídica, pericial, tecnológica e estratégica com governança editorial.' },
  { icon: MessageSquareText, title: 'Pesquisa em linguagem natural', description: 'Busca transversal por assunto, entidade, data, material e tipo de conteúdo.' },
  { icon: Landmark, title: 'Nexus de decisões', description: 'Ambientes protegidos para cliente, aluno, equipe, perito e administração.' },
];

export const fallbackFeatured = [
  { id: '1', type: 'article', eyebrow: 'PROVA DIGITAL', category: 'Prova digital', title: 'Cadeia de custódia começa antes da análise', slug: 'cadeia-de-custodia-comeca-antes-da-analise', excerpt: 'Como decisões iniciais de preservação condicionam a confiabilidade do acervo.' },
  { id: '2', type: 'article', eyebrow: 'INTELIGÊNCIA', category: 'Inteligência', title: 'Deepfake, contexto e preservação', slug: 'deepfake-contexto-e-preservacao', excerpt: 'O que preservar antes que a circulação do conteúdo apague parte do contexto.' },
  { id: '3', type: 'article', eyebrow: 'ESTRATÉGIA', category: 'Estratégia', title: 'O primeiro movimento define o caso', slug: 'o-primeiro-movimento-define-o-caso', excerpt: 'Antes de reagir, preserve, delimite o problema e organize as perguntas certas.' },
];
