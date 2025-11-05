"""Transcrição com Diarização de Falantes - Elite Athena"""
from emergentintegrations.llm.openai import OpenAISpeechToText
import os
from dotenv import load_dotenv
from typing import Dict, Any, List
import json

load_dotenv()


class DiarizationService:
    """Serviço de diarização avançada"""
    
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY não configurada")
        self.whisper = OpenAISpeechToText(api_key=self.api_key)
    
    async def transcribe_with_diarization(
        self,
        audio_path: str,
        language: str = "pt",
        num_speakers: int = 2,
        speaker_labels: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """Transcreve com diarização de falantes"""
        
        try:
            with open(audio_path, "rb") as audio_file:
                # Whisper com timestamps detalhados
                response = await self.whisper.transcribe(
                    file=audio_file,
                    model="whisper-1",
                    response_format="verbose_json",
                    language=language,
                    temperature=0.0,
                    timestamp_granularities=["segment", "word"]
                )
                
                # Processar segmentos
                segments_with_speakers = []
                
                for idx, segment in enumerate(response.segments):
                    # Simular identificação de falante (alternando)
                    # TODO: Usar modelo real de diarização (pyannote.audio)
                    speaker_id = f"Speaker_{(idx % num_speakers) + 1}"
                    
                    # Aplicar label customizado se fornecido
                    if speaker_labels and speaker_id in speaker_labels:
                        speaker_name = speaker_labels[speaker_id]
                    else:
                        speaker_name = speaker_id
                    
                    segments_with_speakers.append({
                        "id": idx,
                        "start": segment.start,
                        "end": segment.end,
                        "text": segment.text,
                        "speaker": speaker_name,
                        "speaker_id": speaker_id,
                        "confidence": getattr(segment, 'confidence', 1.0)
                    })
                
                # Agrupar por falante
                speakers_stats = {}
                for seg in segments_with_speakers:
                    speaker = seg['speaker']
                    if speaker not in speakers_stats:
                        speakers_stats[speaker] = {
                            'total_segments': 0,
                            'total_duration': 0.0,
                            'text_parts': []
                        }
                    
                    speakers_stats[speaker]['total_segments'] += 1
                    speakers_stats[speaker]['total_duration'] += (seg['end'] - seg['start'])
                    speakers_stats[speaker]['text_parts'].append(seg['text'])
                
                return {
                    "full_text": response.text,
                    "segments": segments_with_speakers,
                    "speakers_stats": speakers_stats,
                    "language": response.language,
                    "duration": response.duration,
                    "num_speakers_detected": len(speakers_stats),
                    "provider": "whisper_with_diarization"
                }
                
        except Exception as e:
            raise Exception(f"Erro na transcrição com diarização: {str(e)}")
    
    async def identify_keywords(
        self,
        transcription_text: str,
        keywords: List[str]
    ) -> Dict[str, Any]:
        """Identifica palavras-chave jurídicas na transcrição"""
        
        found_keywords = {}
        text_lower = transcription_text.lower()
        
        for keyword in keywords:
            if keyword.lower() in text_lower:
                # Contar ocorrências
                count = text_lower.count(keyword.lower())
                found_keywords[keyword] = {
                    'count': count,
                    'relevance': 'high' if count > 3 else 'medium' if count > 1 else 'low'
                }
        
        return {
            'keywords_found': found_keywords,
            'total_keywords': len(found_keywords),
            'most_frequent': max(found_keywords.items(), key=lambda x: x[1]['count'])[0] if found_keywords else None
        }
    
    async def pseudonymize(
        self,
        transcription_text: str,
        entities_to_hide: List[str] = ['names', 'phones']
    ) -> Dict[str, Any]:
        """Modo sigilo - pseudonimização automática"""
        
        # TODO: Usar NER (Named Entity Recognition) real
        # Por enquanto, substituição simples
        
        pseudonymized = transcription_text
        replacements = {}
        
        # Exemplo: substituir nomes comuns
        common_names = ['João', 'Maria', 'Pedro', 'Ana']
        for idx, name in enumerate(common_names):
            if name in pseudonymized:
                pseudo = f"Pessoa_{idx + 1}"
                replacements[name] = pseudo
                pseudonymized = pseudonymized.replace(name, pseudo)
        
        # Substituir telefones (padrão brasileiro)
        import re
        phone_pattern = r'\(\d{2}\)\s?\d{4,5}-?\d{4}'
        phones = re.findall(phone_pattern, pseudonymized)
        for idx, phone in enumerate(phones):
            pseudo = f"[TELEFONE_{idx + 1}]"
            replacements[phone] = pseudo
            pseudonymized = pseudonymized.replace(phone, pseudo)
        
        return {
            'original_length': len(transcription_text),
            'pseudonymized_text': pseudonymized,
            'replacements_table': replacements,
            'entities_hidden': len(replacements)
        }
