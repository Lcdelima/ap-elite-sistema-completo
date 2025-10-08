import React from 'react';
import { Phone, Mail, MapPin, Globe, Shield, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-white">
                <span className="text-cyan-400">AP</span> Elite
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              ESTRATÉGIAS EM PERÍCIA E INVESTIGAÇÃO CRIMINAL
            </p>
            <div className="text-slate-400 text-sm">
              <p className="font-medium text-white mb-1">Dra. Laura Cunha de Lima</p>
              <p>Especialista em Perícia Criminal</p>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Shield className="h-5 w-5 text-cyan-400" />
              <span className="text-sm">Profissional Certificada</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-slate-300">
                <Phone className="h-5 w-5 text-cyan-400" />
                <span>(xx) xxxx-xxxx</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span>contato@apelite.com.br</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Globe className="h-5 w-5 text-cyan-400" />
                <span>www.lauraedel.com.br/elite</span>
              </div>
              <div className="flex items-start space-x-3 text-slate-300">
                <MapPin className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div className="text-sm">
                  <p>Endereço do Escritório</p>
                  <p>Cidade, Estado - CEP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Serviços</h3>
            <div className="space-y-2 text-slate-300 text-sm">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-cyan-400" />
                <span>Perícia Criminal</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-cyan-400" />
                <span>Investigação Criminal</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-cyan-400" />
                <span>Consultoria Técnica</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-cyan-400" />
                <span>Análise Forense</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-cyan-400" />
                <span>Estratégias Jurídicas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} AP Elite. Todos os direitos reservados.
            </p>
            <p className="text-slate-400 text-sm mt-2 md:mt-0">
              Desenvolvido com excelência e profissionalismo
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;