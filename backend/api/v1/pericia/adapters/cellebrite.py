"""Adaptador Cellebrite UFDR - Elite Athena"""
import zipfile
import json
import csv
import io
from typing import Dict, Any, List


def parse_ufdr(file_path: str) -> Dict[str, Any]:
    """Parse de arquivo UFDR do Cellebrite"""
    
    result = {
        'device_info': {},
        'artifacts': [],
        'contacts': [],
        'messages': [],
        'calls': [],
        'locations': [],
        'files': [],
        'apps': []
    }
    
    try:
        with zipfile.ZipFile(file_path, 'r') as z:
            file_list = z.namelist()
            
            # Parse report.json (metadados do dispositivo)
            for name in file_list:
                if name.endswith('report.json') or 'device' in name.lower():
                    try:
                        with z.open(name) as f:
                            data = json.load(f)
                            result['device_info'] = {
                                'manufacturer': data.get('manufacturer', 'Unknown'),
                                'model': data.get('model', 'Unknown'),
                                'os': data.get('os', 'Unknown'),
                                'imei': data.get('imei', 'N/A'),
                                'serial': data.get('serial', 'N/A')
                            }
                    except:
                        pass
                
                # Parse CSVs de artefatos
                if name.endswith('.csv'):
                    try:
                        with z.open(name) as f:
                            content = f.read().decode('utf-8', errors='ignore')
                            reader = csv.DictReader(io.StringIO(content))
                            
                            artifact_type = 'unknown'
                            if 'contact' in name.lower():
                                artifact_type = 'contacts'
                            elif 'message' in name.lower() or 'chat' in name.lower():
                                artifact_type = 'messages'
                            elif 'call' in name.lower():
                                artifact_type = 'calls'
                            elif 'location' in name.lower() or 'gps' in name.lower():
                                artifact_type = 'locations'
                            
                            for row in reader:
                                result[artifact_type].append(dict(row))
                    except:
                        pass
            
            result['artifacts'] = file_list
            result['total_artifacts'] = len(file_list)
        
        return result
        
    except Exception as e:
        return {
            'error': str(e),
            'status': 'parse_failed'
        }
