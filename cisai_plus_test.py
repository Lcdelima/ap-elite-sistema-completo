#!/usr/bin/env python3
"""
CISAI+ Backend Module Testing
Testa todos os endpoints do módulo CISAI+ conforme especificação
"""

import requests
import json
from datetime import datetime, timezone
import sys

# Backend URL from environment
BACKEND_URL = "https://elite-detective-1.preview.emergentagent.com"

def test_health_check():
    """Testa o endpoint de health check"""
    print("🔍 Testing CISAI+ Health Check...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/cisai/health", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health Check Response:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Validar estrutura esperada
            required_fields = ["status", "module", "version", "features", "integrations"]
            for field in required_fields:
                if field not in data:
                    print(f"❌ Missing required field: {field}")
                    return False
            
            if data["status"] == "operational" and data["module"] == "CISAI+":
                print("✅ Health check passed - CISAI+ module operational")
                return True
            else:
                print(f"❌ Health check failed - Status: {data.get('status')}, Module: {data.get('module')}")
                return False
        else:
            print(f"❌ Health check failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False

def test_geo_resolve():
    """Testa o endpoint de resolução de localização"""
    print("\n🌍 Testing GeoIntel - Resolver Localização...")
    
    payload = {
        "gps": {
            "lat": -22.9068,
            "lon": -43.1729,
            "accuracy": 10
        },
        "cell": {
            "mcc": 724,
            "mnc": 5,
            "lac": 12345,
            "cid": 67890,
            "ta": 3
        }
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/cisai/geo/resolve",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ GeoIntel Response:")
            print(json.dumps(data, indent=2, ensure_ascii=False, default=str))
            
            # Validar estrutura esperada
            required_fields = ["location", "sources", "timestamp", "custody_chain"]
            for field in required_fields:
                if field not in data:
                    print(f"❌ Missing required field: {field}")
                    return False
            
            # Validar localização
            location = data.get("location", {})
            if "lat" not in location or "lon" not in location or "accuracy_m" not in location:
                print("❌ Invalid location structure")
                return False
            
            # Validar cadeia de custódia
            custody = data.get("custody_chain", {})
            if "id" not in custody or "hash" not in custody:
                print("❌ Invalid custody chain structure")
                return False
            
            print("✅ GeoIntel test passed - Location resolved with custody chain")
            return True
        else:
            print(f"❌ GeoIntel failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ GeoIntel error: {str(e)}")
        return False

def test_ip_intelligence():
    """Testa o endpoint de IP Intelligence"""
    print("\n🌐 Testing IP Intelligence...")
    
    payload = {
        "ip": "8.8.8.8"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/cisai/net/ip/intel",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ IP Intelligence Response:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Validar estrutura esperada
            required_fields = ["ip", "version"]
            for field in required_fields:
                if field not in data:
                    print(f"❌ Missing required field: {field}")
                    return False
            
            # Validar se tem dados de geolocalização para IP público
            if not data.get("is_private", True):  # Se não for privado
                if "geolocation" not in data:
                    print("⚠️ Warning: No geolocation data for public IP")
                else:
                    geo = data["geolocation"]
                    if "country" in geo and "lat" in geo and "lon" in geo:
                        print("✅ Geolocation data present")
            
            # Validar security flags
            if "security" in data:
                security = data["security"]
                if "risk_score" in security:
                    print(f"✅ Risk score calculated: {security['risk_score']}")
            
            print("✅ IP Intelligence test passed")
            return True
        else:
            print(f"❌ IP Intelligence failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ IP Intelligence error: {str(e)}")
        return False

def test_gps_spoofing_detection():
    """Testa o endpoint de detecção de GPS spoofing"""
    print("\n🛡️ Testing GPS Spoofing Detection...")
    
    # Criar payload com 2+ pontos GPS com velocidades impossíveis
    now = datetime.now(timezone.utc)
    
    payload = {
        "fixes": [
            {
                "lat": -22.9068,
                "lon": -43.1729,
                "accuracy": 10,
                "timestamp": now.isoformat()
            },
            {
                "lat": -23.5505,  # São Paulo (distante ~400km)
                "lon": -46.6333,
                "accuracy": 15,
                "timestamp": (now.replace(minute=now.minute + 5)).isoformat()  # 5 minutos depois
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/cisai/anti/spoof/gps",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ GPS Spoofing Detection Response:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Validar estrutura esperada
            required_fields = ["score", "flags", "explain"]
            for field in required_fields:
                if field not in data:
                    print(f"❌ Missing required field: {field}")
                    return False
            
            # Validar se detectou velocidade impossível
            flags = data.get("flags", [])
            impossible_speed_detected = any(
                flag.get("type") == "impossible_speed" for flag in flags
            )
            
            if impossible_speed_detected:
                print("✅ Impossible speed correctly detected")
            else:
                print("⚠️ Warning: Expected impossible speed detection")
            
            # Validar score
            score = data.get("score", 0)
            if isinstance(score, (int, float)) and 0 <= score <= 1:
                print(f"✅ Valid spoofing score: {score}")
            else:
                print(f"❌ Invalid spoofing score: {score}")
                return False
            
            print("✅ GPS Spoofing Detection test passed")
            return True
        else:
            print(f"❌ GPS Spoofing Detection failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ GPS Spoofing Detection error: {str(e)}")
        return False

def test_osint_sources():
    """Testa o endpoint de fontes OSINT"""
    print("\n🔍 Testing OSINT Sources...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/cisai/osint/sources", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ OSINT Sources Response:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Validar estrutura esperada
            required_fields = ["categories"]
            for field in required_fields:
                if field not in data:
                    print(f"❌ Missing required field: {field}")
                    return False
            
            # Validar categorias
            categories = data.get("categories", [])
            if not isinstance(categories, list) or len(categories) == 0:
                print("❌ No OSINT categories found")
                return False
            
            # Validar estrutura das categorias
            for category in categories:
                if "name" not in category or "sources" not in category:
                    print(f"❌ Invalid category structure: {category}")
                    return False
                
                sources = category.get("sources", [])
                if not isinstance(sources, list):
                    print(f"❌ Invalid sources structure in category: {category['name']}")
                    return False
            
            print(f"✅ Found {len(categories)} OSINT categories")
            print("✅ OSINT Sources test passed")
            return True
        else:
            print(f"❌ OSINT Sources failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ OSINT Sources error: {str(e)}")
        return False

def main():
    """Executa todos os testes do módulo CISAI+"""
    print("🦅 ATHENA CISAI+ MODULE TESTING")
    print("=" * 50)
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("GeoIntel - Resolver Localização", test_geo_resolve),
        ("IP Intelligence", test_ip_intelligence),
        ("GPS Spoofing Detection", test_gps_spoofing_detection),
        ("OSINT Sources", test_osint_sources)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test {test_name} crashed: {str(e)}")
            results.append((test_name, False))
    
    # Resumo dos resultados
    print("\n" + "="*60)
    print("📊 CISAI+ MODULE TEST RESULTS")
    print("="*60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nSUMMARY: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 ALL CISAI+ TESTS PASSED!")
        return True
    else:
        print("⚠️ SOME TESTS FAILED - Check logs above")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)