import React from 'react';
import { Star, Quote, Calendar, MapPin, Award, Users } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Depoimentos = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Dr. Carlos Mendes',
      role: 'Advogado Criminalista',
      location: 'Belo Horizonte - MG',
      rating: 5,
      date: '2024-02-15',
      category: 'Perícia Digital',
      testimonial: 'Excelente trabalho da Dra. Laura em um caso complexo de fraude digital. A perícia foi detalhada, tecnicamente impecável e fundamental para o sucesso da defesa. Profissionalismo exemplar e prazo cumprido rigorosamente.',
      case: 'Fraude em sistema bancário',
      avatar: 'CM'
    },
    {
      id: 2,
      name: 'Maria Silva Santos',
      role: 'Empresária',
      location: 'Três Corações - MG',
      rating: 5,
      date: '2024-01-20',
      category: 'Investigação Criminal',
      testimonial: 'Contratei os serviços para investigar um caso de apropriação indébita em minha empresa. O trabalho foi excepcional, com metodologia rigorosa que resultou na recuperação dos valores e responsabilização dos envolvidos.',
      case: 'Investigação corporativa',
      avatar: 'MS'
    },
    {
      id: 3,
      name: 'Delegado João Pereira',
      role: 'Delegado de Polícia Civil',
      location: 'Varginha - MG',
      rating: 5,
      date: '2023-12-10',
      category: 'Perícia Criminal',
      testimonial: 'A AP Elite prestou consultoria técnica em caso de homicídio de grande repercussão. A análise pericial foi fundamental para esclarecimento dos fatos. Recomendo pela seriedade e competência técnica demonstrada.',
      case: 'Consultoria em homicídio',
      avatar: 'JP'
    },
    {
      id: 4,
      name: 'Dra. Ana Beatriz Costa',
      role: 'Promotora de Justiça',
      location: 'Pouso Alegre - MG',
      rating: 5,
      date: '2024-03-05',
      category: 'Advocacia Criminal',
      testimonial: 'Trabalho impecável na defesa de caso complexo. A estratégia jurídica foi brilhante e a condução do processo exemplar. Profissional altamente capacitada que superou nossas expectativas.',
      case: 'Defesa em processo criminal',
      avatar: 'AB'
    },
    {
      id: 5,
      name: 'Roberto Oliveira',
      role: 'Diretor de TI',
      location: 'São Paulo - SP',
      rating: 5,
      date: '2023-11-18',
      category: 'Perícia Digital',
      testimonial: 'Excelente trabalho de perícia digital após ataque cibernético em nossa empresa. A equipe foi técnica, eficiente e nos ajudou não apenas a identificar os responsáveis, mas também a implementar medidas preventivas.',
      case: 'Investigação de ataque cibernético',
      avatar: 'RO'
    },
    {
      id: 6,
      name: 'Luciana Ferreira',
      role: 'Advogada',
      location: 'Lavras - MG',
      rating: 5,
      date: '2024-01-12',
      category: 'Consultoria Técnica',
      testimonial: 'Consultoria excepcional para caso que envolvia questões técnicas complexas. A expertise da Dra. Laura foi determinante para o sucesso do processo. Comunicação clara e suporte constante.',
      case: 'Consultoria técnico-jurídica',
      avatar: 'LF'
    },
    {
      id: 7,
      name: 'Prof. Marcos Antônio',
      role: 'Coordenador Academia de Polícia',
      location: 'Belo Horizonte - MG',
      rating: 5,
      date: '2023-10-25',
      category: 'Treinamento',
      testimonial: 'Excelente capacitação oferecida para nossos agentes. Metodologia didática clara, conteúdo atualizado e aplicação prática. Nossos policiais saíram mais preparados para lidar com crimes modernos.',
      case: 'Treinamento especializado',
      avatar: 'MA'
    },
    {
      id: 8,
      name: 'Sandra Rodrigues',
      role: 'Vítima de Crime Digital',
      location: 'Poços de Caldas - MG',
      rating: 5,
      date: '2024-02-28',
      category: 'Perícia Digital',
      testimonial: 'Fui vítima de invasão de dispositivos e a Dra. Laura me ajudou imensamente. Além da perícia técnica impecável, recebi orientações valiosas sobre segurança digital. Muito grata pelo suporte.',
      case: 'Invasão de dispositivos',
      avatar: 'SR'
    },
    {
      id: 9,
      name: 'Dr. Eduardo Santos',
      role: 'Juiz de Direito',
      location: 'Três Corações - MG',
      rating: 5,
      date: '2023-12-30',
      category: 'Perícia Criminal',
      testimonial: 'Trabalho pericial de altíssima qualidade técnica. Laudo detalhado, metodologia científica rigorosa e apresentação clara. Contribuição fundamental para a justiça e esclarecimento dos fatos.',
      case: 'Perícia judicial',
      avatar: 'ES'
    }
  ];

  const stats = [
    {
      number: '500+',
      label: 'Clientes Atendidos',
      icon: Users
    },
    {
      number: '4.9/5',
      label: 'Avaliação Média',
      icon: Star
    },
    {
      number: '98%',
      label: 'Recomendação',
      icon: Award
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
      />
    ));
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation showBackButton={true} title="Depoimentos" />
      
      {/* Header Section */}
      <section className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Depoimentos de Clientes
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Veja o que nossos clientes têm a dizer sobre nossos serviços especializados 
            em perícia e investigação criminal
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <div className="text-lg font-semibold text-cyan-400">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Depoimentos reais de profissionais e clientes que confiaram em nossos serviços
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card 
                key={testimonial.id} 
                className="card-hover bg-slate-800 border-slate-700 h-full flex flex-col"
                data-testid={`testimonial-card-${testimonial.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 bg-cyan-500">
                        <AvatarFallback className="bg-cyan-500 text-white font-semibold">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-white text-base mb-1">
                          {testimonial.name}
                        </CardTitle>
                        <p className="text-slate-400 text-sm">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <Quote className="h-6 w-6 text-cyan-400 flex-shrink-0" />
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex space-x-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    <Badge className={`${getCategoryColor(testimonial.category)} text-white text-xs`}>
                      {testimonial.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-slate-400 text-xs space-x-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{testimonial.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(testimonial.date)}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 flex-grow">
                  <blockquote className="text-slate-300 leading-relaxed mb-4">
                    "{testimonial.testimonial}"
                  </blockquote>
                  
                  <div className="mt-auto pt-4 border-t border-slate-700">
                    <p className="text-cyan-400 text-sm font-medium">
                      Caso: {testimonial.case}
                    </p>
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
            Seja nosso próximo cliente satisfeito
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Entre em contato conosco e descubra como podemos ajudar com seu caso específico. 
            Nossa experiência e dedicação estão à sua disposição.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn-primary px-8 py-3 rounded-lg text-center">
              Fale Conosco
            </a>
            <a href="/agendamento" className="btn-secondary px-8 py-3 rounded-lg text-center">
              Agendar Consulta
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Depoimentos;