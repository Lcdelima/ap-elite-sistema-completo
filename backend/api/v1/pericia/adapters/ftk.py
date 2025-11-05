"""Adaptador FTK Imager - Elite Athena"""
import csv
import io
from typing import Dict, Any, List


def parse_ftk_export(file_path: str) -> Dict[str, Any]:
    """Parse de exportação FTK (CSV/TSV)"""
    
    result = {
        'rows': [],
        'total_files': 0,
        'total_size': 0
    }
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            # Tentar detectar delimitador
            sample = f.read(1024)
            f.seek(0)
            
            delimiter = '\t' if '\t' in sample else ','
            
            reader = csv.DictReader(f, delimiter=delimiter)
            
            for row in reader:
                # Normalizar cabeçalhos
                normalized = {
                    k.strip().lower().replace(' ', '_'): v 
                    for k, v in row.items()
                }
                
                result['rows'].append(normalized)
                
                # Acumular estatísticas
                if 'size' in normalized:
                    try:
                        result['total_size'] += int(normalized['size'])
                    except:
                        pass
            
            result['total_files'] = len(result['rows'])
        
        return result
        
    except Exception as e:
        return {
            'error': str(e),
            'status': 'parse_failed'
        }


def verify_ftk_hash(file_path: str, expected_hash: str, algorithm: str = 'md5') -> bool:
    """Verifica hash de arquivo contra valor esperado do FTK"""
    
    import hashlib
    
    hash_funcs = {
        'md5': hashlib.md5,
        'sha1': hashlib.sha1,
        'sha256': hashlib.sha256
    }
    
    hash_func = hash_funcs.get(algorithm.lower(), hashlib.md5)()
    
    with open(file_path, 'rb') as f:
        while True:
            data = f.read(1024 * 1024)
            if not data:
                break
            hash_func.update(data)
    
    computed = hash_func.hexdigest()
    return computed.lower() == expected_hash.lower()
