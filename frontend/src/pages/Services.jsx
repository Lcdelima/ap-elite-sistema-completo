import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Search, FileText, Users, Eye, Scale } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default services if API fails or is empty
  const defaultServices = [
    {
      id: '1',
      title: 'Perícia Criminal Técnica',
      description: 'Análise técnico-científica de evidências e vestígios criminais com metodologia rigorosa e relatórios detalhados.',
      category: 'pericia',
      icon: Shield,
      details: 'Exame de locais de crime, análise de evidências físicas, documentação fotográfica e elaboração de laudos periciais.'
    },
    {
      id: '2',
      title: 'Investigação Criminal Estratégica',
      description: 'Desenvolvimento de estratégias investigativas avançadas para elucidação de crimes complexos.',
      category: 'investigacao',
      icon: Search,
      details: 'Planejamento investigativo, coleta de informações, análise de dados e desenvolvimento de linhas de investigação.'
    },
    {
      id: '3',
      title: 'Consultoria Técnica Jurídica',
      description: 'Assessoria especializada para advogados e escritórios jurídicos em casos criminais.',
      category: 'consultoria',
      icon: Scale,
      details: 'Análise de processos, orientação técnica, elaboração de pareceres e suporte em audiências.'
    },
    {
      id: '4',
      title: 'Análise Forense Digital',
      description: 'Perícia em dispositivos eletrônicos e análise de evidências digitais.',
      category: 'forense',
      icon: Eye,
      details: 'Recuperação de dados, análise de dispositivos móveis, computadores e mídias digitais.'
    },
    {
      id: '5',
      title: 'Elaboração de Relatórios',
      description: 'Confecção de relatórios técnicos e laudos periciais com rigor científico.',
      category: 'relatorios',
      icon: FileText,
      details: 'Documentação técnica, laudos periciais, relatórios de investigação e pareceres especializados.'
    },
    {
      id: '6',
      title: 'Treinamento e Capacitação',
      description: 'Cursos e treinamentos para profissionais da área de segurança pública e jurídica.',
      category: 'treinamento',
      icon: Users,
      details: 'Capacitação em técnicas de investigação, perícia criminal e metodologias científicas aplicadas.'
    }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/services`);
        if (response.data && response.data.length > 0) {
          setServices(response.data);
        } else {
          setServices(defaultServices);
        }
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        setServices(defaultServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getServiceIcon = (category) => {
    const iconMap = {
      'pericia': Shield,
      'investigacao': Search,
      'consultoria': Scale,
      'forense': Eye,
      'relatorios': FileText,
      'treinamento': Users
    };
    return iconMap[category] || Shield;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation showBackButton={true} title="Serviços" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Carregando serviços...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation showBackButton={true} title="Serviços" />
      
      {/* Header Section */}
      <section className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Nossos Serviços
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Soluções especializadas em perícia e investigação criminal com 
            metodologia científica e excelência técnica
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon || getServiceIcon(service.category);
              return (
                <Card 
                  key={service.id} 
                  className="card-hover bg-slate-800 border-slate-700 overflow-hidden"
                  data-testid={`service-card-${service.id}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 bg-cyan-500 bg-opacity-20 rounded-full">
                        <IconComponent className="h-8 w-8 text-cyan-400" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-center text-xl">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-slate-300 mb-6 text-center leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="flex justify-center">
                      <Link to={`/services/${service.id}`}>
                        <Button 
                          className="btn-secondary"
                          data-testid={`service-details-button-${service.id}`}
                        >
                          Saiba Mais
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Precisa de Nossos Serviços?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Entre em contato conosco para discutir suas necessidades e 
            receber um atendimento personalizado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button 
                className="btn-primary text-lg px-8 py-3"
                data-testid="services-cta-contact"
              >
                Solicitar Orçamento
              </Button>
            </Link>
            
            <Link to="/about">
              <Button 
                variant="outline" 
                className="btn-secondary text-lg px-8 py-3"
                data-testid="services-cta-about"
              >
                Conhecer a Empresa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;