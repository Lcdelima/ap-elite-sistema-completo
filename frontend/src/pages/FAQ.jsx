import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqCategories = [
    {
      title: 'Serviços Gerais',
      icon: HelpCircle,
      questions: [
        {
          id: 'servicos-1',
          question: 'Quais tipos de perícia criminal vocês realizam?',
          answer: 'Realizamos perícia criminal técnica, análise de locais de crime, exame de evidências físicas, perícia digital, análise forense de dispositivos eletrônicos, reconstituição de cenas de crime e elaboração de laudos periciais especializados.'
        },
        {
          id: 'servicos-2',
          question: 'Qual é o prazo para entrega dos laudos periciais?',
          answer: 'O prazo varia conforme a complexidade do caso. Perícias simples: 7-10 dias úteis. Casos complexos: 15-30 dias úteis. Casos urgentes podem ser priorizados mediante disponibilidade e acordo prévio.'
        },
        {
          id: 'servicos-3',
          question: 'Vocês atendem em quais regiões?',
          answer: 'Atendemos em todo o estado de Minas Gerais, com sede em Três Corações. Para casos em outros estados, avaliamos a possibilidade mediante a complexidade e relevância do caso.'
        },
        {
          id: 'servicos-4',
          question: 'É possível agendar uma consulta online?',
          answer: 'Sim, oferecemos consultas online para análise inicial de casos, orientações técnicas e acompanhamento de processos. Agendamentos podem ser feitos através do nosso sistema online ou por telefone.'
        }
      ]
    },
    {
      title: 'Perícia Digital',
      icon: HelpCircle,
      questions: [
        {
          id: 'digital-1',
          question: 'Quais dispositivos podem ser analisados na perícia digital?',
          answer: 'Analisamos smartphones, tablets, computadores, laptops, HDs externos, pen drives, cartões de memória, sistemas de videomonitoramento, e-mails, redes sociais e qualquer dispositivo que armazene dados digitais.'
        },
        {
          id: 'digital-2',
          question: 'É possível recuperar dados deletados?',
          answer: 'Sim, utilizamos técnicas forenses avançadas para recuperação de dados deletados, desde que não tenham sido sobrescritos. A taxa de sucesso depende do tipo de dispositivo, tempo decorrido e uso posterior à exclusão.'
        },
        {
          id: 'digital-3',
          question: 'Como é garantida a integridade das evidências digitais?',
          answer: 'Seguimos protocolos rigorosos de cadeia de custódia, utilizamos ferramentas certificadas, realizamos hash de integridade, documentamos todos os procedimentos e mantemos cópias forenses dos dados originais.'
        },
        {
          id: 'digital-4',
          question: 'Vocês trabalham com dispositivos criptografados?',
          answer: 'Sim, possuímos ferramentas e técnicas especializadas para análise de dispositivos com criptografia. O sucesso da análise depende do tipo de criptografia e das circunstâncias específicas de cada caso.'
        }
      ]
    },
    {
      title: 'Advocacia Criminal',
      icon: HelpCircle,
      questions: [
        {
          id: 'advocacia-1',
          question: 'Em que tipos de processos criminais vocês atuam?',
          answer: 'Atuamos em crimes contra a pessoa, patrimônio, dignidade sexual, crimes digitais, econômicos, contra a administração pública, tráfico de drogas, homicídios, e demais delitos previstos no Código Penal.'
        },
        {
          id: 'advocacia-2',
          question: 'Vocês atuam em todas as fases do processo criminal?',
          answer: 'Sim, atuamos desde o inquérito policial, ação penal, recursos, execução penal, habeas corpus, revisão criminal e demais medidas judiciais relacionadas ao direito criminal.'
        },
        {
          id: 'advocacia-3',
          question: 'É oferecido plantão para casos urgentes?',
          answer: 'Sim, mantemos plantão para situações de urgência como prisões em flagrante, mandados de busca e apreensão, e outras situações que demandem atuação imediata.'
        },
        {
          id: 'advocacia-4',
          question: 'Como funciona o acompanhamento processual?',
          answer: 'Oferecemos acompanhamento completo com updates regulares sobre o andamento do processo, orientações sobre cada fase, disponibilidade para esclarecimentos e acesso a toda documentação processual.'
        }
      ]
    },
    {
      title: 'Custos e Pagamentos',
      icon: HelpCircle,
      questions: [
        {
          id: 'custos-1',
          question: 'Como são calculados os honorários?',
          answer: 'Os honorários são calculados com base na complexidade do caso, tempo necessário, recursos técnicos envolvidos e urgência. Fornecemos orçamento detalhado após análise inicial do caso.'
        },
        {
          id: 'custos-2',
          question: 'Quais formas de pagamento são aceitas?',
          answer: 'Aceitamos pagamento à vista (com desconto), parcelamento (conforme acordo), transferência bancária, PIX e cartões de crédito. Condições especiais podem ser negociadas para casos específicos.'
        },
        {
          id: 'custos-3',
          question: 'É cobrada taxa para orçamento inicial?',
          answer: 'A consulta inicial e orçamento básico são gratuitos. Cobramos apenas por análises técnicas detalhadas que demandem tempo significativo ou recursos especializados.'
        },
        {
          id: 'custos-4',
          question: 'Há desconto para casos sociais?',
          answer: 'Avaliamos cada caso individualmente e oferecemos condições especiais para casos de relevância social, instituições de caridade e situações de vulnerabilidade econômica comprovada.'
        }
      ]
    },
    {
      title: 'Procedimentos e Prazos',
      icon: HelpCircle,
      questions: [
        {
          id: 'procedimentos-1',
          question: 'Como é o processo de contratação dos serviços?',
          answer: 'O processo inclui: 1) Consulta inicial gratuita, 2) Análise do caso, 3) Proposta de honorários, 4) Assinatura do contrato, 5) Início dos trabalhos. Todo o processo pode ser feito presencialmente ou online.'
        },
        {
          id: 'procedimentos-2',
          question: 'Quais documentos são necessários para iniciar?',
          answer: 'Geralmente: documento de identidade do contratante, procuração (se aplicável), cópia do processo ou inquérito, documentos relacionados ao caso e evidências disponíveis. Lista específica varia por caso.'
        },
        {
          id: 'procedimentos-3',
          question: 'É possível acompanhar o andamento dos trabalhos?',
          answer: 'Sim, oferecemos relatórios periódicos de progresso, acesso via telefone ou e-mail para esclarecimentos, e reuniões de acompanhamento conforme necessário. Mantemos comunicação transparente durante todo o processo.'
        },
        {
          id: 'procedimentos-4',
          question: 'Como é garantido o sigilo das informações?',
          answer: 'Seguimos rigorosamente o sigilo profissional, todos os colaboradores assinam termo de confidencialidade, utilizamos sistemas seguros para armazenamento de dados e cumprimos todas as normas da LGPD.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation showBackButton={true} title="Perguntas Frequentes" />
      
      {/* Header Section */}
      <section className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre nossos serviços 
            especializados em perícia e investigação criminal
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {faqCategories.map((category, categoryIndex) => {
                  const IconComponent = category.icon;
                  return (
                    <div key={categoryIndex}>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                        <IconComponent className="h-6 w-6 text-cyan-400" />
                        <span>{category.title}</span>
                      </h2>
                      
                      <div className="space-y-4">
                        {category.questions.map((faq) => (
                          <Card 
                            key={faq.id} 
                            className="bg-slate-800 border-slate-700 overflow-hidden"
                            data-testid={`faq-item-${faq.id}`}
                          >
                            <button
                              className="w-full p-6 text-left hover:bg-slate-700 transition-colors"
                              onClick={() => toggleItem(faq.id)}
                              data-testid={`faq-question-${faq.id}`}
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white pr-4">
                                  {faq.question}
                                </h3>
                                {openItems[faq.id] ? (
                                  <ChevronUp className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                            
                            {openItems[faq.id] && (
                              <CardContent className="px-6 pb-6 pt-0">
                                <p className="text-slate-300 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Não encontrou sua resposta?
                  </h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Entre em contato conosco diretamente para esclarecimentos específicos sobre seu caso.
                  </p>
                  
                  <div className="space-y-3">
                    <Link to="/contact" className="block">
                      <Button className="btn-primary w-full text-sm" data-testid="faq-contact-button">
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                    </Link>
                    
                    <Link to="/agendamento" className="block">
                      <Button variant="outline" className="btn-secondary w-full text-sm">
                        Agendar Consulta
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
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Phone className="h-4 w-4 text-cyan-400" />
                      <div>
                        <p className="font-medium text-white">Perícia Digital</p>
                        <p>(11) 9 1646‑8611</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Phone className="h-4 w-4 text-cyan-400" />
                      <div>
                        <p className="font-medium text-white">Advocacia Criminal</p>
                        <p>(11) 9 7219‑0768</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Mail className="h-4 w-4 text-cyan-400" />
                      <p>elitecdel@gmail.com</p>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <MessageCircle className="h-4 w-4 text-cyan-400" />
                      <p>@lauracunhadel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tips */}
              <Card className="bg-gradient-to-br from-cyan-900 to-blue-900 border-cyan-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Dicas Importantes
                  </h3>
                  <div className="space-y-3 text-sm text-cyan-100">
                    <p>• Preserve evidências digitais evitando usar dispositivos</p>
                    <p>• Documente tudo relacionado ao caso</p>
                    <p>• Entre em contato o mais rápido possível</p>
                    <p>• Mantenha sigilo sobre detalhes do caso</p>
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

export default FAQ;