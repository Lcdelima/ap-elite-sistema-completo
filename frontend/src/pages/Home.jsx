import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, Award, CheckCircle, Phone, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Perícia Especializada',
      description: 'Análise técnica e científica com metodologia rigorosa e precisão absoluta.'
    },
    {
      icon: Users,
      title: 'Investigação Criminal',
      description: 'Estratégias avançadas de investigação com foco em resultados efetivos.'
    },
    {
      icon: Award,
      title: 'Consultoria Técnica',
      description: 'Assessoria especializada para casos complexos e decisões estratégicas.'
    }
  ];

  const advantages = [
    'Profissional certificada e experiente',
    'Metodologia científica comprovada',
    'Relatórios técnicos detalhados',
    'Atendimento personalizado',
    'Sigilo e confidencialidade absolutos',
    'Suporte jurídico especializado'
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="gradient-bg geometric-pattern py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content-z text-center">
            <div className="fade-in">
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
                <span className="text-cyan-400">AP</span> Elite
              </h1>
              <p className="text-xl lg:text-2xl text-slate-200 mb-8 font-light tracking-wide">
                ESTRATÉGIAS EM PERÍCIA E INVESTIGAÇÃO CRIMINAL
              </p>
            </div>
            
            <div className="slide-up">
              <p className="text-lg text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Dra. Laura Cunha de Lima oferece serviços especializados em perícia criminal 
                e investigação com excelência técnica e metodologia científica rigorosa.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/services">
                  <Button 
                    className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
                    data-testid="cta-services-button"
                  >
                    <span>Nossos Serviços</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                
                <Link to="/contact">
                  <Button 
                    variant="outline" 
                    className="btn-secondary text-lg px-8 py-4"
                    data-testid="cta-contact-button"
                  >
                    Fale Conosco
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Nossas Especialidades
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Oferecemos soluções completas em perícia e investigação criminal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="card-hover bg-slate-700 border-slate-600 p-6"
                  data-testid={`feature-card-${index}`}
                >
                  <CardContent className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-cyan-500 bg-opacity-20 rounded-full">
                        <IconComponent className="h-8 w-8 text-cyan-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Por que escolher a 
                <span className="text-cyan-400">AP Elite</span>?
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Nossa abordagem combina experiência profissional, rigor científico e 
                compromisso com a excelência em cada caso atendido.
              </p>
              
              <div className="space-y-3">
                {advantages.map((advantage, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300">{advantage}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Contatos Diretos
              </h3>
              
              {/* Perícia Digital */}
              <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                <h4 className="text-cyan-400 font-semibold mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Perícia Digital
                </h4>
                <p className="text-white font-medium">(11) 9 1646‑8611</p>
              </div>
              
              {/* Advocacia Criminal */}
              <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                <h4 className="text-cyan-400 font-semibold mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Advocacia Criminal  
                </h4>
                <p className="text-white font-medium">(11) 9 7219‑0768</p>
              </div>
              
              {/* Email e Instagram */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span>elitecdel@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <span className="text-cyan-400">@</span>
                  <span>@lauracunhadel</span>
                </div>
              </div>
              
              <Link to="/contact" className="block">
                <Button 
                  className="btn-primary w-full"
                  data-testid="contact-sidebar-button"
                >
                  Solicitar Orçamento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;