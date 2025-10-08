import React from 'react';
import { Award, BookOpen, Shield, Users, CheckCircle, Star } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const qualifications = [
    'Especialização em Perícia Criminal',
    'Certificação em Investigação Forense',
    'Formação em Ciências Jurídicas',
    'Experiência em Segurança Pública',
    'Cursos Internacionais em Criminologia',
    'Membro de Associações Profissionais'
  ];

  const values = [
    {
      icon: Shield,
      title: 'Integridade',
      description: 'Compromisso com a ética e transparência em todos os processos'
    },
    {
      icon: Star,
      title: 'Excelência',
      description: 'Busca constante pela qualidade e precisão técnica'
    },
    {
      icon: Users,
      title: 'Compromisso',
      description: 'Dedicação total aos casos e às necessidades dos clientes'
    },
    {
      icon: BookOpen,
      title: 'Conhecimento',
      description: 'Atualização constante e aplicação de metodologias científicas'
    }
  ];

  const achievements = [
    'Mais de 500 casos atendidos com sucesso',
    'Reconhecimento em tribunais regionais',
    'Participação em casos de grande repercussão',
    'Cursos e palestras ministradas',
    'Publicações técnicas especializadas',
    'Parcerias com órgãos de segurança pública'
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation showBackButton={true} title="Sobre Nós" />
      
      {/* Header Section */}
      <section className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Sobre a <span className="text-cyan-400">AP Elite</span>
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Expertise técnica e científica em perícia e investigação criminal
          </p>
        </div>
      </section>

      {/* Professional Profile */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Dra. Laura Cunha de Lima
              </h2>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                Especialista renomada em perícia criminal e investigação, com vasta experiência 
                na área de segurança pública e justiça criminal. Formação sólida e atuação 
                comprometida com a busca da verdade através de metodologias científicas rigorosas.
              </p>
              
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                A AP Elite foi fundada com o objetivo de oferecer serviços especializados 
                de alta qualidade técnica, contribuindo para a elucidação de casos complexos 
                e fornecendo suporte estratégico para o sistema de justiça criminal.
              </p>
              
              <div className="bg-slate-700 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Qualificações Profissionais
                </h3>
                <div className="space-y-2">
                  {qualifications.map((qualification, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{qualification}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700 p-8 rounded-lg border border-slate-600">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Principais Conquistas
              </h3>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Nossos Valores
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Princípios que norteiam nossa atuação profissional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card 
                  key={index} 
                  className="card-hover bg-slate-800 border-slate-700 text-center p-6"
                  data-testid={`value-card-${index}`}
                >
                  <CardContent>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-cyan-500 bg-opacity-20 rounded-full">
                        <IconComponent className="h-8 w-8 text-cyan-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Nossa Missão
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Contribuir para a efetividade do sistema de justiça criminal através da aplicação 
            de metodologias científicas rigorosas na perícia e investigação, oferecendo 
            soluções técnicas especializadas que auxiliem na elucidação da verdade e 
            na promoção da justiça.
          </p>
          
          <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-8 rounded-lg">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Compromisso com a Excelência
            </h3>
            <p className="text-slate-200">
              Cada caso é tratado com rigor científico, ética profissional e dedicação total, 
              garantindo resultados confiáveis e contribuindo para a construção de um 
              sistema de justiça mais eficaz e justo.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;