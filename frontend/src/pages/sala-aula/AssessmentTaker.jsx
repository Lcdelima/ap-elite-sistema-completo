import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const AssessmentTaker = ({ assessmentId }) => {
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const studentId = localStorage.getItem('user_id') || 'test-student';

  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  useEffect(() => {
    if (assessment?.time_limit && !result) {
      setTimeRemaining(assessment.time_limit * 60); // converter para segundos
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitAssessment(); // Auto-submit ao expirar
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [assessment]);

  const loadAssessment = async () => {
    // Mock assessment
    const mockAssessment = {
      id: assessmentId || 'test-assessment',
      title: 'Avaliação Final',
      type: 'quiz',
      passing_score: 70,
      time_limit: 30,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'Qual é o prazo prescricional para crimes com pena máxima de 4 anos?',
          options: ['3 anos', '4 anos', '8 anos', '12 anos'],
          correct_answer: '8 anos'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'O que significa E2EE?',
          options: ['Encryption End-to-End', 'Evidence Extraction Engine', 'Elite Enterprise Edition', 'Electronic Evidence Exam'],
          correct_answer: 'Encryption End-to-End'
        }
      ]
    };
    setAssessment(mockAssessment);
  };

  const submitAssessment = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/sala-aula/assessments/${assessment.id}/submit`,
        { student_id: studentId, answers },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      setResult(response.data);
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!assessment) {
    return <div className="min-h-screen bg-elite p-6 flex items-center justify-center" style={{ color: '#E4E6EB' }}>Carregando...</div>;
  }

  if (result) {
    return (
      <div className="min-h-screen bg-elite p-6">
        <div className="container mx-auto max-w-3xl">
          <div className="cipher-glass p-10 text-center">
            <div className="text-6xl mb-6">
              {result.passed ? '✅' : '❌'}
            </div>
            <h1 className="text-4xl font-title font-bold mb-4" style={{ 
              color: result.passed ? '#27AE60' : '#E74C3C' 
            }}>
              {result.passed ? 'Aprovado!' : 'Reprovado'}
            </h1>
            <div className="text-3xl font-title font-bold mb-6" style={{ color: '#00A3C4' }}>
              Nota: {result.score}%
            </div>
            <div className="text-sm mb-6" style={{ color: 'rgba(228,230,235,0.7)' }}>
              {result.correct_answers} de {result.total_questions} questões corretas
            </div>
            
            {result.passed && (
              <div className="p-4 rounded-lg mb-6" style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)' }}>
                <div className="text-sm" style={{ color: '#27AE60' }}>
                  🎓 Você está apto a receber o certificado!
                </div>
              </div>
            )}
            
            <button className="btn-elite btn-elite-primary">
              Voltar ao Curso
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-title font-bold" style={{ color: '#E4E6EB' }}>
              {assessment.title}
            </h1>
            <div className="text-sm mt-2" style={{ color: 'rgba(228,230,235,0.6)' }}>
              Nota mínima para aprovação: {assessment.passing_score}%
            </div>
          </div>
          
          {timeRemaining !== null && (
            <div className="cipher-glass p-4">
              <div className="text-xs mb-1" style={{ color: '#00A3C4' }}>Tempo Restante</div>
              <div className="text-2xl font-title font-bold" style={{ 
                color: timeRemaining < 300 ? '#E74C3C' : '#E4E6EB' 
              }}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {assessment.questions.map((question, idx) => (
            <div key={question.id} className="cipher-glass p-6">
              <div className="flex gap-3 mb-4">
                <div className="text-xl font-title font-bold" style={{ color: '#00A3C4' }}>
                  {idx + 1}.
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold mb-4" style={{ color: '#E4E6EB' }}>
                    {question.question}
                  </div>
                  
                  {question.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {question.options.map((option, optIdx) => (
                        <label
                          key={optIdx}
                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                          style={{
                            background: answers[question.id] === option ? 'rgba(0,163,196,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${answers[question.id] === option ? 'rgba(0,163,196,0.4)' : 'rgba(255,255,255,0.1)'}'
                          }}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            checked={answers[question.id] === option}
                            onChange={() => setAnswers({...answers, [question.id]: option})}
                          />
                          <span style={{ color: '#E4E6EB' }}>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={submitAssessment}
            disabled={Object.keys(answers).length < assessment.questions.length}
            className="btn-elite btn-elite-primary px-10"
          >
            📝 Enviar Avaliação
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTaker;
