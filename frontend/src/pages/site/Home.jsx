import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';
import ProofBar from '../../components/ui/ProofBar';

const Home = () => {
  return (
    <div className="min-h-screen bg-elite">
      <ProofBar />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-01 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-title text-elite-accent">ELITE</div>
            <div className="text-2xl font-title text-elite-text">ATHENA</div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#sobre" className="text-elite-text hover:text-elite-accent transition-fast">Sobre</a>
            <a href="#servicos" className="text-elite-text hover:text-elite-accent transition-fast">Serviços</a>
            <a href="#diferenciais" className="text-elite-text hover:text-elite-accent transition-fast">Diferenciais</a>
            <a href="#contato" className="text-elite-text hover:text-elite-accent transition-fast">Contato</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/login" className="btn-elite btn-elite-secondary">Acessar</Link>
            <Link to="/request-access" className="btn-elite btn-elite-primary">Solicitar Acesso</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 fade-in">
            <h1 className="text-5xl md:text-6xl font-title text-elite-text leading-tight">
              Prova Digital <span className="text-elite-accent">Impecável</span>.
              <br />
              Estratégia Penal de <span className="text-elite-accent">Alto Nível</span>.
            </h1>
            
            <p className="text-xl text-elite-metal max-w-3xl mx-auto">
              Perícia forense digital, defesa técnica e ciberinteligência com governança ISO/IEC 27037 e ISO 27001.
            </p>
            
            <div className="flex items-center justify-center space-x-4 pt-8">
              <Link to="/request-access" className="btn-elite btn-elite-primary text-lg px-8 py-4">
                Solicitar Avaliação de Caso
              </Link>
              <a href="#servicos" className="btn-elite btn-elite-secondary text-lg px-8 py-4">
                Conheça os Serviços
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares Elite */}
      <section id="servicos" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-title text-center mb-12 text-elite-text">
            Pilares <span className="text-elite-accent">Elite</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CipherGlassCard category="pericia" className="text-center p-8 hover:scale-105 transition-all">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-title mb-2 text-elite-text">Perícia Digital</h3>
              <p className="text-elite-metal text-sm">
                Análise forense de dispositivos, cadeia de custódia e laudos técnicos ISO/IEC 27037.
              </p>
            </CipherGlassCard>
            
            <CipherGlassCard category="advocacia" className="text-center p-8 hover:scale-105 transition-all">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-title mb-2 text-elite-text">Advocacia Criminal</h3>
              <p className="text-elite-metal text-sm">
                Estratégia probatória técnica, análise processual e defesa especializada.
              </p>
            </CipherGlassCard>
            
            <CipherGlassCard category="admin" className="text-center p-8 hover:scale-105 transition-all">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-title mb-2 text-elite-text">Segurança da Informação</h3>
              <p className="text-elite-metal text-sm">
                Governança ISO 27001, compliance LGPD e auditorias técnicas.
              </p>
            </CipherGlassCard>
            
            <CipherGlassCard category="diversos" className="text-center p-8 hover:scale-105 transition-all">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-title mb-2 text-elite-text">Consultoria Corporativa</h3>
              <p className="text-elite-metal text-sm">
                Inteligência, OSINT, investigação defensiva e ciberinteligência.
              </p>
            </CipherGlassCard>
          </div>
        </div>
      </section>

      {/* Conformidade e Método */}
      <section id="diferenciais" className="py-20 px-6 bg-surface-01">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-title mb-8 text-elite-text">
            Conformidade e <span className="text-elite-accent">Método</span>
          </h2>
          
          <CipherGlassCard variant="strong" className="p-10">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-8">
                <div className="category-badge badge-pericia">ISO/IEC 27037</div>
                <div className="category-badge badge-admin">ISO 27001</div>
                <div className="category-badge badge-diversos">ABNT NBR</div>
              </div>
              
              <p className="text-elite-text text-lg leading-relaxed">
                Atuação técnica baseada em <span className="text-elite-accent font-semibold">padrões internacionais</span> de
                perícia digital, garantindo <span className="text-elite-accent font-semibold">credibilidade probatória</span> e
                admissibilidade judicial de evidências digitais.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-title text-elite-accent mb-2">100%</div>
                  <div className="text-sm text-elite-metal">Cadeia de Custódia</div>
                </div>
                <div>
                  <div className="text-3xl font-title text-elite-accent mb-2">Hash</div>
                  <div className="text-sm text-elite-metal">Integridade Verificada</div>
                </div>
                <div>
                  <div className="text-3xl font-title text-elite-accent mb-2">LGPD</div>
                  <div className="text-sm text-elite-metal">Conformidade Total</div>
                </div>
              </div>
            </div>
          </CipherGlassCard>
        </div>
      </section>

      {/* CTA Final */}
      <section id="contato" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-title mb-6 text-elite-text">
            Pronto para Elevar Sua <span className="text-elite-accent">Estratégia</span>?
          </h2>
          
          <p className="text-xl text-elite-metal mb-8">
            Solicite uma avaliação técnica do seu caso ou acesse a plataforma Elite Athena.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Link to="/request-access" className="btn-elite btn-elite-primary text-lg px-10 py-4">
              Solicitar Avaliação
            </Link>
            <Link to="/login" className="btn-elite btn-elite-secondary text-lg px-10 py-4">
              Acessar Plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-surface-02 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-title text-elite-accent mb-4">ELITE ATHENA</div>
              <p className="text-elite-metal text-sm">
                Elite – Estratégias em Perícia e Investigação Criminal
              </p>
            </div>
            
            <div>
              <h4 className="text-elite-text font-semibold mb-4">Links</h4>
              <div className="space-y-2 text-sm">
                <div><a href="#" className="text-elite-metal hover:text-elite-accent">Políticas de Privacidade</a></div>
                <div><a href="#" className="text-elite-metal hover:text-elite-accent">Termos de Uso</a></div>
                <div><a href="#" className="text-elite-metal hover:text-elite-accent">LGPD</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="text-elite-text font-semibold mb-4">Certificações</h4>
              <div className="space-y-2 text-sm text-elite-metal">
                <div>✓ ISO/IEC 27037</div>
                <div>✓ ISO 27001</div>
                <div>✓ ABNT NBR</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-elite-metal text-sm">
            © 2025 Elite Athena. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
