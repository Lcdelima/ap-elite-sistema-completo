"""Disk Images Reader (E01, RAW) - Elite Athena"""
import os
import subprocess
from typing import Dict, Any


def get_ewf_info(e01_path: str) -> Dict[str, Any]:
    """Obtém informações de imagem E01"""
    
    try:
        # Usar ewfinfo (libewf-tools)
        output = subprocess.check_output(
            ['ewfinfo', e01_path],
            stderr=subprocess.DEVNULL,
            text=True
        )
        
        info = {}
        for line in output.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                info[key.strip()] = value.strip()
        
        return {
            'format': 'E01',
            'info': info,
            'size': os.path.getsize(e01_path)
        }
        
    except FileNotFoundError:
        return {
            'error': 'ewfinfo não instalado',
            'install': 'sudo apt-get install libewf-tools'
        }
    except Exception as e:
        return {
            'error': str(e)
        }


def mount_e01_readonly(e01_path: str, mount_point: str) -> Dict[str, Any]:
    """Monta imagem E01 como read-only"""
    
    try:
        # Criar mount point
        os.makedirs(mount_point, exist_ok=True)
        
        # Montar com ewfmount
        subprocess.check_call([
            'ewfmount', e01_path, mount_point
        ])
        
        return {
            'mounted': True,
            'mount_point': mount_point,
            'message': 'Imagem montada como read-only'
        }
        
    except Exception as e:
        return {
            'mounted': False,
            'error': str(e)
        }


def unmount_e01(mount_point: str):
    """Desmonta imagem E01"""
    
    try:
        subprocess.check_call(['fusermount', '-u', mount_point])
        return {'unmounted': True}
    except Exception as e:
        return {'error': str(e)}
