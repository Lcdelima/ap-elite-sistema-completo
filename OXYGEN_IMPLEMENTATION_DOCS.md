# 🚀 OXYGEN-STYLE ADVANCED FEATURES - DOCUMENTAÇÃO COMPLETA

## Implementações Baseadas no Oxygen Forensic Detective

---

## 📋 **ÍNDICE**

1. [Sistema de Configuração Avançada](#1-sistema-de-configuração-avançada)
2. [Gerenciamento de GPU](#2-gerenciamento-de-gpu)
3. [Sistema de Gerenciamento de Senhas](#3-sistema-de-gerenciamento-de-senhas)
4. [Licenças e Instalação](#4-licenças-e-instalação)
5. [Preferências por Usuário](#5-preferências-por-usuário)
6. [APIs Disponíveis](#6-apis-disponíveis)

---

## 1. SISTEMA DE CONFIGURAÇÃO AVANÇADA

### **Baseado em: Oxygen Forensic Detective Config System**

#### **Endpoints:**

### `GET /api/oxygen-config/system-config`
Obter configuração completa do sistema

**Response:**
```json
{
  "config_type": "main",
  "config_id": "uuid",
  "ceip": {
    "telemetry_enabled": true,
    "telemetry_session_number": 0,
    "telemetry_global_number": 0
  },
  "settings": {
    "gpu_enabled": true,
    "use_gpu_on_user_activity": true,
    "disable_gpu_on_overheat": true,
    "temperature_overheat_threshold": 85,
    "gpu_load_limit": 90,
    "dsa_server_enabled": false,
    "calculate_file_md5": true,
    "calculate_file_sha256": true,
    "enable_ai_analysis": true,
    "enable_malware_scan": true
  }
}
```

### `PUT /api/oxygen-config/system-config`
Atualizar configuração do sistema

**Body:**
```json
{
  "settings.gpu_enabled": true,
  "settings.temperature_overheat_threshold": 80
}
```

---

## 2. GERENCIAMENTO DE GPU

### **Baseado em: Oxygen GPU Calibration System**

#### **Endpoints:**

### `GET /api/oxygen-config/gpu-devices`
Listar dispositivos GPU detectados

**Response:**
```json
{
  "gpu_devices": [
    {
      "device_id": "GPU_658f4277",
      "device_name": "NVIDIA GeForce RTX 4090",
      "driver_version": "537.34",
      "memory_size_mb": 24576,
      "cores": 16384,
      "calibration_status": "Not Calibrated"
    }
  ],
  "count": 1,
  "has_calibrated_gpus": false
}
```

### `POST /api/oxygen-config/gpu-devices/detect`
Detectar dispositivos GPU disponíveis

**Response:**
```json
{
  "success": true,
  "message": "2 dispositivos GPU detectados",
  "devices": [...]
}
```

### `POST /api/oxygen-config/gpu-devices/{device_id}/calibrate`
Calibrar dispositivo GPU específico

**Response:**
```json
{
  "success": true,
  "message": "GPU calibrada com sucesso",
  "benchmark_score": 15243,
  "optimization_parameters": {
    "kernel_threads": 256,
    "batch_size": 1024,
    "memory_allocation_mb": 12288,
    "optimal_temperature": 72,
    "power_limit_watts": 380
  }
}
```

### `GET /api/oxygen-config/gpu-devices/{device_id}/temperature`
Obter temperatura e status da GPU

**Response:**
```json
{
  "device_id": "GPU_658f4277",
  "temperature_celsius": 68,
  "fan_speed_percent": 55,
  "power_usage_watts": 325,
  "status": "normal",
  "timestamp": "2025-10-28T14:05:30Z"
}
```

---

## 3. SISTEMA DE GERENCIAMENTO DE SENHAS

### **Baseado em: Oxygen Password Management**

#### **Endpoints:**

### `GET /api/oxygen-passwords/databases`
Listar todos os bancos de senhas

**Response:**
```json
{
  "databases": [
    {
      "database_id": "uuid",
      "database_name": "iPhone 13 Pro - João Silva",
      "source_type": "extraction",
      "caso_id": "caso_123",
      "password_count": 245,
      "compromised_count": 12,
      "created_at": "2025-10-28T10:00:00Z"
    }
  ],
  "total": 1
}
```

### `POST /api/oxygen-passwords/databases`
Criar novo banco de senhas

**Body:**
```json
{
  "database_name": "Samsung Galaxy S23 - Extração",
  "source_type": "extraction",
  "caso_id": "caso_456",
  "extracao_id": "extracao_789",
  "device_info": {
    "marca": "Samsung",
    "modelo": "Galaxy S23",
    "sistema": "Android 14"
  }
}
```

### `POST /api/oxygen-passwords/databases/{database_id}/passwords`
Adicionar senha ao banco

**Body:**
```json
{
  "source": "browser",
  "application_name": "Google Chrome",
  "url": "https://facebook.com",
  "username": "joao@email.com",
  "password": "MySecureP@ss123",
  "category": "social",
  "tags": ["facebook", "social media"]
}
```

**Response:**
```json
{
  "success": true,
  "password_id": "uuid",
  "strength": "strong",
  "compromised": false,
  "password": {
    "password_id": "uuid",
    "database_id": "database_uuid",
    "source": "browser",
    "application_name": "Google Chrome",
    "url": "https://facebook.com",
    "username": "joao@email.com",
    "strength": "strong",
    "compromised": false,
    "category": "social",
    "first_seen": "2025-10-28T14:00:00Z"
  }
}
```

### `GET /api/oxygen-passwords/databases/{database_id}/passwords`
Listar senhas de um banco

**Query Params:**
- `category` (opcional): Filtrar por categoria
- `source` (opcional): Filtrar por fonte
- `compromised_only` (opcional): Apenas senhas comprometidas

**Response:**
```json
{
  "passwords": [
    {
      "password_id": "uuid",
      "source": "browser",
      "username": "joao@email.com",
      "url": "https://facebook.com",
      "password": "***PROTECTED***",
      "strength": "strong",
      "compromised": false
    }
  ],
  "count": 1
}
```

### `GET /api/oxygen-passwords/databases/{database_id}/passwords/{password_id}/decrypt`
⚠️ **DECRIPTAR SENHA (REQUER AUTORIZAÇÃO)**

**Response:**
```json
{
  "password_id": "uuid",
  "username": "joao@email.com",
  "password": "MySecureP@ss123",
  "url": "https://facebook.com",
  "strength": "strong",
  "compromised": false,
  "warning": "Esta senha foi decriptada. Mantenha segura!"
}
```

### `GET /api/oxygen-passwords/databases/{database_id}/stats`
Estatísticas do banco de senhas

**Response:**
```json
{
  "database_id": "uuid",
  "database_name": "iPhone 13 Pro",
  "total_passwords": 245,
  "by_category": {
    "social": 45,
    "banking": 12,
    "email": 25,
    "work": 80
  },
  "by_source": {
    "browser": 150,
    "application": 60,
    "manual": 35
  },
  "by_strength": {
    "weak": 45,
    "medium": 120,
    "strong": 80
  },
  "compromised_count": 12,
  "duplicate_passwords": 8,
  "security_score": 67
}
```

### `GET /api/oxygen-passwords/analysis/weak-passwords`
Analisar senhas fracas

### `GET /api/oxygen-passwords/analysis/compromised`
Analisar senhas comprometidas

### `GET /api/oxygen-passwords/analysis/duplicates`
Analisar senhas duplicadas

### `GET /api/oxygen-passwords/search`
Buscar senhas

**Query Params:**
- `query`: Termo de busca
- `search_in`: all, username, url, application

---

## 4. LICENÇAS E INSTALAÇÃO

### `GET /api/oxygen-config/licenses`
Obter licenças ativas

**Response:**
```json
{
  "licenses": [
    {
      "license_id": "uuid",
      "encrypted_key": "hash",
      "is_main": true,
      "license_type": "professional",
      "expires_at": "2026-12-31",
      "features_enabled": [
        "data_extraction",
        "password_recovery",
        "gpu_acceleration"
      ]
    }
  ],
  "count": 1,
  "main_license": {...}
}
```

### `POST /api/oxygen-config/licenses`
Adicionar nova licença

**Body:**
```json
{
  "key": "XXXX-XXXX-XXXX-XXXX",
  "is_main": true,
  "license_type": "enterprise",
  "expires_at": "2026-12-31",
  "features_enabled": ["all"]
}
```

### `GET /api/oxygen-config/installation-info`
Informações da instalação

**Response:**
```json
{
  "installation_id": "uuid",
  "installation_id_v2": "uuid",
  "installation_id_v3": "uuid",
  "installed_at": "2025-10-28T10:00:00Z",
  "version": "2.0.0",
  "build": "20240128",
  "platform": "Linux",
  "architecture": "x86_64"
}
```

---

## 5. PREFERÊNCIAS POR USUÁRIO

### `GET /api/oxygen-config/user-preferences`
Obter preferências do usuário

**Response:**
```json
{
  "user_id": "uuid",
  "theme": "dark",
  "language": "pt-BR",
  "keyboard_shortcuts_enabled": true,
  "notifications_enabled": true,
  "auto_save": true,
  "custom_paths": {}
}
```

### `PUT /api/oxygen-config/user-preferences`
Atualizar preferências

**Body:**
```json
{
  "theme": "light",
  "language": "en-US",
  "keyboard_shortcuts_enabled": false
}
```

---

## 6. TELEMETRIA

### `GET /api/oxygen-config/telemetry/stats`
Obter estatísticas de telemetria

**Response:**
```json
{
  "telemetry_enabled": true,
  "session_number": 245,
  "global_number": 12453
}
```

### `POST /api/oxygen-config/telemetry/increment`
Incrementar contadores de telemetria

---

## 🔒 **SEGURANÇA**

### **Criptografia de Senhas:**
- Algoritmo: **AES-256** via Fernet
- Key Derivation: **PBKDF2-HMAC-SHA256**
- Iterações: **100,000**
- Salt: Único por instalação
- Senhas nunca são armazenadas em plaintext

### **Cadeia de Custódia:**
- Todos os acessos são registrados
- Log de decriptação de senhas
- Hash SHA-256 para integridade
- Timestamps com UTC

### **Controle de Temperatura GPU:**
- Monitoramento em tempo real
- Desligamento automático em sobreaquecimento
- Threshold configurável (padrão: 85°C)
- Limite de carga configurável (padrão: 90%)

---

## 📊 **FEATURES IMPLEMENTADAS**

✅ Sistema de Configuração Avançada (Oxygen-style)
✅ Detecção e Calibração de GPU
✅ Monitoramento de Temperatura GPU
✅ Gerenciamento de Senhas Criptografadas
✅ Análise de Força de Senhas
✅ Detecção de Senhas Comprometidas
✅ Análise de Senhas Duplicadas
✅ Sistema de Licenças
✅ Preferências por Usuário
✅ Telemetria (CEIP)
✅ IDs de Instalação Múltiplos
✅ Cadeia de Custódia
✅ Logs de Acesso
✅ Busca de Senhas
✅ Categorização Automática
✅ Security Score

---

## 🚀 **PRÓXIMAS IMPLEMENTAÇÕES SUGERIDAS**

1. **DSA Server (Data Synchronization & Access)**
   - Servidor de sincronização de dados
   - Acesso remoto
   - Upload de arquivos forenses

2. **Timeline Reconstruction**
   - Reconstrução de timeline completa
   - Análise temporal de eventos
   - Visualização gráfica

3. **Advanced AI Analysis**
   - NLP para análise de mensagens
   - Detecção de padrões criminais
   - Análise de sentimento

4. **Malware Scanner Integration**
   - Scanner de malware em tempo real
   - Detecção de APTs
   - Análise comportamental

5. **Cloud Forensics**
   - Extração de iCloud
   - Extração de Google Drive
   - Extração de OneDrive

---

## 📞 **SUPORTE**

Para mais informações sobre as implementações baseadas no Oxygen Forensic Detective, consulte:
- Documentação do Oxygen: https://www.oxygen-forensic.com/
- API Reference: `/api/docs` (FastAPI Swagger)

---

**Desenvolvido por: AP Elite**
**Versão: 2.0.0 - Oxygen Edition**
**Data: Outubro 2025**
