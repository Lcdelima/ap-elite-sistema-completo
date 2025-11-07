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
            <img 
              src="/logo-ap-elite.svg" 
              alt="AP Elite Logo" 
              style={{ height: '60px', width: 'auto' }}
            />
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
