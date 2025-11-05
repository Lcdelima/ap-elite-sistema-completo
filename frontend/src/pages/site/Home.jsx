import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/elite-gravitas.css'

const Home = () => {
  return (
    <div className="min-h-screen" style={{ background: '#070B14' }}>
      
      {/* Header - Redesign Completo */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{
        background: 'rgba(0,0,0,0.2)',
        borderColor: 'rgba(199,190,183,0.2)'
      }}>
        <div className="mx-auto max-w-screen-xl px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border" style={{
              background: 'rgba(0,163,196,0.2)',
              borderColor: 'rgba(0,163,196,0.3)'
            }}></div>
            <span className="font-title font-bold tracking-wide" style={{ color: '#E4E6EB' }}>
              ELITE <span style={{ color: '#00A3C4' }}>ATHENA</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" style={{ color: 'rgba(228,230,235,0.8)' }}>
            <a href="#sobre" className="hover:text-white transition-colors cursor-pointer">Sobre</a>
            <a href="#servicos" className="hover:text-white transition-colors cursor-pointer">Serviços</a>
            <a href="#diferenciais" className="hover:text-white transition-colors cursor-pointer">Diferenciais</a>
            <a href="#contato" className="hover:text-white transition-colors cursor-pointer">Contato</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="hidden sm:inline-flex px-4 h-11 items-center justify-center rounded-xl border transition-all"
              style={{
                borderColor: 'rgba(199,190,183,0.3)',
                color: 'rgba(228,230,235,0.9)',
                background: 'rgba(255,255,255,0.05)'
              }}
            >
              Acessar
            </Link>
            <Link 
              to="/request-access" 
              className="inline-flex px-4 h-11 items-center justify-center rounded-xl font-medium transition-opacity hover:opacity-95"
              style={{
                background: 'linear-gradient(130deg, #00A3C4, #146B8C)',
                color: '#000',
                boxShadow: '0 24px 60px rgba(0,0,0,0.35)'
              }}
            >
              Solicitar Acesso
            </Link>
          </div>
        </div>
      </header>

      {/* Hero - Redesign Sofisticado */}
      <section className="relative overflow-hidden" style={{ background: '#070B14' }}>
        {/* Grid forense sutil */}
        <div 
          className="pointer-events-none absolute inset-0" 
          style={{
            opacity: 0.05,
            backgroundImage: 'radial-gradient(circle at 1px 1px, #00A3C4 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        ></div>

        {/* Gradiente profundo */}
        <div 
          className="pointer-events-none absolute inset-0" 
          style={{
            background: 'linear-gradient(to bottom, transparent, #08101D, #04070D)'
          }}
        ></div>

        <div className="relative mx-auto max-w-screen-xl px-6 py-24 md:py-32 z-10">
          <h1 
            className="font-title font-bold tracking-tight leading-tight"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              color: '#E4E6EB',
              maxWidth: '22ch'
            }}
          >
            Tecnologia, Direito e{' '}
            <span 
              className="bg-clip-text"
              style={{
                background: 'linear-gradient(130deg, #00A3C4, #21B1D8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Precisão Forense
            </span>{' '}
            em um único ecossistema.
          </h1>

          <p 
            className="mt-5 text-lg md:text-xl max-w-2xl"
            style={{ color: 'rgba(228,230,235,0.8)' }}
          >
            Perícia digital, defesa técnica e ciberinteligência com governança ISO/IEC 27037 e ISO 27001 — rigor e estética Elite.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/request-access"
              className="inline-flex px-6 h-12 items-center justify-center rounded-xl font-medium transition-opacity hover:opacity-95"
              style={{
                background: 'linear-gradient(130deg, #00A3C4, #146B8C)',
                color: '#000',
                boxShadow: '0 24px 60px rgba(0,0,0,0.35)'
              }}
            >
              Solicitar Avaliação de Caso
            </Link>
            <a
              href="#servicos"
              className="inline-flex px-6 h-12 items-center justify-center rounded-xl border backdrop-blur-sm transition-all"
              style={{
                borderColor: 'rgba(199,190,183,0.4)',
                color: 'rgba(228,230,235,0.9)',
                background: 'rgba(255,255,255,0.05)'
              }}
            >
              Conheça os Serviços
            </a>
          </div>

          {/* Credenciais */}
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm" style={{ color: 'rgba(228,230,235,0.6)' }}>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: '#27AE60' }}></span>
              Cadeia de Custódia
            </span>
            <span>ISO/IEC 27037 · ISO 27001</span>
            <span>LGPD • Sigilo e Auditoria</span>
          </div>
        </div>
      </section>

      {/* Pilares Elite - Cards Glass Sofisticados */}
      <section id="servicos" className="py-16 md:py-24" style={{ background: '#070B14' }}>
        <div className="mx-auto max-w-screen-xl px-6">
          <h2 className="text-3xl md:text-4xl font-title font-bold tracking-tight" style={{ color: '#E4E6EB' }}>
            Pilares <span style={{ color: '#00A3C4' }}>Elite</span>
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              {
                title: 'Perícia Digital Forense',
                description: 'Aquisição, análise, metadados e integridade com cadeia de custódia.'
              },
              {
                title: 'Defesa Técnica Estratégica',
                description: 'Análise processual, nulidades, prescrição, dosimetria assistida por IA.'
              },
              {
                title: 'Ciberinteligência e OSINT',
                description: 'Rastreamento, relacionamentos, surface/dark web e alertas estratégicos.'
              },
              {
                title: 'Governança e Conformidade',
                description: 'ISO 27001, LGPD, auditoria e relatórios com Elite Seal.'
              }
            ].map((pilar, idx) => (
              <article 
                key={idx}
                className="group rounded-2xl border p-6 backdrop-blur-sm transition-all hover:border-opacity-100"
                style={{
                  borderColor: 'rgba(199,190,183,0.2)',
                  background: 'rgba(255,255,255,0.06)'
                }}
              >
                <div 
                  className="w-10 h-10 rounded-lg border mb-4"
                  style={{
                    background: 'rgba(0,163,196,0.15)',
                    borderColor: 'rgba(0,163,196,0.25)'
                  }}
                ></div>
                <h3 className="text-lg font-medium mb-2" style={{ color: '#E4E6EB' }}>
                  {pilar.title}
                </h3>
                <p className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>
                  {pilar.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Conformidade e Método */}
      <section id="diferenciais" className="py-16 md:py-24" style={{ background: '#04070D' }}>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-title font-bold tracking-tight mb-8" style={{ color: '#E4E6EB' }}>
            Conformidade e <span style={{ color: '#00A3C4' }}>Método</span>
          </h2>
          
          <div 
            className="rounded-2xl border p-10 backdrop-blur-sm"
            style={{
              borderColor: 'rgba(199,190,183,0.2)',
              background: 'rgba(255,255,255,0.08)'
            }}
          >
            <div className="flex justify-center items-center gap-8 mb-6 flex-wrap">
              <div className="category-badge badge-pericia">ISO/IEC 27037</div>
              <div className="category-badge badge-admin">ISO 27001</div>
              <div className="category-badge badge-diversos">ABNT NBR</div>
            </div>
            
            <p className="text-lg leading-relaxed" style={{ color: '#E4E6EB' }}>
              Atuação técnica baseada em{' '}
              <span className="font-semibold" style={{ color: '#00A3C4' }}>padrões internacionais</span> de
              perícia digital, garantindo{' '}
              <span className="font-semibold" style={{ color: '#00A3C4' }}>credibilidade probatória</span> e
              admissibilidade judicial de evidências digitais.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              {[
                { value: '100%', label: 'Cadeia de Custódia' },
                { value: 'Hash', label: 'Integridade Verificada' },
                { value: 'LGPD', label: 'Conformidade Total' }
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-title font-bold mb-2" style={{ color: '#00A3C4' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="contato" className="py-20 px-6" style={{ background: '#070B14' }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
            Pronto para Elevar Sua <span style={{ color: '#00A3C4' }}>Estratégia</span>?
          </h2>
          
          <p className="text-xl mb-8" style={{ color: 'rgba(228,230,235,0.7)' }}>
            Solicite uma avaliação técnica do seu caso ou acesse a plataforma Elite Athena.
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/request-access"
              className="inline-flex px-10 h-12 items-center justify-center rounded-xl font-medium transition-opacity hover:opacity-95"
              style={{
                background: 'linear-gradient(130deg, #00A3C4, #146B8C)',
                color: '#000',
                boxShadow: '0 24px 60px rgba(0,0,0,0.35)'
              }}
            >
              Solicitar Avaliação
            </Link>
            <Link
              to="/login"
              className="inline-flex px-10 h-12 items-center justify-center rounded-xl border backdrop-blur-sm transition-all"
              style={{
                borderColor: 'rgba(199,190,183,0.4)',
                color: 'rgba(228,230,235,0.9)',
                background: 'rgba(255,255,255,0.05)'
              }}
            >
              Acessar Plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.1)'
      }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-title font-bold mb-4" style={{ color: '#00A3C4' }}>
                ELITE ATHENA
              </div>
              <p className="text-sm" style={{ color: 'rgba(228,230,235,0.6)' }}>
                Elite – Estratégias em Perícia e Investigação Criminal
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#E4E6EB' }}>Links</h4>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(228,230,235,0.6)' }}>
                <div><a href="#" className="hover:text-white transition-colors">Políticas de Privacidade</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></div>
                <div><a href="#" className="hover:text-white transition-colors">LGPD</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#E4E6EB' }}>Certificações</h4>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(228,230,235,0.6)' }}>
                <div>✓ ISO/IEC 27037</div>
                <div>✓ ISO 27001</div>
                <div>✓ ABNT NBR</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm" style={{
            borderColor: 'rgba(255,255,255,0.1)',
            color: 'rgba(228,230,235,0.5)'
          }}>
            <div className="verified-seal mb-4">
              Verified by Elite Seal 3D
            </div>
            © 2025 Elite Athena. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
