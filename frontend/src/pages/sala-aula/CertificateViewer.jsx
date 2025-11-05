import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';
import QRCode from 'qrcode.react';

const CertificateViewer = () => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const studentId = localStorage.getItem('user_id') || 'test-student';
  const [courseId, setCourseId] = useState('');

  const issueCertificate = async () => {
    if (!courseId) {
      alert('Digite o ID do curso');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/sala-aula/certificates/issue`,
        { student_id: studentId, course_id: courseId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      // Buscar certificado completo
      const certResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/sala-aula/certificates/verify/${response.data.certificate_id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      setCertificate(certResponse.data);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            <span style={{ color: '#00A3C4' }}>Certificados</span> Elite 🎖️
          </h1>
        </div>

        {!certificate ? (
          <div className="cipher-glass p-8">
            <h3 className="text-xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
              Emitir Certificado
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  ID do Curso Concluído
                </label>
                <input
                  type="text"
                  className="input-elite"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  placeholder="course-uuid"
                />
              </div>

              <button
                onClick={issueCertificate}
                disabled={loading}
                className="btn-elite btn-elite-primary w-full"
              >
                {loading ? 'Verificando...' : '🎓 Emitir Certificado'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Certificado */}
            <div 
              className="p-12 rounded-lg border-4 mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
                borderColor: '#00A3C4',
                color: '#000'
              }}
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-4xl font-title font-bold mb-2">CERTIFICADO</h2>
                <div className="text-sm" style={{ color: '#666' }}>Elite Athena - Educação Jurídica e Forense</div>
              </div>

              <div className="text-center mb-8">
                <div className="text-sm mb-2" style={{ color: '#666' }}>Certificamos que</div>
                <div className="text-3xl font-title font-bold mb-2">{certificate.student_name}</div>
                <div className="text-sm mb-6" style={{ color: '#666' }}>concluiu com êxito o curso</div>
                <div className="text-2xl font-bold mb-2" style={{ color: '#00A3C4' }}>
                  {certificate.course_title}
                </div>
                <div className="text-sm" style={{ color: '#666' }}>
                  Carga horária: {certificate.hours} horas
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-sm" style={{ color: '#666' }}>
                  <div>Data: {new Date(certificate.completion_date).toLocaleDateString('pt-BR')}</div>
                  <div className="mt-2">Código: <span className="font-mono font-bold">{certificate.verification_code}</span></div>
                </div>
                
                <div>
                  <QRCode value={certificate.qr_code} size={80} />
                  <div className="text-xs text-center mt-1" style={{ color: '#666' }}>Verificar</div>
                </div>
              </div>

              <div className="text-center mt-8 pt-6 border-t" style={{ borderColor: '#ddd' }}>
                <div className="text-sm" style={{ color: '#666' }}>
                  Instrutor: {certificate.instructor}
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button className="btn-elite btn-elite-primary">
                📥 Download PDF
              </button>
              <button className="btn-elite btn-elite-secondary">
                🔗 Compartilhar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateViewer;
