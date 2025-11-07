import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/elite-forensic.css';
import EliteWatermark from '../../components/EliteWatermark';
import EliteSignature from '../../components/EliteSignature';

const Home = () => {
  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #0a1628 0%, #050a0f 100%)' }}>
      <EliteWatermark />
      
      {/* Header Premium */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(10,14,18,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,229,255,0.1)'
      }}>
        <div className="mx-auto max-w-screen-xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(230,183,106,0.2))',
              border: '1px solid rgba(0,229,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '24px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #00E5FF, #E6B76A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>E</span>
            </div>
            <div>
              <div style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '1.75rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #00E5FF, #E6B76A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.08em'
              }}>
                ELITE
              </div>
              <div style={{
                fontSize: '0.625rem',
                color: '#9AA6B2',
                letterSpacing: '0.15em',
                marginTop: '-4px'
              }}>
                ATHENA
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8" style={{ color: 'rgba(242,246,249,0.8)', fontSize: '0.9rem', fontWeight: '500' }}>
            <a href="#sobre" style={{ transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#00E5FF'} onMouseOut={(e) => e.target.style.color = 'rgba(242,246,249,0.8)'}>Sobre</a>
            <a href="#servicos" style={{ transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#00E5FF'} onMouseOut={(e) => e.target.style.color = 'rgba(242,246,249,0.8)'}>Serviços</a>
            <a href="#diferenciais" style={{ transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#00E5FF'} onMouseOut={(e) => e.target.style.color = 'rgba(242,246,249,0.8)'}>Diferenciais</a>
            <a href="#contato" style={{ transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#00E5FF'} onMouseOut={(e) => e.target.style.color = 'rgba(242,246,249,0.8)'}>Contato</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              style={{
                padding: '0.625rem 1.5rem',
                borderRadius: '10px',
                border: '1px solid rgba(230,183,106,0.3)',
                color: '#F2F6F9',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s',
                background: 'rgba(230,183,106,0.05)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(230,183,106,0.15)';
                e.target.style.borderColor = '#E6B76A';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(230,183,106,0.05)';
                e.target.style.borderColor = 'rgba(230,183,106,0.3)';
              }}
            >
              Acessar
            </Link>
            <Link
              to="/request-access"
              style={{
                padding: '0.625rem 1.5rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00E5FF, #9E6CFF)',
                color: '#0A0E12',
                fontSize: '0.9rem',
                fontWeight: '700',
                transition: 'all 0.3s',
                boxShadow: '0 0 20px rgba(0,229,255,0.4)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 0 30px rgba(0,229,255,0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 20px rgba(0,229,255,0.4)';
              }}
            >
              Solicitar Acesso
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Melhorado */}
      <section style={{
        padding: '8rem 1.5rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Partículas de fundo */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(0,229,255,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(158,108,255,0.03) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            maxWidth: '900px',
            margin: '0 auto',
            background: 'linear-gradient(120deg, #00E5FF 0%, #E6B76A 50%, #9E6CFF 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient-shift 8s ease infinite'
          }}>
            Tecnologia, Direito e <br />Precisão Forense <br />em um único ecossistema
          </h1>

          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '1.125rem',
            color: '#9AA6B2',
            maxWidth: '700px',
            margin: '2rem auto',
            lineHeight: '1.7'
          }}>
            Perícia digital, defesa técnica e ciberinteligência com governança <strong style={{ color: '#00E5FF' }}>ISO/IEC 27037</strong> e <strong style={{ color: '#00E5FF' }}>ISO 27001</strong> — rigor e estética Elite.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <Link
              to="/request-access"
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00E5FF, #9E6CFF)',
                color: '#0A0E12',
                fontSize: '1rem',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 0 30px rgba(0,229,255,0.5)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 0 40px rgba(0,229,255,0.7)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 30px rgba(0,229,255,0.5)';
              }}
            >
              Solicitar Avaliação de Caso
            </Link>
            
            <a
              href="#servicos"
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(230,183,106,0.4)',
                color: '#F2F6F9',
                fontSize: '1rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                background: 'rgba(230,183,106,0.05)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(230,183,106,0.15)';
                e.target.style.borderColor = '#E6B76A';
                e.target.style.boxShadow = '0 0 20px rgba(230,183,106,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(230,183,106,0.05)';
                e.target.style.borderColor = 'rgba(230,183,106,0.4)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Conheça os Serviços
            </a>
          </div>

          {/* Indicadores de conformidade */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '3rem',
            fontSize: '0.8rem',
            color: '#9AA6B2',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2EF2B6' }}></span>
              Cadeia de Custódia
            </div>
            <span>ISO/IEC 27037 · ISO 27001 · LGPD</span>
          </div>
        </div>
      </section>

      {/* Pilares - Cards Premium */}
      <section id="servicos" style={{ padding: '4rem 1.5rem', background: '#0A0E12' }}>
        <div className="mx-auto max-w-screen-xl">
          <h2 style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#F2F6F9'
          }}>
            Pilares <span style={{ color: '#00E5FF' }}>Elite</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                title: 'Perícia Digital Forense',
                desc: 'Aquisição, análise, metadados e integridade com cadeia de custódia.',
                icon: '🔬'
              },
              {
                title: 'Defesa Técnica Estratégica',
                desc: 'Análise processual, nulidades, prescrição, dosimetria assistida por IA.',
                icon: '⚖️'
              },
              {
                title: 'Ciberinteligência e OSINT',
                desc: 'Rastreamento, relacionamentos, surface/dark web e alertas estratégicos.',
                icon: '🕵️'
              },
              {
                title: 'Governança e Conformidade',
                desc: 'ISO 27001, LGPD, auditoria e relatórios com Elite Seal.',
                icon: '🛡️'
              }
            ].map((pilar, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0,229,255,0.1)',
                  borderRadius: '16px',
                  padding: '2rem',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(230,183,106,0.4)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(230,183,106,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(0,229,255,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  background: 'rgba(0,229,255,0.1)',
                  border: '1px solid rgba(0,229,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '1.5rem'
                }}>
                  {pilar.icon}
                </div>
                <h3 style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#F2F6F9',
                  marginBottom: '0.75rem'
                }}>
                  {pilar.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#9AA6B2',
                  lineHeight: '1.6'
                }}>
                  {pilar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conformidade - Seção Melhorada */}
      <section id="diferenciais" style={{
        padding: '4rem 1.5rem',
        background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.03), transparent)'
      }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: '#F2F6F9'
          }}>
            Conformidade e <span style={{ color: '#00E5FF' }}>Método</span>
          </h2>
          
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,229,255,0.15)',
            borderRadius: '20px',
            padding: '3rem',
            boxShadow: '0 0 40px rgba(0,229,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}>
              {['ISO/IEC 27037', 'ISO 27001', 'ABNT NBR'].map((selo, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    background: 'rgba(0,229,255,0.15)',
                    border: '1px solid rgba(0,229,255,0.3)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#00E5FF',
                    letterSpacing: '0.1em'
                  }}
                >
                  {selo}
                </div>
              ))}
            </div>
            
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '1.125rem',
              color: '#F2F6F9',
              lineHeight: '1.8',
              marginBottom: '2.5rem'
            }}>
              Atuação técnica baseada em <span style={{ color: '#00E5FF', fontWeight: '600' }}>padrões internacionais</span> de
              perícia digital, garantindo <span style={{ color: '#E6B76A', fontWeight: '600' }}>credibilidade probatória</span> e
              admissibilidade judicial de evidências digitais.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '2rem',
              marginTop: '2.5rem'
            }}>
              {[
                { value: '100%', label: 'Cadeia de Custódia' },
                { value: 'SHA-512', label: 'Hash Verificado' },
                { value: 'LGPD', label: 'Compliance' }
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '2rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #00E5FF, #E6B76A)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#9AA6B2'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="contato" style={{ padding: '5rem 1.5rem', background: '#0A0E12' }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#F2F6F9'
          }}>
            Pronto para Elevar Sua <span style={{ color: '#E6B76A' }}>Estratégia</span>?
          </h2>
          
          <p style={{
            fontSize: '1.125rem',
            color: '#9AA6B2',
            marginBottom: '2.5rem'
          }}>
            Solicite uma avaliação técnica do seu caso ou acesse a plataforma Elite Athena.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/request-access"
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00E5FF, #9E6CFF)',
                color: '#0A0E12',
                fontSize: '1rem',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 0 30px rgba(0,229,255,0.5)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 0 40px rgba(0,229,255,0.7)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 30px rgba(0,229,255,0.5)';
              }}
            >
              Solicitar Avaliação
            </Link>
            
            <Link
              to="/login"
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(230,183,106,0.4)',
                color: '#F2F6F9',
                fontSize: '1rem',
                fontWeight: '600',
                textDecoration: 'none',
                background: 'rgba(230,183,106,0.05)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(230,183,106,0.15)';
                e.target.style.borderColor = '#E6B76A';
                e.target.style.boxShadow = '0 0 20px rgba(230,183,106,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(230,183,106,0.05)';
                e.target.style.borderColor = 'rgba(230,183,106,0.4)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Acessar Plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <div className="mx-auto max-w-6xl">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <div>
              <EliteSignature />
            </div>
            
            <div>
              <h4 style={{ fontWeight: '700', marginBottom: '1rem', color: '#F2F6F9' }}>Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#9AA6B2' }}>
                <a href="#" style={{ color: '#9AA6B2', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#00E5FF'} onMouseOut={(e) => e.target.style.color = '#9AA6B2'}>Políticas de Privacidade</a>
                <a href="#" style={{ color: '#9AA6B2', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#00E5FF'} onMouseOut={(e) => e.target.style.color = '#9AA6B2'}>Termos de Uso</a>
                <a href="#" style={{ color: '#9AA6B2', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#00E5FF'} onMouseOut={(e) => e.target.style.color = '#9AA6B2'}>LGPD</a>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontWeight: '700', marginBottom: '1rem', color: '#F2F6F9' }}>Certificações</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#9AA6B2' }}>
                <div>✓ ISO/IEC 27037</div>
                <div>✓ ISO 27001</div>
                <div>✓ ABNT NBR</div>
              </div>
            </div>
          </div>
          
          <div style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(0,229,255,0.1)',
              border: '1px solid rgba(0,229,255,0.2)',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#00E5FF',
              marginBottom: '1rem'
            }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#00E5FF',
                color: '#0A0E12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: '900'
              }}>✓</span>
              Verified by Elite Seal 3D
            </div>
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(154,166,178,0.6)'
            }}>
              © 2025 Elite Athena. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
      
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
