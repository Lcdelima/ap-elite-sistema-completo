"""Módulo Completo de Sala de Aula - Elite Athena"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/sala-aula", tags=["sala-aula"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

VIDEOS_DIR = "/app/backend/sala_aula/videos"
os.makedirs(VIDEOS_DIR, exist_ok=True)


# ==================== MODELOS ====================

class Course(BaseModel):
    id: str
    title: str
    description: str
    instructor: str
    category: str
    level: str  # iniciante, intermediario, avancado
    duration_hours: int
    thumbnail: Optional[str]
    lessons: List[str]  # IDs das aulas
    assessments: List[str]  # IDs das provas
    certificate_template: Optional[str]
    created_at: str


class Lesson(BaseModel):
    id: str
    course_id: str
    title: str
    description: str
    video_url: Optional[str]
    video_duration: int  # segundos
    materials: List[Dict[str, str]]  # PDFs, links
    order: int
    created_at: str


class Assessment(BaseModel):
    id: str
    course_id: str
    title: str
    type: str  # quiz, prova, trabalho
    questions: List[Dict[str, Any]]
    passing_score: int  # percentual mínimo
    time_limit: Optional[int]  # minutos
    attempts_allowed: int
    created_at: str


class StudentProgress(BaseModel):
    student_id: str
    course_id: str
    completed_lessons: List[str]
    assessment_scores: Dict[str, float]
    total_progress: float  # percentual
    started_at: str
    completed_at: Optional[str]
    certificate_issued: bool


# ==================== CURSOS ====================

@router.post("/courses")
async def create_course(data: Course):
    """Cria novo curso"""
    
    course = data.model_dump()
    course['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.courses.insert_one(course)
    
    return {
        "course_id": data.id,
        "message": "Curso criado"
    }


@router.get("/courses")
async def list_courses(category: Optional[str] = None):
    """Lista cursos"""
    
    query = {}
    if category:
        query['category'] = category
    
    courses = await db.courses.find(query).to_list(length=100)
    
    return {"courses": courses}


@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    """Obtém detalhes do curso"""
    
    course = await db.courses.find_one({"id": course_id})
    
    if not course:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    
    return course


# ==================== AULAS ====================

@router.post("/lessons")
async def create_lesson(data: Lesson):
    """Cria nova aula"""
    
    lesson = data.model_dump()
    lesson['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.lessons.insert_one(lesson)
    
    # Adicionar ao curso
    await db.courses.update_one(
        {"id": data.course_id},
        {"$push": {"lessons": data.id}}
    )
    
    return {"lesson_id": data.id}


@router.post("/lessons/upload-video")
async def upload_video(
    file: UploadFile = File(...),
    lesson_id: str = Form(...)
):
    """Upload de vídeo da aula"""
    
    # Salvar vídeo
    video_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    video_path = os.path.join(VIDEOS_DIR, f"{video_id}{file_ext}")
    
    with open(video_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Atualizar aula
    await db.lessons.update_one(
        {"id": lesson_id},
        {"$set": {"video_url": f"/videos/{video_id}{file_ext}"}}
    )
    
    return {
        "video_id": video_id,
        "video_url": f"/videos/{video_id}{file_ext}",
        "size_mb": round(len(content) / 1024 / 1024, 2)
    }


@router.get("/courses/{course_id}/lessons")
async def get_course_lessons(course_id: str):
    """Lista aulas do curso em ordem"""
    
    lessons = await db.lessons.find(
        {"course_id": course_id}
    ).sort("order", 1).to_list(length=None)
    
    return {"lessons": lessons}


# ==================== AVALIAÇÕES ====================

@router.post("/assessments")
async def create_assessment(data: Assessment):
    """Cria avaliação/prova"""
    
    assessment = data.model_dump()
    assessment['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.assessments.insert_one(assessment)
    
    # Adicionar ao curso
    await db.courses.update_one(
        {"id": data.course_id},
        {"$push": {"assessments": data.id}}
    )
    
    return {"assessment_id": data.id}


@router.post("/assessments/{assessment_id}/submit")
async def submit_assessment(
    assessment_id: str,
    student_id: str,
    answers: Dict[str, Any]
):
    """Submete respostas da avaliação"""
    
    assessment = await db.assessments.find_one({"id": assessment_id})
    if not assessment:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    
    # Corrigir automático (múltipla escolha)
    total_questions = len(assessment['questions'])
    correct_answers = 0
    
    for question in assessment['questions']:
        question_id = question['id']
        student_answer = answers.get(question_id)
        
        if question['type'] == 'multiple_choice':
            if student_answer == question['correct_answer']:
                correct_answers += 1
    
    score = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    passed = score >= assessment['passing_score']
    
    # Salvar resultado
    result = {
        "assessment_id": assessment_id,
        "student_id": student_id,
        "answers": answers,
        "score": round(score, 2),
        "passed": passed,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.assessment_results.insert_one(result)
    
    # Atualizar progresso do aluno
    await db.student_progress.update_one(
        {"student_id": student_id, "course_id": assessment['course_id']},
        {"$set": {f"assessment_scores.{assessment_id}": score}},
        upsert=True
    )
    
    return {
        "score": round(score, 2),
        "passed": passed,
        "correct_answers": correct_answers,
        "total_questions": total_questions
    }


# ==================== PROGRESSO ====================

@router.post("/progress/complete-lesson")
async def complete_lesson(
    student_id: str,
    course_id: str,
    lesson_id: str
):
    """Marca aula como concluída"""
    
    # Atualizar progresso
    result = await db.student_progress.update_one(
        {"student_id": student_id, "course_id": course_id},
        {
            "$addToSet": {"completed_lessons": lesson_id},
            "$set": {"last_activity": datetime.now(timezone.utc).isoformat()}
        },
        upsert=True
    )
    
    # Calcular progresso total
    progress = await db.student_progress.find_one(
        {"student_id": student_id, "course_id": course_id}
    )
    
    course = await db.courses.find_one({"id": course_id})
    total_lessons = len(course.get('lessons', []))
    completed = len(progress.get('completed_lessons', []))
    
    progress_percent = (completed / total_lessons * 100) if total_lessons > 0 else 0
    
    await db.student_progress.update_one(
        {"student_id": student_id, "course_id": course_id},
        {"$set": {"total_progress": round(progress_percent, 2)}}
    )
    
    return {
        "completed": completed,
        "total": total_lessons,
        "progress": round(progress_percent, 2)
    }


@router.get("/progress/{student_id}/{course_id}")
async def get_progress(student_id: str, course_id: str):
    """Obtém progresso do aluno"""
    
    progress = await db.student_progress.find_one(
        {"student_id": student_id, "course_id": course_id}
    )
    
    if not progress:
        return {
            "student_id": student_id,
            "course_id": course_id,
            "total_progress": 0,
            "completed_lessons": [],
            "assessment_scores": {}
        }
    
    return progress


# ==================== CERTIFICADOS ====================

@router.post("/certificates/issue")
async def issue_certificate(
    student_id: str,
    course_id: str
):
    """Emite certificado automático"""
    
    # Verificar se concluiu o curso
    progress = await db.student_progress.find_one(
        {"student_id": student_id, "course_id": course_id}
    )
    
    if not progress or progress.get('total_progress', 0) < 100:
        raise HTTPException(
            status_code=400,
            detail="Curso não concluído. Progresso: {:.1f}%".format(progress.get('total_progress', 0))
        )
    
    # Verificar aprovação nas provas
    course = await db.courses.find_one({"id": course_id})
    
    for assessment_id in course.get('assessments', []):
        assessment = await db.assessments.find_one({"id": assessment_id})
        score = progress.get('assessment_scores', {}).get(assessment_id, 0)
        
        if score < assessment['passing_score']:
            raise HTTPException(
                status_code=400,
                detail=f"Reprovação na avaliação. Nota: {score}%. Mínimo: {assessment['passing_score']}%"
            )
    
    # Gerar certificado
    certificate_id = str(uuid.uuid4())
    
    student = await db.users.find_one({"id": student_id})
    
    certificate = {
        "id": certificate_id,
        "student_id": student_id,
        "student_name": student.get('name', 'Aluno'),
        "course_id": course_id,
        "course_title": course['title'],
        "instructor": course['instructor'],
        "completion_date": datetime.now(timezone.utc).isoformat(),
        "hours": course['duration_hours'],
        "verification_code": certificate_id[:8].upper(),
        "qr_code": f"https://elite-athena.com/verify/{certificate_id}",
        "issued_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.certificates.insert_one(certificate)
    
    # Marcar no progresso
    await db.student_progress.update_one(
        {"student_id": student_id, "course_id": course_id},
        {
            "$set": {
                "certificate_issued": True,
                "certificate_id": certificate_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "certificate_id": certificate_id,
        "verification_code": certificate['verification_code'],
        "qr_code": certificate['qr_code'],
        "message": "Certificado emitido com sucesso!"
    }


@router.get("/certificates/verify/{certificate_id}")
async def verify_certificate(certificate_id: str):
    """Verifica autenticidade do certificado"""
    
    certificate = await db.certificates.find_one({"id": certificate_id})
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificado não encontrado")
    
    return {
        "valid": True,
        "student_name": certificate['student_name'],
        "course_title": certificate['course_title'],
        "completion_date": certificate['completion_date'],
        "hours": certificate['hours'],
        "instructor": certificate['instructor']
    }


# ==================== GAMIFICAÇÃO ====================

@router.get("/gamification/{student_id}")
async def get_gamification_stats(student_id: str):
    """Estatísticas de gamificação"""
    
    # Calcular pontos
    progress_records = await db.student_progress.find(
        {"student_id": student_id}
    ).to_list(length=None)
    
    total_points = 0
    courses_completed = 0
    certificates_earned = 0
    
    for progress in progress_records:
        # Pontos por progresso
        total_points += int(progress.get('total_progress', 0))
        
        if progress.get('certificate_issued'):
            courses_completed += 1
            certificates_earned += 1
            total_points += 500  # Bônus por conclusão
    
    # Determinar nível
    level = 1
    if total_points > 5000:
        level = 5
    elif total_points > 3000:
        level = 4
    elif total_points > 1500:
        level = 3
    elif total_points > 500:
        level = 2
    
    # Badges
    badges = []
    if courses_completed >= 1:
        badges.append({"id": "first_course", "name": "Primeiro Curso", "icon": "🎓"})
    if courses_completed >= 5:
        badges.append({"id": "expert", "name": "Expert", "icon": "🏆"})
    if total_points > 1000:
        badges.append({"id": "dedicated", "name": "Dedicado", "icon": "🔥"})
    
    return {
        "student_id": student_id,
        "total_points": total_points,
        "level": level,
        "courses_completed": courses_completed,
        "certificates_earned": certificates_earned,
        "badges": badges,
        "next_level_points": [500, 1500, 3000, 5000][level - 1] if level < 5 else None
    }


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Ranking de alunos"""
    
    # Agregar pontos por aluno
    pipeline = [
        {
            "$group": {
                "_id": "$student_id",
                "total_progress": {"$sum": "$total_progress"},
                "courses_completed": {
                    "$sum": {"$cond": [{"$eq": ["$certificate_issued", True]}, 1, 0]}
                }
            }
        },
        {
            "$project": {
                "student_id": "$_id",
                "points": {
                    "$add": [
                        "$total_progress",
                        {"$multiply": ["$courses_completed", 500]}
                    ]
                },
                "courses": "$courses_completed"
            }
        },
        {"$sort": {"points": -1}},
        {"$limit": limit}
    ]
    
    results = await db.student_progress.aggregate(pipeline).to_list(length=limit)
    
    # Adicionar nomes dos alunos
    for idx, result in enumerate(results):
        student = await db.users.find_one({"id": result['student_id']})
        result['rank'] = idx + 1
        result['name'] = student.get('name', 'Aluno') if student else 'Aluno'
    
    return {"leaderboard": results}
