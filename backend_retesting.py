#!/usr/bin/env python3
"""
Backend Retesting for tasks marked as needs_retesting: true
"""

import requests
import json

# Backend URL from environment
BACKEND_URL = "https://elite-detective-1.preview.emergentagent.com"

def test_workflow_automation():
    """Test Workflow Automation System endpoint"""
    print("🔄 Testing Workflow Automation System...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/workflow/templates", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Workflow Templates Response:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return True
        else:
            print(f"❌ Workflow Templates failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Workflow Templates error: {str(e)}")
        return False

def test_social_listening():
    """Test Social Listening System endpoint"""
    print("\n📱 Testing Social Listening System...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/social/statistics", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Social Listening Statistics Response:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return True
        else:
            print(f"❌ Social Listening Statistics failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Social Listening Statistics error: {str(e)}")
        return False

def main():
    """Run retesting for backend tasks"""
    print("🔄 BACKEND RETESTING - Tasks marked as needs_retesting: true")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    tests = [
        ("Workflow Automation System", test_workflow_automation),
        ("Social Listening System", test_social_listening)
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
    
    # Summary
    print("\n" + "="*60)
    print("📊 RETESTING RESULTS")
    print("="*60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nSUMMARY: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    return results

if __name__ == "__main__":
    main()