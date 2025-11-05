import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const CoursePlayer = ({ match }) => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const videoRef = useRef(null);
  const courseId = match?.params?.courseId || 'test-course';
  const studentId = localStorage.getItem('user_id') || 'test-student';

  useEffect(() => {
    loadCourse();
    loadLessons();
    loadProgress();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/sala-aula/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setCourse(response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadLessons = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/sala-aula/courses/${courseId}/lessons`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setLessons(response.data.lessons || []);
      if (response.data.lessons.length > 0) {
        setCurrentLesson(response.data.lessons[0]);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/sala-aula/progress/${studentId}/${courseId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setProgress(response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const markAsCompleted = async (lessonId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/sala-aula/progress/complete-lesson`,
        { student_id: studentId, course_id: courseId, lesson_id: lessonId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      alert('✅ Aula concluída!');
      loadProgress();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.completed_lessons?.includes(lessonId) || false;
  };

  return (
    <div className="min-h-screen bg-elite">
      <div className="flex">
        {/* Sidebar - Lista de Aulas */}
        <div className="w-80 border-r" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <h2 className="font-title font-bold" style={{ color: '#E4E6EB' }}>
              {course?.title || 'Curso'}
            </h2>
            {progress && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1" style={{ color: '#00A3C4' }}>
                  <span>Progresso</span>
                  <span>{progress.total_progress}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div 
                    className="h-full rounded-full"
                    style={{ width: `${progress.total_progress}%`, background: '#00A3C4' }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                onClick={() => setCurrentLesson(lesson)}
                className="p-4 border-b cursor-pointer transition-all"
                style={{
                  borderColor: 'rgba(255,255,255,0.05)',
                  background: currentLesson?.id === lesson.id ? 'rgba(0,163,196,0.1)' : 'transparent'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl">
                    {isLessonCompleted(lesson.id) ? '✅' : `${idx + 1}.`}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: '#E4E6EB' }}>
                      {lesson.title}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'rgba(228,230,235,0.6)' }}>
                      {Math.floor(lesson.video_duration / 60)}:{(lesson.video_duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1">
          {currentLesson ? (
            <div className="p-6">
              <h1 className="text-3xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
                {currentLesson.title}
              </h1>

              {/* Video */}
              <div className="cipher-glass p-6 mb-6">
                {currentLesson.video_url ? (
                  <video
                    ref={videoRef}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '500px', background: '#000' }}
                    src={currentLesson.video_url}
                  >
                    Seu navegador não suporta vídeo.
                  </video>
                ) : (
                  <div className="text-center py-20" style={{ color: 'rgba(228,230,235,0.6)' }}>
                    <div className="text-5xl mb-4">🎥</div>
                    <p>Vídeo não disponível</p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>
                    Duração: {Math.floor(currentLesson.video_duration / 60)} minutos
                  </div>
                  
                  {!isLessonCompleted(currentLesson.id) && (
                    <button
                      onClick={() => markAsCompleted(currentLesson.id)}
                      className="btn-elite btn-elite-primary text-sm"
                    >
                      ✔️ Marcar como Concluída
                    </button>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div className="cipher-glass p-6 mb-6">
                <h3 className="font-title font-bold mb-3" style={{ color: '#E4E6EB' }}>
                  Sobre esta Aula
                </h3>
                <p className="text-sm" style={{ color: 'rgba(228,230,235,0.8)' }}>
                  {currentLesson.description}
                </p>
              </div>

              {/* Materiais */}
              {currentLesson.materials && currentLesson.materials.length > 0 && (
                <div className="cipher-glass p-6">
                  <h3 className="font-title font-bold mb-3" style={{ color: '#E4E6EB' }}>
                    Materiais de Apoio
                  </h3>
                  <div className="space-y-2">
                    {currentLesson.materials.map((material, idx) => (
                      <a
                        key={idx}
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#00A3C4' }}
                      >
                        <span>📄</span>
                        <span>{material.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full" style={{ color: 'rgba(228,230,235,0.6)' }}>
              <div className="text-center">
                <div className="text-6xl mb-4">🎓</div>
                <p>Selecione uma aula para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
