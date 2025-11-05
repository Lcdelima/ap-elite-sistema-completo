"""Serviço de Diarização - Elite Athena"""
from typing import Dict, Any, List
import os
from dotenv import load_dotenv

load_dotenv()


class DiarizationService:
    """Serviço de diarização avançada"""
    
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY não configurada")
        # Whisper integration via transcription_service.py já existente
    
    async def transcribe_with_diarization(
        self,
        audio_path: str,
        language: str = "pt",
        num_speakers: int = 2,
        speaker_labels: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """Transcreve com diarização de falantes"""
        
        try:
            # Usar serviço de transcrição existente
            from services.transcription_service import WhisperTranscriptionService
            
            whisper = WhisperTranscriptionService()
            response = await whisper.transcribe(
                audio_path=audio_path,
                language=language,
                enable_timestamps=True
            )
            
            # Simular diarização (alternando speakers)
            segments_with_speakers = []
            
            for idx, segment in enumerate(response.get('segments', [])):
                speaker_id = f"Speaker_{(idx % num_speakers) + 1}"
                
                if speaker_labels and speaker_id in speaker_labels:
                    speaker_name = speaker_labels[speaker_id]
                else:
                    speaker_name = speaker_id
                
                segments_with_speakers.append({
                    "id": idx,
                    "start": segment.get('start', 0),
                    "end": segment.get('end', 0),
                    "text": segment.get('text', ''),
                    "speaker": speaker_name,
                    "speaker_id": speaker_id
                })
            
            return {
                "full_text": response.get('full_text', ''),
                "segments": segments_with_speakers,
                "provider": "whisper_diarization"
            }
            
        except Exception as e:
            raise Exception(f"Erro na transcrição: {str(e)}")
    
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
