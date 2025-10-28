import React from 'react';
import { Shield, Award, CheckCircle, Calendar, MapPin, TrendingUp } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const CasosSucesso = () => {
  const cases = [
    {
      id: 1,
      title: 'Recuperação de Evidências Digitais em Fraude Corporativa',
      category: 'Perícia Digital',
      year: '2024',
      location: 'São Paulo - SP',
      description: 'Investigação complexa de fraude em empresa multinacional envolvendo análise de dispositivos móveis e recuperação de dados deletados.',
      challenges: [
        'Dispositivos com criptografia avançada',
        'Dados fragmentados em múltiplos sistemas',
        'Prazo apertado para apresentação de resultados'
      ],
      solutions: [
        'Técnicas forenses especializadas de recuperação',
        'Análise de metadados e logs de sistema',
        'Coordenação com equipe jurídica para documentação'
      ],
      results: [
        'Recuperação de 95% dos dados críticos',
        'Identificação de padrões de fraude',
        'Economia de R$ 2,3 milhões para o cliente'
      ],
      badge: 'Destaque 2024'
    },
    {
      id: 2,
      title: 'Defesa Criminal em Caso de Homicídio Doloso',
      category: 'Advocacia Criminal',
      year: '2023',
      location: 'Tres Coracoes - MG',
      description: 'Estratégia jurídica especializada resultando em redução significativa da pena em caso complexo de homicídio.',
      challenges: [
        'Evidências circunstanciais complexas',
        'Múltiplas testemunhas contraditórias',
        'Pressão midiática intensa'
      ],
      solutions: [
        'Análise técnica detalhada das evidências',
        'Contraprova pericial especializada',
        'Estratégia de defesa inovadora'
      ],
      results: [
        'Redução de pena em 60%',
        'Reconhecimento de legítima defesa',
        'Cliente em liberdade condicional'
      ],
      badge: 'Excelência Jurídica'
    },
    {
      id: 3,
      title: 'Investigação de Crimes Cibernéticos Empresariais',
      category: 'Investigação Criminal',
      year: '2024',
      location: 'Minas Gerais',
      description: 'Investigação abrangente de ataques cibernéticos contra rede empresarial com identificação dos responsáveis.',
      challenges: [
        'Ataques sofisticados com múltiplas camadas',
        'Rastros digitais complexos',
        'Coordenação internacional necessária'
      ],
      solutions: [
        'Metodologia investigativa avançada',
        'Parcerias com órgãos especializados',
        'Técnicas de rastreamento digital'
      ],
      results: [
        'Identificação de 100% dos responsáveis',
        'Recuperação de ativos digitais',
        'Prevenção de novos ataques'
      ],
      badge: 'Inovação Técnica'
    },
    {
      id: 4,
      title: 'Perícia em Local de Crime - Caso de Repercussão Nacional',
      category: 'Perícia Criminal',
      year: '2023',
      location: 'Região Sul de MG',
      description: 'Análise pericial completa em local de crime de grande repercussão, com metodologia científica rigorosa.',
      challenges: [
        'Cena do crime complexa e degradada',
        'Múltiplas linhas de investigação',
        'Pressão para resultados rápidos'
      ],
      solutions: [
        'Documentação fotográfica especializada',
        'Coleta sistemática de evidências',
        'Análise laboratorial detalhada'
      ],
      results: [
        'Laudo pericial conclusivo',
        'Identificação de evidências chave',
        'Contribuição decisiva para o caso'
      ],
      badge: 'Reconhecimento Público'
    },
    {
      id: 5,
      title: 'Consultoria Técnica em Processo de Alta Complexidade',
      category: 'Consultoria Técnica',
      year: '2024',
      location: 'Tribunal de Justiça - MG',
      description: 'Assessoria técnica especializada para escritório jurídico em processo criminal de alta complexidade técnica.',
      challenges: [
        'Aspectos técnicos multidisciplinares',
        'Necessidade de tradução técnico-jurídica',
        'Prazos processuais rigorosos'
      ],
      solutions: [
        'Análise técnica multidisciplinar',
        'Elaboração de pareceres especializados',
        'Suporte em audiências técnicas'
      ],
      results: [
        'Esclarecimento de questões técnicas complexas',
        'Vitória judicial para o cliente',
        'Reconhecimento da expertise técnica'
      ],
      badge: 'Parceria de Sucesso'
    },
    {
      id: 6,
      title: 'Treinamento Especializado para Força Policial',
      category: 'Treinamento',
      year: '2023',
      location: 'Academia de Polícia - MG',
      description: 'Programa de capacitação em técnicas modernas de investigação criminal para agentes da segurança pública.',
      challenges: [
        'Atualização de conhecimentos técnicos',
        'Adaptação às novas tecnologias',
        'Padronização de procedimentos'
      ],
      solutions: [
        'Metodologia de ensino especializada',
        'Material didático atualizado',
        'Exercícios práticos simulados'
      ],
      results: [
        '120 agentes capacitados',
        'Aumento de 40% na eficiência investigativa',
        'Implementação de novos protocolos'
      ],
      badge: 'Impacto Social'
    }
  ];

  const stats = [
    {
      number: '500+',
      label: 'Casos Atendidos',
      icon: Award,
      description: 'Mais de 500 casos resolvidos com sucesso'
    },
    {
      number: '98%',
      label: 'Taxa de Sucesso',
      icon: TrendingUp,
      description: 'Índice de resolução positiva dos casos'
    },
    {
      number: '15+',
      label: 'Anos de Experiência',
      icon: Calendar,
      description: 'Trajetória sólida em perícia criminal'
    },
    {
      number: '50+',
      label: 'Municípios Atendidos',
      icon: MapPin,
      description: 'Atuação em todo o estado de Minas Gerais'
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'Perícia Digital': 'bg-blue-500',
      'Advocacia Criminal': 'bg-red-500',
      'Investigação Criminal': 'bg-green-500',
      'Perícia Criminal': 'bg-purple-500',
      'Consultoria Técnica': 'bg-yellow-500',
      'Treinamento': 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation showBackButton={true} title="Casos de Sucesso" />
      
      {/* Header Section */}
      <section className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Casos de Sucesso
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Conheça alguns dos nossos casos mais relevantes e os resultados alcançados 
            através de metodologia científica e expertise técnica
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="card-hover bg-slate-700 border-slate-600 text-center">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-cyan-500 bg-opacity-20 rounded-full">
                        <IconComponent className="h-8 w-8 text-cyan-400" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-lg font-semibold text-cyan-400 mb-2">
                      {stat.label}
                    </div>
                    <p className="text-slate-300 text-sm">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Nossos Principais Casos
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Cada caso representa um desafio superado e uma solução encontrada através 
              de metodologia rigorosa e expertise técnica especializada
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {cases.map((case_item) => (
              <Card 
                key={case_item.id} 
                className="card-hover bg-slate-800 border-slate-700 overflow-hidden"
                data-testid={`case-card-${case_item.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={`${getCategoryColor(case_item.category)} text-white`}>
                          {case_item.category}
                        </Badge>
                        <Badge variant="outline" className="text-slate-300 border-slate-600">
                          {case_item.year}
                        </Badge>
                        <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                          {case_item.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-lg mb-2">
                        {case_item.title}
                      </CardTitle>
                      <div className="flex items-center text-slate-400 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {case_item.location}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 leading-relaxed">
                    {case_item.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Challenges */}
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        <Shield className="h-4 w-4 text-red-400 mr-2" />
                        Desafios
                      </h4>
                      <ul className="space-y-1">
                        {case_item.challenges.map((challenge, index) => (
                          <li key={index} className="text-slate-300 text-sm flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Solutions */}
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        <Award className="h-4 w-4 text-yellow-400 mr-2" />
                        Soluções
                      </h4>
                      <ul className="space-y-1">
                        {case_item.solutions.map((solution, index) => (
                          <li key={index} className="text-slate-300 text-sm flex items-start">
                            <span className="text-yellow-400 mr-2">•</span>
                            {solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Results */}
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        Resultados
                      </h4>
                      <ul className="space-y-1">
                        {case_item.results.map((result, index) => (
                          <li key={index} className="text-slate-300 text-sm flex items-start">
                            <CheckCircle className="h-3 w-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Seu Caso Pode Ser o Próximo Sucesso
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Entre em contato conosco e descubra como nossa expertise pode 
            fazer a diferença no seu caso específico.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn-primary px-8 py-3 rounded-lg text-center">
              Solicitar Consulta
            </a>
            <a href="/agendamento" className="btn-secondary px-8 py-3 rounded-lg text-center">
              Agendar Atendimento
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CasosSucesso;