import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const GamificationDashboard = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const studentId = localStorage.getItem('user_id') || 'test-student';

  useEffect(() => {
    loadStats();
    loadLeaderboard();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/sala-aula/gamification/${studentId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/sala-aula/leaderboard`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            <span style={{ color: '#00A3C4' }}>Gamificação</span> & Conquistas 🎮
          </h1>
        </div>

        {stats && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Stats do Aluno */}
            <div className="cipher-glass p-6">
              <h3 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
                Seu Progresso
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(0,163,196,0.1)' }}>
                  <div className="text-4xl font-title font-bold" style={{ color: '#00A3C4' }}>
                    {stats.total_points}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(228,230,235,0.7)' }}>Pontos Totais</div>
                </div>
                
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(0,163,196,0.1)' }}>
                  <div className="text-4xl font-title font-bold" style={{ color: '#00A3C4' }}>
                    Nível {stats.level}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(228,230,235,0.7)' }}>Nível Atual</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-2xl font-title font-bold" style={{ color: '#27AE60' }}>
                    {stats.courses_completed}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>Cursos Completos</div>
                </div>
                
                <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-2xl font-title font-bold" style={{ color: '#C026D3' }}>
                    {stats.certificates_earned}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>Certificados</div>
                </div>
              </div>

              {stats.next_level_points && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-2" style={{ color: '#00A3C4' }}>
                    <span>Próximo Nível</span>
                    <span>{stats.total_points} / {stats.next_level_points}</span>
                  </div>
                  <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${(stats.total_points / stats.next_level_points * 100)}%`,
                        background: 'linear-gradient(90deg, #00A3C4, #27AE60)'
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="cipher-glass p-6">
              <h3 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
                Conquistas
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {stats.badges.map((badge) => (
                  <div key={badge.id} className="text-center p-4 rounded-lg" style={{ background: 'rgba(0,163,196,0.1)' }}>
                    <div className="text-5xl mb-2">{badge.icon}</div>
                    <div className="text-sm font-semibold" style={{ color: '#E4E6EB' }}>
                      {badge.name}
                    </div>
                  </div>
                ))}
              </div>

              {stats.badges.length === 0 && (
                <div className="text-center py-12" style={{ color: 'rgba(228,230,235,0.6)' }}>
                  <div className="text-5xl mb-4">🏆</div>
                  <p>Complete cursos para ganhar badges!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="cipher-glass p-6">
          <h3 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
            Ranking Elite 🏆
          </h3>
          
          <div className="space-y-3">
            {leaderboard.map((student) => (
              <div 
                key={student.student_id}
                className="flex items-center gap-4 p-4 rounded-lg"
                style={{ background: student.rank <= 3 ? 'rgba(0,163,196,0.1)' : 'rgba(255,255,255,0.05)' }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-title font-bold text-xl"
                  style={{
                    background: student.rank === 1 ? '#FFD700' : student.rank === 2 ? '#C0C0C0' : student.rank === 3 ? '#CD7F32' : 'rgba(0,163,196,0.2)',
                    color: student.rank <= 3 ? '#000' : '#00A3C4'
                  }}
                >
                  {student.rank}
                </div>
                
                <div className="flex-1">
                  <div className="font-bold" style={{ color: '#E4E6EB' }}>
                    {student.name}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>
                    {student.courses} cursos concluídos
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-title font-bold" style={{ color: '#00A3C4' }}>
                    {Math.round(student.points)}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>pontos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
