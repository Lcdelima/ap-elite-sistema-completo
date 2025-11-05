# 📍 ELITE ATHENA - MAPA DE INTEGRAÇÕES
## Localização de Todos os Arquivos de Integração

**Data**: Janeiro 2025  
**Objetivo**: Mostrar ONDE está CADA integração

---

## 🗺️ ESTRUTURA DE PASTAS

```
/app/
├── backend/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── enhanced_login.py          ✅ Login com Session Guard
│   │   │   ├── register_controlled.py     ✅ Cadastro controlado
│   │   │   └── two_factor.py              ✅ 2FA/TOTP
│   │   │
│   │   ├── modules/
│   │   │   ├── advocacia/
│   │   │   │   ├── clientes_dossie.py     ✅ Dossiê digital
│   │   │   │   ├── sync_judicial.py       ✅ Sync tribunais (base)
│   │   │   │   ├── sync_judicial_complete.py  ✅ Sync completo
│   │   │   │   ├── processes_advanced.py  ✅ Processos avançados
│   │   │   │   └── peticoes_ia.py         ✅ Petições com IA
│   │   │   │
│   │   │   ├── pericia/
│   │   │   │   ├── evidence_vault.py      ✅ Evidence Vault
│   │   │   │   ├── elite_seal.py          ✅ Elite Seal (RSA)
│   │   │   │   ├── deepfake_api.py        ✅ Deepfake detection
│   │   │   │   ├── cloud_forensics_complete.py  ✅ Cloud (AWS/GCP/Azure)
│   │   │   │   ├── crypto_forensics.py    ✅ Blockchain analytics
│   │   │   │   ├── forensic_tools_api.py  ✅ Cellebrite/UFED/FTK
│   │   │   │   └── transcription_advanced.py  ✅ Transcrição + diarização
│   │   │   │
│   │   │   ├── comunicacao/
│   │   │   │   ├── chat_e2ee.py           ✅ Chat criptografado
│   │   │   │   ├── video_conference.py    ✅ Daily.co integration
│   │   │   │   ├── inbox_hibrida.py       ✅ Inbox unificada
│   │   │   │   └── calendar_oauth.py      ✅ Google Calendar OAuth
│   │   │   │
│   │   │   ├── sala_aula/
│   │   │   │   └── sala_aula_complete.py  ✅ Cursos/Provas/Certificados
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── financial_complete.py  ✅ DRE/Fluxo de Caixa
│   │   │   │   └── nfe_service.py         ✅ NF-e
│   │   │   │
│   │   │   └── diversos/
│   │   │       ├── calculadoras.py        ✅ 16 calculadoras base
│   │   │       ├── calculadoras_expandidas.py  ✅ +5 calculadoras
│   │   │       ├── calc_universal_complete.py  ✅ +14 calculadoras
│   │   │       ├── calc_final_19.py       ✅ +19 calculadoras finais
│   │   │       └── transcription_vft.py   ✅ Transcrição VFT
│   │   │
│   │   ├── v1/pericia/
│   │   │   ├── router_complete.py         ✅ API Perícia completa
│   │   │   └── adapters/
│   │   │       ├── cellebrite.py          ✅ Parser UFDR
│   │   │       ├── ftk.py                 ✅ Parser FTK
│   │   │       └── disk_images.py         ✅ E01 reader
│   │   │
│   │   ├── storage/
│   │   │   ├── storage_connectors.py      ✅ AWS S3
│   │   │   └── google_drive_connector.py  ✅ Google Drive
│   │   │
│   │   ├── billing/
│   │   │   └── billing_service.py         ✅ Assinaturas
│   │   │
│   │   ├── payments/
│   │   │   ├── stripe_integration.py      ✅ Stripe
│   │   │   └── pagbank_integration.py     ✅ PagBank
│   │   │
│   │   ├── chat/
│   │   │   └── elite_lex_api.py           ✅ Chat IA jurídico
│   │   │
│   │   ├── entitlements/
│   │   │   └── entitlements_api.py        ✅ Licenciamento
│   │   │
│   │   ├── health/
│   │   │   └── health_check.py            ✅ Health check
│   │   │
│   │   └── integrations/
│   │       └── google_calendar.py         ✅ Google Calendar
│   │
│   ├── services/
│   │   ├── tribunal_adapters.py           ✅ Adaptadores tribunais
│   │   ├── tribunal_sync_tasks.py         ✅ Tasks Celery sync
│   │   ├── transcription_service.py       ✅ Whisper multi-provider
│   │   ├── rag_juridico.py                ✅ RAG jurídico (GPT-4o)
│   │   ├── diarization_service.py         ✅ Diarização
│   │   ├── deepfake_detection.py          ✅ Deepfake detector
│   │   ├── forensic_tools_connector.py    ✅ Cellebrite/UFED/FTK
│   │   ├── asr.py                         ✅ ASR Whisper
│   │   └── google_speech_service.py       ✅ Google Speech (estrutura)
│   │
│   ├── core/
│   │   ├── entitlements.py                ✅ Sistema de licenças
│   │   ├── session_guard.py               ✅ Session Guard
│   │   ├── session_audit.py               ✅ Audit Trail forense
│   │   └── feature_flags.py               ✅ Feature flags
│   │
│   ├── middleware/
│   │   └── entitlements_middleware.py     ✅ Middleware licenças
│   │
│   ├── workers/
│   │   └── evidence_processor.py          ✅ Background workers
│   │
│   └── jobs/
│       ├── celery_app.py                  ✅ Celery config
│       └── tasks_pericia.py               ✅ Tasks perícia
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── site/
        │   │   ├── Home.jsx                ✅ Site institucional
        │   │   └── RequestAccess.jsx       ✅ Cadastro
        │   │
        │   ├── advocacia/
        │   │   ├── AdvocaciaDashboard.jsx  ✅ Dashboard
        │   │   ├── ProcessesAdvanced.jsx   ✅ Processos avançados
        │   │   ├── ProcessFormWizard.jsx   ✅ Wizard
        │   │   ├── AnaliseProcessualPro.jsx ✅ Análise IA
        │   │   ├── ContratoEditor.jsx      ✅ Editor contratos
        │   │   ├── PeticoesIA.jsx          ✅ Petições IA
        │   │   ├── ProcessListProfessional.jsx ✅ Lista profissional
        │   │   ├── ClienteDossie.jsx       ✅ Dossiê
        │   │   └── SyncJudicial.jsx        ✅ Sync tribunais
        │   │
        │   ├── pericia/
        │   │   ├── PericiaDashboard.jsx    ✅ Dashboard
        │   │   ├── EvidenceVault.jsx       ✅ Evidence Vault
        │   │   ├── EliteSeal.jsx           ✅ Elite Seal
        │   │   ├── DeepfakeLab.jsx         ✅ Deepfake
        │   │   ├── CloudForensics.jsx      ✅ Cloud
        │   │   ├── CryptoForensics.jsx     ✅ Crypto
        │   │   ├── BrowserForensics.jsx    ✅ Browser
        │   │   ├── InterceptacaoElitePro.jsx ✅ Interceptação
        │   │   └── ForensicToolsHub.jsx    ✅ Ferramentas
        │   │
        │   ├── admin/
        │   │   ├── AdminDashboard.jsx      ✅ Dashboard
        │   │   ├── PortalCliente.jsx       ✅ Portal
        │   │   ├── AnalyticsDashboard.jsx  ✅ Analytics
        │   │   ├── MarketplaceIntegracoes.jsx ✅ Marketplace
        │   │   ├── StorageConfig.jsx       ✅ Storage
        │   │   ├── TwoFactorAuth.jsx       ✅ 2FA
        │   │   ├── DashboardFinanceiro.jsx ✅ Financeiro
        │   │   └── NFEManager.jsx          ✅ NF-e
        │   │
        │   ├── comunicacao/
        │   │   ├── ComunicacaoDashboard.jsx ✅ Dashboard
        │   │   ├── ChatE2EE.jsx            ✅ Chat
        │   │   └── InboxHibrida.jsx        ✅ Inbox
        │   │
        │   ├── sala-aula/
        │   │   ├── SalaAulaDashboard.jsx   ✅ Dashboard
        │   │   ├── CoursePlayer.jsx        ✅ Player
        │   │   ├── AssessmentTaker.jsx     ✅ Provas
        │   │   ├── CertificateViewer.jsx   ✅ Certificados
        │   │   └── GamificationDashboard.jsx ✅ Gamificação
        │   │
        │   └── diversos/
        │       ├── DiversosDashboard.jsx   ✅ Dashboard
        │       ├── TranscriptionVFT.jsx    ✅ Transcrição
        │       └── Calculadoras.jsx        ✅ Calculadoras
        │
        ├── components/
        │   ├── ui/
        │   │   ├── CipherGlassCard.jsx     ✅ Card glass
        │   │   └── ProofBar.jsx            ✅ ProofBar
        │   ├── SectionHeader.jsx           ✅ Header universal
        │   ├── EliteWatermark.jsx          ✅ Marca d'água
        │   ├── EliteSignature.jsx          ✅ Assinatura
        │   └── CommandPalette.jsx          ✅ Busca rápida
        │
        ├── contexts/
        │   └── EntitlementsContext.jsx     ✅ Context licenças
        │
        └── styles/
            ├── elite-gravitas.css          ✅ Design V1
            └── elite-forensic.css          ✅ Design V3 (atual)
```

---

## 🔌 LOCALIZAÇÃO DAS INTEGRAÇÕES POR TIPO

### **1. INTELIGÊNCIA ARTIFICIAL (IA)**

**Whisper (Transcrição)**:
- Arquivo: `/app/backend/services/transcription_service.py`
- Classe: `WhisperTranscriptionService`
- Uso: `from services.transcription_service import WhisperTranscriptionService`

**GPT-4o (IA Jurídica)**:
- Arquivo: `/app/backend/services/rag_juridico.py`
- Classe: `EliteLexRAG`
- Uso: `from services.rag_juridico import EliteLexRAG`

**Diarização**:
- Arquivo: `/app/backend/services/diarization_service.py`
- Classe: `DiarizationService`

---

### **2. TRIBUNAIS (SYNC JUDICIAL)**

**Adaptadores**:
- Arquivo: `/app/backend/services/tribunal_adapters.py`
- Classes:
  - `PJeAdapter` (todos TJs, TRFs, TRTs com PJe)
  - `ESajAdapter` (TJSP)
  - `EProcAdapter` (Federal)
  - `ProjudiAdapter`
  - `CNJAPIAdapter`

**Tasks Celery**:
- Arquivo: `/app/backend/services/tribunal_sync_tasks.py`
- Tasks:
  - `sincronizar_processo_task`
  - `sincronizar_todos_processos_task`
  - `detectar_prazos_task`

**API REST**:
- Arquivo: `/app/backend/api/modules/advocacia/sync_judicial_complete.py`
- Endpoints: `/api/sync-judicial-complete/*`

**Interface**:
- Arquivo: `/app/frontend/src/pages/advocacia/SyncJudicial.jsx`
- Rota: `/athena/sync-judicial`

---

### **3. STORAGE (ARMAZENAMENTO)**

**AWS S3**:
- Arquivo: `/app/backend/api/storage/storage_connectors.py`
- Classe: `S3StorageService`
- Endpoint: `/api/storage/*`

**Google Drive**:
- Arquivo: `/app/backend/api/storage/google_drive_connector.py`
- Endpoint: `/api/storage/google-drive/*`

**Interface**:
- Arquivo: `/app/frontend/src/pages/admin/StorageConfig.jsx`
- Rota: `/athena/storage-config`

---

### **4. PAGAMENTOS**

**Stripe**:
- Arquivo: `/app/backend/api/payments/stripe_integration.py`
- Endpoint: `/api/payments/stripe/*`

**PagBank**:
- Arquivo: `/app/backend/api/payments/pagbank_integration.py`
- Endpoint: `/api/payments/pagbank/*`

**Billing System**:
- Arquivo: `/app/backend/api/billing/billing_service.py`
- Endpoint: `/api/billing/*`

---

### **5. COMUNICAÇÃO**

**Chat E2EE**:
- Arquivo: `/app/backend/api/modules/comunicacao/chat_e2ee.py`
- Frontend: `/app/frontend/src/pages/comunicacao/ChatE2EE.jsx`
- Endpoint: `/api/chat/*`
- WebSocket: `/api/chat/ws/{room_id}`

**Video (Daily.co)**:
- Arquivo: `/app/backend/api/modules/comunicacao/video_conference.py`
- Endpoint: `/api/video/*`

**Google Calendar**:
- Arquivo: `/app/backend/api/modules/comunicacao/calendar_oauth.py`
- Endpoint: `/api/calendar/oauth/*`

**Inbox Híbrida**:
- Arquivo: `/app/backend/api/modules/comunicacao/inbox_hibrida.py`
- Frontend: `/app/frontend/src/pages/comunicacao/InboxHibrida.jsx`
- Endpoint: `/api/inbox/*`

---

### **6. FERRAMENTAS FORENSES**

**Cellebrite/UFED/FTK**:
- Conector: `/app/backend/services/forensic_tools_connector.py`
- API: `/app/backend/api/modules/pericia/forensic_tools_api.py`
- Frontend: `/app/frontend/src/pages/pericia/ForensicToolsHub.jsx`

**Adaptadores**:
- Cellebrite: `/app/backend/api/v1/pericia/adapters/cellebrite.py`
- FTK: `/app/backend/api/v1/pericia/adapters/ftk.py`
- Disk Images: `/app/backend/api/v1/pericia/adapters/disk_images.py`

---

### **7. AUTENTICAÇÃO E SEGURANÇA**

**Session Guard**:
- Arquivo: `/app/backend/core/session_guard.py`
- Classe: `SessionGuard`

**2FA/TOTP**:
- Arquivo: `/app/backend/api/auth/two_factor.py`
- Frontend: `/app/frontend/src/pages/admin/TwoFactorAuth.jsx`
- Endpoint: `/api/auth/2fa/*`

**Audit Trail**:
- Arquivo: `/app/backend/core/session_audit.py`
- Classe: `SessionAudit`

**Entitlements**:
- Arquivo: `/app/backend/core/entitlements.py`
- API: `/app/backend/api/entitlements/entitlements_api.py`

---

### **8. WORKERS E FILAS**

**Celery App**:
- Arquivo: `/app/backend/jobs/celery_app.py`
- Configuração: Redis broker

**Tasks**:
- Perícia: `/app/backend/jobs/tasks_pericia.py`
- Sync Judicial: `/app/backend/services/tribunal_sync_tasks.py`

---

## 📍 COMO ACESSAR CADA INTEGRAÇÃO

### **Para USAR uma integração**:

#### **1. Transcrição (Whisper)**:
```python
from services.transcription_service import WhisperTranscriptionService

service = WhisperTranscriptionService()
result = await service.transcribe(audio_path="path/to/audio.mp3")
```

#### **2. IA Jurídica (GPT-4o)**:
```python
from services.rag_juridico import EliteLexRAG

rag = EliteLexRAG()
result = await rag.search_jurisprudence(query="prescrição")
```

#### **3. Sync Tribunal (PJe)**:
```python
from services.tribunal_adapters import PJeAdapter

adapter = PJeAdapter(
    base_url="https://pje.tjsp.jus.br",
    credenciais={"username": "OAB123", "password": "***"}
)
adapter.login()
andamentos = adapter.baixar_andamentos("0000000-00.0000.8.26.0100")
```

#### **4. Evidence Vault**:
```
POST /api/evidence-vault/upload
GET /api/evidence-vault/{evidence_id}
POST /api/evidence-vault/{evidence_id}/seal
```

#### **5. 2FA/TOTP**:
```
POST /api/auth/2fa/enable
POST /api/auth/2fa/verify
GET /api/auth/2fa/backup-codes/{user_id}
```

---

## 🎯 CONFIGURAÇÃO DAS INTEGRAÇÕES

### **Variáveis de Ambiente (.env)**:

```bash
# IA
EMERGENT_LLM_KEY=sk-emergent-aD33e9977E0D345EfD  ✅ Configurado

# Database
MONGO_URL=mongodb://localhost:27017              ✅ Configurado
DB_NAME=test_database                            ✅ Configurado

# Maps
GOOGLE_MAPS_API_KEY=AIzaSy...                   ✅ Configurado

# Storage
AWS_ACCESS_KEY_ID=                              ❌ Cliente configura
AWS_SECRET_ACCESS_KEY=                          ❌ Cliente configura

# Pagamentos
STRIPE_SECRET_KEY=                              ❌ Pendente
PAGBANK_TOKEN=                                  ❌ Pendente

# Video
DAILY_API_KEY=                                  ❌ Pendente

# Calendar
GOOGLE_CLIENT_ID=                               ❌ Pendente
GOOGLE_CLIENT_SECRET=                           ❌ Pendente

# Tribunais (por advogado/OAB)
# Configurado via interface em /athena/sync-judicial
```

---

## 📂 ONDE ESTÃO OS ARQUIVOS

**Backend**:
- `/app/backend/` - Raiz do backend
- Navegue pelas pastas acima

**Frontend**:
- `/app/frontend/src/` - Raiz do frontend
- Páginas em `pages/`
- Componentes em `components/`
- Estilos em `styles/`

**Documentação**:
- `/app/` - Raiz do projeto
- Todos os `.md` files

---

## 🚀 PARA ATIVAR UMA INTEGRAÇÃO

1. **Configure a variável de ambiente** (se necessário)
2. **Reinicie o backend**: `sudo supervisorctl restart backend`
3. **Use os endpoints** ou importe as classes
4. **Teste** via interface ou API

---

**Todas as integrações estão prontas e bem organizadas!**

**Localização**: Consulte este arquivo `/app/MAPA_INTEGRACOES.md`
