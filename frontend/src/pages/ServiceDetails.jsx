import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Search, FileText, Users, Eye, Scale, CheckCircle, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default detailed services data
  const servicesData = {
    '1': {
      id: '1',
      title: 'Perícia Criminal Técnica',
      description: 'Análise técnico-científica de evidências e vestígios criminais com metodologia rigorosa e relatórios detalhados.',
      icon: Shield,
      category: 'pericia',
      detailedDescription: 'Nossa perícia criminal técnica utiliza metodologias científicas avançadas para análise de evidências e vestígios encontrados em locais de crime. Realizamos exames detalhados, documentação fotográfica e elaboração de laudos periciais que atendem aos mais altos padrões técnicos e científicos.',
      features: [
        'Exame detalhado de locais de crime',
        'Análise de evidências físicas',
        'Documentação fotográfica profissional',
        'Coleta e preservação de vestígios',
        'Elaboração de laudos periciais',
        'Análise de padrões criminais',
        'Reconstrução de cenas de crime',
        'Consultoria técnica especializada'
      ],
      process: [
        'Análise inicial do caso e planejamento',
        'Exame do local e coleta de evidências',
        'Análises laboratoriais especializadas',
        'Documentação técnica detalhada',
        'Elaboração do laudo pericial',
        'Apresentação dos resultados'
      ]
    },
    '2': {
      id: '2',
      title: 'Investigação Criminal Estratégica',
      description: 'Desenvolvimento de estratégias investigativas avançadas para elucidação de crimes complexos.',
      icon: Search,
      category: 'investigacao',
      detailedDescription: 'Desenvolvemos estratégias investigativas personalizadas para cada caso, utilizando técnicas modernas de investigação e análise de dados para elucidar crimes complexos de forma eficiente e precisa.',
      features: [
        'Planejamento investigativo estratégico',
        'Coleta de informações especializadas',
        'Análise de dados e evidências',
        'Desenvolvimento de linhas investigativas',
        'Técnicas avançadas de investigação',
        'Análise de padrões comportamentais',
        'Investigação digital e eletrônica',
        'Relatórios de investigação detalhados'
      ],
      process: [
        'Avaliação inicial do caso',
        'Definição de estratégias investigativas',
        'Execução das ações planejadas',
        'Análise e correlação de dados',
        'Desenvolvimento de conclusões',
        'Relatório final de investigação'
      ]
    },
    '3': {
      id: '3',
      title: 'Consultoria Técnica Jurídica',
      description: 'Assessoria especializada para advogados e escritórios jurídicos em casos criminais.',
      icon: Scale,
      category: 'consultoria',
      detailedDescription: 'Oferecemos assessoria técnica especializada para profissionais do direito, auxiliando na compreensão de aspectos técnicos e científicos de casos criminais, elaboração de estratégias jurídicas e preparação para audiências.',
      features: [
        'Análise técnica de processos',
        'Orientação técnica especializada',
        'Elaboração de pareceres técnicos',
        'Suporte em audiências judiciais',
        'Preparação de quesitos periciais',
        'Revisão de laudos técnicos',
        'Consultoria em estratégia jurídica',
        'Treinamento de equipes jurídicas'
      ],
      process: [
        'Análise do processo e documentos',
        'Identificação de questões técnicas',
        'Elaboração de parecer especializado',
        'Discussão de estratégias jurídicas',
        'Suporte na preparação do caso',
        'Acompanhamento em audiências'
      ]
    },
    '4': {
      id: '4',
      title: 'Análise Forense Digital',
      description: 'Perícia em dispositivos eletrônicos e análise de evidências digitais.',
      icon: Eye,
      category: 'forense',
      detailedDescription: 'Realizamos perícias especializadas em dispositivos eletrônicos, recuperação de dados e análise de evidências digitais, utilizando ferramentas e técnicas avançadas para garantir a integridade e autenticidade das informações.',
      features: [
        'Perícia em dispositivos móveis',
        'Análise de computadores e laptops',
        'Recuperação de dados deletados',
        'Exame de mídias digitais',
        'Análise de comunicações eletrônicas',
        'Investigação de crimes cibernéticos',
        'Preservação de evidências digitais',
        'Relatórios técnicos especializados'
      ],
      process: [
        'Coleta e preservação de dispositivos',
        'Análise forense dos dados',
        'Recuperação de informações',
        'Validação das evidências encontradas',
        'Documentação técnica detalhada',
        'Apresentação dos resultados'
      ]
    },
    '5': {
      id: '5',
      title: 'Elaboração de Relatórios',
      description: 'Confecção de relatórios técnicos e laudos periciais com rigor científico.',
      icon: FileText,
      category: 'relatorios',
      detailedDescription: 'Elaboramos relatórios técnicos, laudos periciais e pareceres especializados com rigor científico e metodológico, atendendo às necessidades específicas de cada caso e aos padrões exigidos pelo sistema judiciário.',
      features: [
        'Laudos periciais especializados',
        'Relatórios de investigação',
        'Pareceres técnicos',
        'Análises comparativas',
        'Documentação fotográfica',
        'Gráficos e diagramas técnicos',
        'Cronologia de eventos',
        'Conclusões fundamentadas'
      ],
      process: [
        'Coleta e organização de dados',
        'Análise técnica detalhada',
        'Estruturação do documento',
        'Revisão técnica e metodológica',
        'Finalização e entrega',
        'Suporte pós-entrega'
      ]
    },
    '6': {
      id: '6',
      title: 'Treinamento e Capacitação',
      description: 'Cursos e treinamentos para profissionais da área de segurança pública e jurídica.',
      icon: Users,
      category: 'treinamento',
      detailedDescription: 'Oferecemos programas de treinamento e capacitação para profissionais da área de segurança pública, direito e perícia, abordando técnicas modernas de investigação, metodologias científicas e melhores práticas na área criminal.',
      features: [
        'Cursos de perícia criminal',
        'Treinamento em investigação',
        'Workshops especializados',
        'Capacitação em técnicas forenses',
        'Seminários técnicos',
        'Certificação profissional',
        'Material didático especializado',
        'Acompanhamento personalizado'
      ],
      process: [
        'Avaliação das necessidades de treinamento',
        'Desenvolvimento do programa',
        'Execução dos módulos de capacitação',
        'Avaliação do aprendizado',
        'Certificação dos participantes',
        'Suporte continuado'
      ]
    }
  };

  useEffect(() => {
    const serviceData = servicesData[id];
    if (serviceData) {
      setService(serviceData);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation showBackButton={true} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation showBackButton={true} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl text-white mb-4">Serviço não encontrado</h1>
            <Link to="/services">
              <Button className="btn-primary">Voltar aos Serviços</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = service.icon;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation showBackButton={true} title={service.title} />
      
      {/* Header Section */}
      <section className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-cyan-500 bg-opacity-20 rounded-full">
                <IconComponent className="h-12 w-12 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              {service.title}
            </h1>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto">
              {service.description}
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Description */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Descrição Detalhada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {service.detailedDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    O que está incluído
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Process */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Como Trabalhamos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {service.process.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 bg-opacity-20 rounded-full flex items-center justify-center">
                          <span className="text-cyan-400 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div className="pt-1">
                          <p className="text-slate-300">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA Card */}
              <Card className="bg-gradient-to-br from-cyan-900 to-blue-900 border-cyan-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Interessado neste serviço?
                  </h3>
                  <p className="text-cyan-100 mb-6 text-sm">
                    Entre em contato conosco para discutir suas necessidades específicas e receber um atendimento personalizado.
                  </p>
                  
                  <div className="space-y-3">
                    <Link to="/contact" className="block">
                      <Button className="btn-primary w-full" data-testid="service-contact-button">
                        Solicitar Orçamento
                      </Button>
                    </Link>
                    
                    <Link to="/services" className="block">
                      <Button variant="outline" className="btn-secondary w-full">
                        Ver Outros Serviços
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Contato Direto
                  </h3>
                  <div className="space-y-3 text-sm">
                    <p className="text-slate-300">
                      <strong className="text-white">Telefone:</strong> (xx) xxxx-xxxx
                    </p>
                    <p className="text-slate-300">
                      <strong className="text-white">E-mail:</strong> contato@apelite.com.br
                    </p>
                    <p className="text-slate-300">
                      <strong className="text-white">Atendimento:</strong> Segunda a Sexta, 8h às 18h
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceDetails;