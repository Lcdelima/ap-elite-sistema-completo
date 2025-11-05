import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/elite-forensic.css';
import EliteWatermark from '../../components/EliteWatermark';
import EliteSignature from '../../components/EliteSignature';

const Home = () => {
  return (
    <div className="min-h-screen bg-elite">
      <EliteWatermark />
      
      {/* Header Elite Forensic */}
      <header className="header-elite">
        <div className="mx-auto max-w-screen-xl px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border" style={{
              background: 'rgba(0,163,196,0.15)',
              borderColor: 'rgba(0,163,196,0.3)'
            }}></div>
            <span className="logo-elite" style={{ color: '#E4E6EB' }}>
              ELITE <span className="accent">ATHENA</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'rgba(228,230,235,0.8)' }}>
            <a href="#sobre" className="hover:text-white transition-colors cursor-pointer">Sobre</a>
            <a href="#servicos" className="hover:text-white transition-colors cursor-pointer">Serviços</a>
            <a href="#diferenciais" className="hover:text-white transition-colors cursor-pointer">Diferenciais</a>
            <a href="#contato" className="hover:text-white transition-colors cursor-pointer">Contato</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-elite btn-elite-secondary text-sm">Acessar</Link>
            <Link to="/request-access" className="btn-elite btn-elite-primary text-sm">Solicitar Acesso</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-forensic py-24 md:py-32">
        <div className="relative mx-auto max-w-screen-xl px-6 z-10">
          <div className="fade-in-up">
            <h1 className="font-title font-bold tracking-tight leading-tight text-4xl md:text-6xl max-w-3xl" style={{ color: '#E4E6EB' }}>
              Tecnologia, Direito e <span style={{ background: 'linear-gradient(130deg, #00A3C4, #21B1D8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>Precisão Forense</span> em um único ecossistema.
            </h1>

            <p className="subtitle mt-6 text-lg md:text-xl max-w-2xl" style={{ color: 'rgba(228,230,235,0.85)' }}>
              Perícia digital, defesa técnica e ciberinteligência com governança ISO/IEC 27037 e ISO 27001 — rigor e estética Elite.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/request-access" className="btn-elite btn-elite-primary">Solicitar Avaliação de Caso</Link>
              <a href="#servicos" className="btn-elite btn-elite-secondary">Conheça os Serviços</a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm" style={{ color: 'rgba(228,230,235,0.6)' }}>
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>Cadeia de Custódia
              </span>
              <span>ISO/IEC 27037 · ISO 27001 · LGPD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section id="servicos" className="py-16 md:py-24 bg-elite">
        <div className="mx-auto max-w-screen-xl px-6">
          <h2 className="text-3xl md:text-4xl font-title font-bold mb-10" style={{ color: '#E4E6EB' }}>
            Pilares <span style={{ color: '#00A3C4' }}>Elite</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { title: 'Perícia Digital Forense', desc: 'Aquisição, análise, metadados e integridade com cadeia de custódia.' },
              { title: 'Defesa Técnica Estratégica', desc: 'Análise processual, nulidades, prescrição, dosimetria assistida por IA.' },
              { title: 'Ciberinteligência e OSINT', desc: 'Rastreamento, relacionamentos, surface/dark web e alertas estratégicos.' },
              { title: 'Governança e Conformidade', desc: 'ISO 27001, LGPD, auditoria e relatórios com Elite Seal.' }
            ].map((p, i) => (
              <article key={i} className="cipher-glass p-6 group cursor-pointer">
                <div className="w-10 h-10 rounded-lg border mb-4 transition-all group-hover:scale-110" style={{ background: 'rgba(0,163,196,0.12)', borderColor: 'rgba(0,163,196,0.25)' }}></div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#E4E6EB' }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(228,230,235,0.7)' }}>{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ISO Compliance */}
      <section id="diferenciais" className="py-16 md:py-24" style={{ background: '#060B14' }}>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-title font-bold mb-8" style={{ color: '#E4E6EB' }}>
            Conformidade e <span style={{ color: '#00A3C4' }}>Método</span>
          </h2>
          
          <div className="cipher-glass p-10">
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              <div className="badge-elite badge-iso">ISO/IEC 27037</div>
              <div className="badge-elite badge-iso">ISO 27001</div>
              <div className="badge-elite badge-iso">ABNT NBR</div>
            </div>
            
            <p className="quote-juridica text-lg leading-relaxed mb-6">
              Atuação técnica baseada em padrões internacionais de perícia digital, garantindo credibilidade probatória e admissibilidade judicial de evidências digitais.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 pt-6">
              <div><div className="text-3xl font-title font-bold mb-2" style={{ color: '#00A3C4' }}>100%</div><div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>Cadeia de Custódia</div></div>
              <div><div className="text-3xl font-title font-bold mb-2" style={{ color: '#00A3C4' }}>SHA-512</div><div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>Hash Verificado</div></div>
              <div><div className="text-3xl font-title font-bold mb-2" style={{ color: '#00A3C4' }}>LGPD</div><div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>Compliance</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contato" className="py-20 px-6 bg-elite">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
            Pronto para Elevar Sua <span style={{ color: '#00A3C4' }}>Estratégia</span>?
          </h2>
          <p className="subtitle text-xl mb-8" style={{ color: 'rgba(228,230,235,0.75)' }}>
            Solicite uma avaliação técnica do seu caso ou acesse a plataforma Elite Athena.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/request-access" className="btn-elite btn-elite-primary">Solicitar Avaliação</Link>
            <Link to="/login" className="btn-elite btn-elite-secondary">Acessar Plataforma</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div><EliteSignature /></div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: '#E4E6EB' }}>Links</h4>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(228,230,235,0.6)' }}>
                <div><a href="#" className="hover:text-white transition-colors">Políticas de Privacidade</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></div>
                <div><a href="#" className="hover:text-white transition-colors">LGPD</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: '#E4E6EB' }}>Certificações</h4>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(228,230,235,0.6)' }}>
                <div>✓ ISO/IEC 27037</div>
                <div>✓ ISO 27001</div>
                <div>✓ ABNT NBR</div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="verified-seal mb-4">Verified by Elite Seal 3D</div>
            <p className="text-sm" style={{ color: 'rgba(228,230,235,0.5)' }}>© 2025 Elite Athena. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
