#!/usr/bin/env python3
"""
CISAI+ v1.1.0 Integration Testing
Testing new integrations: AbuseIPDB, Wigle, and enhanced IP Intelligence
"""

import requests
import json
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://forensic-hub-5.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

def test_cisai_health_check():
    """Test 1: Health Check Updated - should show Wigle and AbuseIPDB as 'active'"""
    print("\n🔍 TEST 1: CISAI+ Health Check")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/cisai/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response received successfully")
            print(f"Module: {data.get('module')}")
            print(f"Version: {data.get('version')}")
            print(f"Status: {data.get('status')}")
            
            # Check integrations
            integrations = data.get('integrations', {})
            print(f"\nIntegrations:")
            for service, status in integrations.items():
                print(f"  - {service}: {status}")
            
            # Verify Wigle and AbuseIPDB are active
            wigle_status = integrations.get('wigle')
            abuseipdb_status = integrations.get('abuseipdb')
            
            if wigle_status == 'active' and abuseipdb_status == 'active':
                print(f"✅ PASS: Wigle ({wigle_status}) and AbuseIPDB ({abuseipdb_status}) are active")
                return True
            else:
                print(f"❌ FAIL: Expected Wigle and AbuseIPDB to be 'active', got Wigle: {wigle_status}, AbuseIPDB: {abuseipdb_status}")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_ip_intelligence_abuseipdb():
    """Test 2: IP Intelligence with AbuseIPDB - test with 1.1.1.1"""
    print("\n🔍 TEST 2: IP Intelligence with AbuseIPDB (1.1.1.1)")
    print("=" * 50)
    
    try:
        payload = {"ip": "1.1.1.1"}
        response = requests.post(f"{BASE_URL}/cisai/net/ip/intel", 
                               json=payload, 
                               headers={'Content-Type': 'application/json'},
                               timeout=15)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response received successfully")
            
            # Check AbuseIPDB fields
            abuseipdb_data = data.get('abuseipdb', {})
            if abuseipdb_data and 'error' not in abuseipdb_data:
                print(f"\n📊 AbuseIPDB Data:")
                print(f"  - Abuse Confidence Score: {abuseipdb_data.get('abuse_confidence_score')}")
                print(f"  - Total Reports: {abuseipdb_data.get('total_reports')}")
                print(f"  - Usage Type: {abuseipdb_data.get('usage_type')}")
                print(f"  - Is Whitelisted: {abuseipdb_data.get('is_whitelisted')}")
                print(f"  - ISP: {abuseipdb_data.get('isp')}")
                print(f"  - Country Code: {abuseipdb_data.get('country_code')}")
                
                # Check risk score calculation
                risk_score = data.get('security', {}).get('risk_score')
                print(f"\n🎯 Risk Score: {risk_score}")
                
                # Verify required fields are present
                required_fields = ['abuse_confidence_score', 'total_reports', 'usage_type', 'is_whitelisted']
                missing_fields = [field for field in required_fields if field not in abuseipdb_data]
                
                if not missing_fields:
                    print(f"✅ PASS: All required AbuseIPDB fields present")
                    print(f"✅ PASS: Risk score calculated: {risk_score}")
                    return True
                else:
                    print(f"❌ FAIL: Missing AbuseIPDB fields: {missing_fields}")
                    return False
            else:
                print(f"❌ FAIL: AbuseIPDB data not found or has error: {abuseipdb_data}")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_wifi_lookup_wigle():
    """Test 3: Wi-Fi Lookup with Wigle - test error 412 handling"""
    print("\n🔍 TEST 3: Wi-Fi Lookup with Wigle (Error 412 handling)")
    print("=" * 50)
    
    try:
        payload = {"bssid": "00:11:22:33:44:55"}
        response = requests.post(f"{BASE_URL}/cisai/wifi/lookup", 
                               json=payload, 
                               headers={'Content-Type': 'application/json'},
                               timeout=15)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response received successfully")
            
            # Check status field
            status = data.get('status')
            print(f"Status: {status}")
            
            if status == 'rate_limit':
                print(f"✅ PASS: Properly handled 412 rate limit error")
                print(f"Error message: {data.get('error')}")
                print(f"Note: {data.get('note')}")
                return True
            elif status == 'success':
                print(f"✅ PASS: Successfully found BSSID data")
                print(f"SSID: {data.get('ssid')}")
                print(f"Location: {data.get('lat')}, {data.get('lon')}")
                return True
            elif status == 'not_found':
                print(f"✅ PASS: BSSID not found (expected for test BSSID)")
                print(f"Note: {data.get('note')}")
                return True
            else:
                print(f"❌ FAIL: Unexpected status: {status}")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_ip_multiple_sources():
    """Test 4: Test IP with multiple sources - 8.8.8.8 (Google DNS)"""
    print("\n🔍 TEST 4: IP Intelligence Multiple Sources (8.8.8.8)")
    print("=" * 50)
    
    try:
        payload = {"ip": "8.8.8.8"}
        response = requests.post(f"{BASE_URL}/cisai/net/ip/intel", 
                               json=payload, 
                               headers={'Content-Type': 'application/json'},
                               timeout=15)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response received successfully")
            
            # Check data integration from multiple sources
            sources_found = []
            
            # Check ip-api.com data
            if 'geolocation' in data:
                sources_found.append('ip-api.com')
                geo = data['geolocation']
                print(f"\n🌍 Geolocation (ip-api.com):")
                print(f"  - Country: {geo.get('country')}")
                print(f"  - City: {geo.get('city')}")
                print(f"  - ISP: {data.get('network', {}).get('isp')}")
            
            # Check AbuseIPDB data
            if 'abuseipdb' in data and 'error' not in data['abuseipdb']:
                sources_found.append('AbuseIPDB')
                abuse = data['abuseipdb']
                print(f"\n🛡️ AbuseIPDB:")
                print(f"  - Abuse Score: {abuse.get('abuse_confidence_score')}")
                print(f"  - Reports: {abuse.get('total_reports')}")
                print(f"  - Whitelisted: {abuse.get('is_whitelisted')}")
            
            # Check WHOIS data
            if 'whois' in data:
                sources_found.append('WHOIS')
                whois = data['whois']
                print(f"\n📋 WHOIS:")
                print(f"  - ASN: {whois.get('asn')}")
                print(f"  - ASN Description: {whois.get('asn_description')}")
            
            # Check PTR record
            if 'ptr' in data and data['ptr']:
                sources_found.append('PTR')
                print(f"\n🔗 PTR Record: {data['ptr']}")
            
            # Check risk score
            risk_score = data.get('security', {}).get('risk_score')
            print(f"\n🎯 Final Risk Score: {risk_score}")
            
            print(f"\n📊 Data Sources Found: {', '.join(sources_found)}")
            
            if len(sources_found) >= 2:
                print(f"✅ PASS: Multiple data sources integrated successfully")
                return True
            else:
                print(f"❌ FAIL: Expected multiple sources, found only: {sources_found}")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def run_all_tests():
    """Run all CISAI+ v1.1.0 integration tests"""
    print("🦅 CISAI+ v1.1.0 Integration Testing")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = [
        ("Health Check Updated", test_cisai_health_check),
        ("IP Intelligence with AbuseIPDB", test_ip_intelligence_abuseipdb),
        ("Wi-Fi Lookup with Wigle", test_wifi_lookup_wigle),
        ("IP Multiple Sources Integration", test_ip_multiple_sources)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ CRITICAL ERROR in {test_name}: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Results: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED - CISAI+ v1.1.0 integrations working correctly!")
    else:
        print("⚠️  Some tests failed - review the issues above")
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)