import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Agendamento = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    description: '',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    { value: 'pericia-digital', label: 'Perícia Digital' },
    { value: 'advocacia-criminal', label: 'Advocacia Criminal' },
    { value: 'pericia-criminal', label: 'Perícia Criminal Técnica' },
    { value: 'investigacao-criminal', label: 'Investigação Criminal' },
    { value: 'consultoria-tecnica', label: 'Consultoria Técnica Jurídica' },
    { value: 'analise-forense', label: 'Análise Forense Digital' },
    { value: 'treinamento', label: 'Treinamento e Capacitação' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const urgencyLevels = [
    { value: 'baixa', label: 'Baixa - Até 15 dias' },
    { value: 'normal', label: 'Normal - Até 7 dias' },
    { value: 'alta', label: 'Alta - Até 3 dias' },
    { value: 'urgente', label: 'Urgente - 24-48h' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
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
      if (!formData.name || !formData.email || !formData.phone || !formData.service || !formData.date || !formData.time) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      // Validate date (not in the past)
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        toast.error('Por favor, selecione uma data futura');
        return;
      }

      // Send to API
      const appointmentData = {
        ...formData,
        datetime: `${formData.date}T${formData.time}:00.000Z`,
        status: 'pending'
      };
      
      await axios.post(`${API}/appointments`, appointmentData);
      
      toast.success('Agendamento solicitado com sucesso! Entraremos em contato para confirmação.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        time: '',
        description: '',
        urgency: 'normal'
      });
    } catch (error) {
      console.error('Erro ao agendar:', error);
      toast.error('Erro ao solicitar agendamento. Tente novamente ou entre em contato por telefone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation showBackButton={true} title="Agendamento Online" />
      
      {/* Header Section */}
      <section className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Agendamento Online
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Agende sua consulta ou serviço de forma rápida e conveniente
          </p>
        </div>
      </section>

      {/* Appointment Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center space-x-2">
                    <Calendar className="h-6 w-6 text-cyan-400" />
                    <span>Solicitar Agendamento</span>
                  </CardTitle>
                  <p className="text-slate-300">
                    Preencha os dados abaixo e entraremos em contato para confirmar seu agendamento.
                  </p>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <User className="h-5 w-5 text-cyan-400" />
                        <span>Informações Pessoais</span>
                      </h3>
                      
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
                            data-testid="appointment-name-input"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Telefone *
                          </label>
                          <Input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="(11) 99999-9999"
                            data-testid="appointment-phone-input"
                            required
                          />
                        </div>
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
                          data-testid="appointment-email-input"
                          required
                        />
                      </div>
                    </div>

                    {/* Service Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-cyan-400" />
                        <span>Serviço Desejado</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Tipo de Serviço *
                          </label>
                          <Select onValueChange={(value) => handleSelectChange('service', value)}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="appointment-service-select">
                              <SelectValue placeholder="Selecione o serviço" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              {services.map(service => (
                                <SelectItem key={service.value} value={service.value} className="text-white hover:bg-slate-600">
                                  {service.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Urgência
                          </label>
                          <Select onValueChange={(value) => handleSelectChange('urgency', value)} defaultValue="normal">
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="appointment-urgency-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              {urgencyLevels.map(level => (
                                <SelectItem key={level.value} value={level.value} className="text-white hover:bg-slate-600">
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-cyan-400" />
                        <span>Data e Horário</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Data Preferida *
                          </label>
                          <Input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            min={getMinDate()}
                            max={getMaxDate()}
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="appointment-date-input"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Horário Preferido *
                          </label>
                          <Select onValueChange={(value) => handleSelectChange('time', value)}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="appointment-time-select">
                              <SelectValue placeholder="Selecione o horário" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time} className="text-white hover:bg-slate-600">
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Descrição do Caso (Opcional)
                      </label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Descreva brevemente o caso ou situação que precisa de atendimento..."
                        data-testid="appointment-description-textarea"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="btn-primary w-full md:w-auto px-8 py-3 flex items-center space-x-2"
                      disabled={isSubmitting}
                      data-testid="appointment-submit-button"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{isSubmitting ? 'Enviando...' : 'Solicitar Agendamento'}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
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
                  </div>
                </CardContent>
              </Card>
              
              {/* Important Notes */}
              <Card className="bg-gradient-to-br from-cyan-900 to-blue-900 border-cyan-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Informações Importantes</span>
                  </h3>
                  <div className="space-y-3 text-sm text-cyan-100">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p>Confirmaremos seu agendamento em até 2 horas úteis</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p>Casos urgentes serão priorizados</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p>Atendimento de segunda a sexta, 8h às 18h</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p>Consultas online disponíveis</p>
                    </div>
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

export default Agendamento;