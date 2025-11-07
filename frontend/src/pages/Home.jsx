import React from 'react';
import { Link } from 'react-router-dom';

const HomeModern = () => {
  const modules = [
    { title: 'Advocacia', icon: '⚖️', desc: 'Gestão jurídica' },
    { title: 'Perícia Digital', icon: '🔬', desc: 'Ferramentas forenses' },
    { title: 'Administração', icon: '💼', desc: 'Gestão e governança' },
    { title: 'Comunicação', icon: '💬', desc: 'Chat e colaboração' },
    { title: 'Sala de Aula', icon: '🎓', desc: 'Cursos e mentorias' },
    { title: 'Diversos', icon: '🧮', desc: 'Calculadoras e ferramentas' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0a1628 0%, #050a0f 100%)',
      color: '#F2F6F9',
      fontFamily: 'Manrope, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(10,14,18,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,229,255,0.1)',
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <img src="/logo-ap-elite.svg" alt="AP Elite" style={{ height: '50px' }} />
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/login" style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(230,183,106,0.3)',
              color: '#F2F6F9',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '600',
              background: 'rgba(230,183,106,0.05)',
              transition: 'all 0.3s'
            }}>
              Minha Conta
            </Link>
            <Link to="/login" style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00E5FF, #9E6CFF)',
              color: '#0A0E12',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '700',
              boxShadow: '0 0 20px rgba(0,229,255,0.4)',
              transition: 'all 0.3s'
            }}>
              Sair
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Welcome */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '800',
            marginBottom: '1rem',
            background: 'linear-gradient(120deg, #00E5FF, #E6B76A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Bem-vinda ao Elite Athena
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#9AA6B2' }}>
            Selecione um módulo para começar
          </p>
        </div>

        {/* Modules Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {modules.map((module, idx) => (
            <Link
              key={idx}
              to={`/athena/${module.title.toLowerCase()}-dashboard`}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0,229,255,0.1)',
                borderRadius: '16px',
                padding: '2rem',
                textDecoration: 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(230,183,106,0.4)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(230,183,106,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(0,229,255,0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  {module.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#F2F6F9',
                  marginBottom: '0.5rem'
                }}>
                  {module.title}
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#9AA6B2',
                  lineHeight: '1.6'
                }}>
                  {module.desc}
                </p>
              </div>
              
              <div style={{
                marginTop: '1.5rem',
                color: '#00E5FF',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Acessar <span>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Access */}
        <div>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#F2F6F9'
          }}>
            Acesso Rápido
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {[
              { name: 'Evidence Vault', icon: '🔒', path: '/athena/evidence-vault' },
              { name: 'Transcrição VFT', icon: '🎙️', path: '/athena/transcription-vft' },
              { name: 'Calculadoras', icon: '🧮', path: '/athena/calculadoras' },
              { name: 'Elite Seal', icon: '🛡️', path: '/athena/elite-seal' },
              { name: 'Chat EliteLex', icon: '🤖', path: '/athena/chat-elitelex' },
              { name: 'Analytics', icon: '📊', path: '/athena/analytics' },
              { name: 'Marketplace', icon: '🔌', path: '/athena/marketplace' },
              { name: 'Storage Config', icon: '☁️', path: '/athena/storage-config' }
            ].map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(0,229,255,0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(0,229,255,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(0,229,255,0.08)';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <span style={{ 
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#F2F6F9'
                }}>
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeModern;
