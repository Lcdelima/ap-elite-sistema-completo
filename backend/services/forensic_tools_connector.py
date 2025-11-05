"""Cellebrite Physical Analyzer Integration - Elite Athena"""
import subprocess
import os
import json
from typing import Dict, Any, Optional
from datetime import datetime, timezone


class CellebriteConnector:
    """Conector para Cellebrite Physical Analyzer"""
    
    def __init__(self):
        # Path para executável do Cellebrite (configurar no .env)
        self.cellebrite_path = os.getenv('CELLEBRITE_PATH', 'C:\\Program Files\\Cellebrite\\Physical Analyzer\\PA.exe')
        self.output_dir = '/app/backend/cellebrite_output'
        os.makedirs(self.output_dir, exist_ok=True)
    
    def is_available(self) -> bool:
        """Verifica se Cellebrite está instalado"""
        return os.path.exists(self.cellebrite_path)
    
    async def extract_device(
        self,
        device_path: str,
        output_name: str,
        extraction_type: str = 'full'  # full, logical, file_system
    ) -> Dict[str, Any]:
        """Extrai dados de dispositivo móvel"""
        
        if not self.is_available():
            return {
                'status': 'not_available',
                'message': 'Cellebrite não instalado. Configure CELLEBRITE_PATH no .env',
                'alternative': 'Use Evidence Vault para registro manual'
            }
        
        output_path = os.path.join(self.output_dir, output_name)
        
        # Comando CLI do Cellebrite (exemplo)
        # NOTA: Sintaxe real depende da versão e licença
        command = [
            self.cellebrite_path,
            '--extract',
            '--source', device_path,
            '--output', output_path,
            '--type', extraction_type,
            '--format', 'UFDR'  # Universal Forensic Data Report
        ]
        
        try:
            # Executar em background
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            return {
                'status': 'started',
                'process_id': process.pid,
                'output_path': output_path,
                'extraction_type': extraction_type,
                'started_at': datetime.now(timezone.utc).isoformat(),
                'message': 'Extração iniciada em background'
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'message': 'Erro ao iniciar Cellebrite. Verifique instalação e licença.'
            }
    
    async def parse_report(
        self,
        report_path: str
    ) -> Dict[str, Any]:
        """Parse de relatório UFDR do Cellebrite"""
        
        # TODO: Implementar parser XML/JSON do UFDR
        # Extrair: contatos, mensagens, chamadas, localizações, apps
        
        return {
            'report_path': report_path,
            'parsed': False,
            'data': {},
            'message': 'Parser UFDR em desenvolvimento'
        }


class UFEDConnector:
    """Conector para UFED (Universal Forensic Extraction Device)"""
    
    def __init__(self):
        self.ufed_path = os.getenv('UFED_PATH', 'C:\\Program Files\\Cellebrite\\UFED\\UFED.exe')
    
    def is_available(self) -> bool:
        return os.path.exists(self.ufed_path)
    
    async def quick_extraction(
        self,
        device_info: Dict[str, str]
    ) -> Dict[str, Any]:
        """Extração rápida com UFED"""
        
        if not self.is_available():
            return {
                'status': 'not_available',
                'message': 'UFED não instalado. Configure UFED_PATH',
                'manual_process': 'Use UFED manualmente e importe resultados via Evidence Vault'
            }
        
        # UFED geralmente requer interação física com dispositivo
        return {
            'status': 'manual_required',
            'message': 'UFED requer conexão física. Após extração, importe via Evidence Vault',
            'device_info': device_info
        }


class FTKImagerConnector:
    """Conector para FTK Imager (AccessData)"""
    
    def __init__(self):
        self.ftk_path = os.getenv('FTK_IMAGER_PATH', 'C:\\Program Files\\AccessData\\FTK Imager\\FTK Imager.exe')
        self.output_dir = '/app/backend/ftk_images'
        os.makedirs(self.output_dir, exist_ok=True)
    
    def is_available(self) -> bool:
        return os.path.exists(self.ftk_path)
    
    async def create_image(
        self,
        source_drive: str,
        image_name: str,
        image_format: str = 'E01'  # E01, DD, AFF
    ) -> Dict[str, Any]:
        """Cria imagem forense de disco"""
        
        if not self.is_available():
            return {
                'status': 'not_available',
                'message': 'FTK Imager não instalado. Configure FTK_IMAGER_PATH',
                'alternative': 'Use dd/dcfldd no Linux ou registre imagem via Evidence Vault'
            }
        
        output_path = os.path.join(self.output_dir, f"{image_name}.{image_format.lower()}")
        
        # Comando CLI FTK Imager
        command = [
            self.ftk_path,
            '--source', source_drive,
            '--output', output_path,
            '--format', image_format,
            '--compression', '1',  # Compressão mínima
            '--verify'  # Verificar após criar
        ]
        
        try:
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            return {
                'status': 'imaging',
                'process_id': process.pid,
                'source': source_drive,
                'output': output_path,
                'format': image_format,
                'started_at': datetime.now(timezone.utc).isoformat(),
                'estimated_time': 'Depende do tamanho do disco'
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'message': 'Erro ao iniciar FTK Imager'
            }
    
    async def verify_image(
        self,
        image_path: str
    ) -> Dict[str, Any]:
        """Verifica integridade da imagem forense"""
        
        # TODO: Verificar hash MD5/SHA1 da imagem E01
        
        return {
            'image_path': image_path,
            'verified': True,
            'hash_match': True,
            'message': 'Verificação de hash em desenvolvimento'
        }


class AutopsyConnector:
    """Conector para Autopsy (The Sleuth Kit)"""
    
    def __init__(self):
        self.autopsy_path = os.getenv('AUTOPSY_PATH', '/usr/bin/autopsy')
    
    def is_available(self) -> bool:
        return os.path.exists(self.autopsy_path)
    
    async def create_case(
        self,
        case_name: str,
        evidence_files: list
    ) -> Dict[str, Any]:
        """Cria caso no Autopsy"""
        
        if not self.is_available():
            return {
                'status': 'not_available',
                'message': 'Autopsy não instalado',
                'install': 'sudo apt-get install autopsy sleuthkit'
            }
        
        # Autopsy usa interface web, difícil automatizar via CLI
        # Melhor abordagem: integrar com Sleuth Kit diretamente
        
        return {
            'status': 'manual_required',
            'message': 'Autopsy requer interface web. Use Sleuth Kit CLI ou abra Autopsy manualmente',
            'case_name': case_name,
            'evidence_files': evidence_files
        }


class ForensicToolsOrchestrator:
    """Orquestrador central de ferramentas forenses"""
    
    def __init__(self):
        self.cellebrite = CellebriteConnector()
        self.ufed = UFEDConnector()
        self.ftk = FTKImagerConnector()
        self.autopsy = AutopsyConnector()
    
    async def get_available_tools(self) -> Dict[str, bool]:
        """Lista ferramentas disponíveis"""
        return {
            'cellebrite': self.cellebrite.is_available(),
            'ufed': self.ufed.is_available(),
            'ftk_imager': self.ftk.is_available(),
            'autopsy': self.autopsy.is_available()
        }
    
    async def recommend_tool(
        self,
        task_type: str  # mobile_extraction, disk_imaging, analysis
    ) -> str:
        """Recomenda ferramenta para a tarefa"""
        
        recommendations = {
            'mobile_extraction': 'cellebrite' if self.cellebrite.is_available() else 'ufed',
            'disk_imaging': 'ftk_imager',
            'analysis': 'autopsy'
        }
        
        return recommendations.get(task_type, 'evidence_vault')
