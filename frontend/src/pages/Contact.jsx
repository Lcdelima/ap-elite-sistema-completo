import React, { useState } from 'react';
import { Phone, Mail, MapPin, Globe, Clock, Send } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      title: 'Perícia Digital',
      info: '(11) 9 1646‑8611',
      description: 'Especialidades em perícia técnica'
    },
    {
      icon: Phone,
      title: 'Advocacia Criminal',  
      info: '(11) 9 7219‑0768',
      description: 'Consultoria jurídica especializada'
    },
    {
      icon: Mail,
      title: 'E-mail Principal',
      info: 'elitecdel@gmail.com',
      description: 'Resposta em até 24 horas'
    },
    {
      icon: Globe,
      title: 'Instagram',
      info: '@lauracunhadel',
      description: 'Siga para atualizações'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      // Send to API
      await axios.post(`${API}/contact`, formData);
      
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente ou entre em contato por telefone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation showBackButton={true} title="Contato" />
      
      {/* Header Section */}
      <section className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Entre em Contato
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Estamos prontos para atender suas necessidades em perícia e investigação criminal
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <Card 
                  key={index} 
                  className="card-hover bg-slate-800 border-slate-700 text-center p-6"
                  data-testid={`contact-card-${index}`}
                >
                  <CardContent>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-cyan-500 bg-opacity-20 rounded-full">
                        <IconComponent className="h-6 w-6 text-cyan-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {contact.title}
                    </h3>
                    <p className="text-cyan-400 font-medium mb-1">
                      {contact.info}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {contact.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Form and Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Envie uma Mensagem
                  </CardTitle>
                  <p className="text-slate-300">
                    Preencha o formulário abaixo e entraremos em contato o mais breve possível.
                  </p>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Nome Completo *
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Seu nome completo"
                          data-testid="contact-name-input"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          E-mail *
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="seu@email.com"
                          data-testid="contact-email-input"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Telefone
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="(xx) xxxx-xxxx"
                          data-testid="contact-phone-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Assunto *
                        </label>
                        <Input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Assunto da sua mensagem"
                          data-testid="contact-subject-input"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Mensagem *
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Descreva detalhadamente sua necessidade ou dúvida..."
                        data-testid="contact-message-textarea"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="btn-primary w-full md:w-auto px-8 py-3 flex items-center space-x-2"
                      disabled={isSubmitting}
                      data-testid="contact-submit-button"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-cyan-400" />
                    <span>Horário de Atendimento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-slate-300">
                      <span className="font-medium text-white">Perícia Digital:</span><br/>
                      <span>(11) 9 1646‑8611</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="font-medium text-white">Advocacia Criminal:</span><br/>
                      <span>(11) 9 7219‑0768</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <div className="text-slate-300 space-y-1">
                      <p><span className="font-medium text-white">Email:</span> elitecdel@gmail.com</p>
                      <p><span className="font-medium text-white">Instagram:</span> @lauracunhadel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-cyan-900 to-blue-900 border-cyan-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Atendimento Especializado
                  </h3>
                  <p className="text-cyan-100 text-sm leading-relaxed">
                    Oferecemos consultoria personalizada para cada caso, 
                    garantindo o atendimento mais adequado às suas necessidades específicas.
                  </p>
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

export default Contact;