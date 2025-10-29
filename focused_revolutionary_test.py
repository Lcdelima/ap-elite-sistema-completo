#!/usr/bin/env python3
"""
FOCUSED REVOLUTIONARY FORENSICS VALIDATION
Validates specific requirements from the review request
"""

import requests
import json
import os

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://seguir-em-frente.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

def authenticate():
    """Authenticate with laura@apelite.com / laura2024"""
    auth_data = {
        "email": "laura@apelite.com",
        "password": "laura2024",
        "role": "administrator"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=auth_data)
    if response.status_code == 200:
        data = response.json()
        return data.get("token")
    return None

def validate_password_recovery_elite():
    """Validate PASSWORD RECOVERY ELITE specific requirements"""
    print("🔓 VALIDATING PASSWORD RECOVERY ELITE REQUIREMENTS")
    
    token = authenticate()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    results = []
    
    # 1. GET /stats - Verify specific fields
    response = requests.get(f"{BASE_URL}/password-recovery-elite/stats", headers=headers)
    if response.status_code == 200:
        data = response.json()
        required_fields = ["total_attempts", "em_andamento", "recuperadas", "falhas", "success_rate", "by_type", "by_method", "gpu_enabled", "ai_optimization"]
        missing = [f for f in required_fields if f not in data]
        if not missing:
            results.append("✅ Stats API: All required fields present")
        else:
            results.append(f"❌ Stats API: Missing fields {missing}")
    
    # 2. GET /attack-methods - Verify 6 methods
    response = requests.get(f"{BASE_URL}/password-recovery-elite/attack-methods", headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data.get("total") == 6:
            results.append("✅ Attack Methods: 6 methods available")
        else:
            results.append(f"❌ Attack Methods: Expected 6, got {data.get('total')}")
    
    # 3. GET /supported-file-types - Verify categories
    response = requests.get(f"{BASE_URL}/password-recovery-elite/supported-file-types", headers=headers)
    if response.status_code == 200:
        data = response.json()
        file_types = data.get("file_types", {})
        expected_categories = ["operating_systems", "documents", "archives", "email", "databases"]
        missing_cats = [cat for cat in expected_categories if cat not in file_types]
        if not missing_cats:
            results.append("✅ File Types: All categories present (OS, documents, archives, email, databases)")
        else:
            results.append(f"❌ File Types: Missing categories {missing_cats}")
    
    return results

def validate_data_recovery_ultimate():
    """Validate DATA RECOVERY ULTIMATE specific requirements"""
    print("💾 VALIDATING DATA RECOVERY ULTIMATE REQUIREMENTS")
    
    token = authenticate()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    results = []
    
    # 1. GET /stats - Verify specific fields
    response = requests.get(f"{BASE_URL}/data-recovery-ultimate/stats", headers=headers)
    if response.status_code == 200:
        data = response.json()
        required_fields = ["total_recoveries", "em_andamento", "concluidas", "recuperadas", "total_data_recovered_gb", "total_files_recovered"]
        missing = [f for f in required_fields if f not in data]
        if not missing:
            results.append("✅ Stats API: All required fields present")
        else:
            results.append(f"❌ Stats API: Missing fields {missing}")
    
    # 2. GET /supported-systems - Verify 5 systems
    response = requests.get(f"{BASE_URL}/data-recovery-ultimate/supported-systems", headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data.get("total") == 5:
            systems = [s["os"] for s in data.get("systems", [])]
            expected = ["windows", "linux", "macos", "android", "ios"]
            if all(sys in systems for sys in expected):
                results.append("✅ Supported Systems: 5 systems (Windows, Linux, macOS, Android, iOS)")
            else:
                results.append(f"❌ Supported Systems: Missing systems {set(expected) - set(systems)}")
        else:
            results.append(f"❌ Supported Systems: Expected 5, got {data.get('total')}")
    
    # 3. GET /supported-media-types - Verify 6 media types
    response = requests.get(f"{BASE_URL}/data-recovery-ultimate/supported-media-types", headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data.get("total") == 6:
            results.append("✅ Media Types: 6 media types available")
        else:
            results.append(f"❌ Media Types: Expected 6, got {data.get('total')}")
    
    return results

def validate_usb_forensics_pro():
    """Validate USB FORENSICS PRO specific requirements"""
    print("🔌 VALIDATING USB FORENSICS PRO REQUIREMENTS")
    
    token = authenticate()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    results = []
    
    # 1. GET /stats - Verify specific fields
    response = requests.get(f"{BASE_URL}/usb-forensics-pro/stats", headers=headers)
    if response.status_code == 200:
        data = response.json()
        required_fields = ["total_analyses", "dispositivos_detectados", "dispositivos_suspeitos", "malware_detected"]
        missing = [f for f in required_fields if f not in data]
        if not missing:
            results.append("✅ Stats API: All required fields present")
        else:
            results.append(f"❌ Stats API: Missing fields {missing}")
    
    # 2. GET /device-types - Verify 11 device types
    response = requests.get(f"{BASE_URL}/usb-forensics-pro/device-types", headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data.get("total") == 11:
            results.append("✅ Device Types: 11 device types available")
        else:
            results.append(f"❌ Device Types: Expected 11, got {data.get('total')}")
    
    # 3. GET /analysis-types - Verify 4 analysis types
    response = requests.get(f"{BASE_URL}/usb-forensics-pro/analysis-types", headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data.get("total") == 4:
            types = [t["type"] for t in data.get("analysis_types", [])]
            expected = ["history", "live_detection", "malware_scan", "data_extraction"]
            if all(t in types for t in expected):
                results.append("✅ Analysis Types: 4 analysis types (history, live_detection, malware_scan, data_extraction)")
            else:
                results.append(f"❌ Analysis Types: Missing types {set(expected) - set(types)}")
        else:
            results.append(f"❌ Analysis Types: Expected 4, got {data.get('total')}")
    
    return results

def main():
    print("🎯 REVOLUTIONARY FORENSICS MODULES - FOCUSED VALIDATION")
    print("=" * 70)
    
    # Test authentication first
    token = authenticate()
    if not token:
        print("❌ Authentication failed!")
        return
    
    print("✅ Authentication successful!")
    print()
    
    # Validate each module
    pwd_results = validate_password_recovery_elite()
    data_results = validate_data_recovery_ultimate()
    usb_results = validate_usb_forensics_pro()
    
    # Summary
    print("\n" + "=" * 70)
    print("📋 VALIDATION SUMMARY")
    print("=" * 70)
    
    all_results = pwd_results + data_results + usb_results
    passed = len([r for r in all_results if r.startswith("✅")])
    total = len(all_results)
    
    print(f"Total Validations: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {passed/total*100:.1f}%")
    
    print("\nDETAILED RESULTS:")
    for result in all_results:
        print(f"  {result}")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)