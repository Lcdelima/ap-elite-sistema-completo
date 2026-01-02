# 🛡️ Aegis/Thanatos - Sistema de Interceptação Legal e Evidências Forenses

Sistema profissional para gestão de interceptações legais, evidências forenses e cadeia de custódia com tecnologia blockchain-like.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [Instalação](#instalação)
4. [Configuração](#configuração)
5. [Uso](#uso)
6. [API Endpoints](#api-endpoints)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### Características Principais

✅ **Gestão de Casos**
- Criação e gerenciamento de casos de investigação
- Status de casos (ATIVO, SUSPENSO, FECHADO)
- Controle de alvos de interceptação

✅ **Ordens Judiciais**
- Upload de documentos com validação de hash SHA-256
- Controle de período de validade (data início/fim)
- Validação automática de vigência

✅ **Ingestão de Evidências**
- Upload de arquivos de áudio (mp3, wav, m4a, ogg)
- Validação de ordem judicial vigente
- Transcrição automática com OpenAI Whisper
- Suporte a arquivos até 500MB

✅ **Cadeia de Custódia Blockchain-Like**
- Registro imutável de eventos
- Hash encadeado (cada evento referencia o anterior)
- Tamper-evident (detecta adulterações)
- Rastreabilidade completa

✅ **Auditoria Completa**
- Registro de todas ações
- IP e User-Agent tracking
- TimescaleDB para análise temporal

---

## 🔧 Requisitos

### Sistema Operacional
- Linux (Ubuntu 20.04+ recomendado)
- macOS (com Homebrew)
- Windows (com WSL2)

### Software Necessário

```bash
# PostgreSQL 15+
# TimescaleDB 2.0+
# Python 3.11+
# Docker e Docker Compose (recomendado)
```

---

## 📦 Instalação

### Opção 1: Usando Docker (RECOMENDADO)

```bash
# 1. Clonar/acessar diretório Aegis
cd /app/aegis

# 2. Iniciar PostgreSQL + TimescaleDB
docker-compose up -d

# 3. Aguardar banco estar pronto (30 segundos)
sleep 30

# 4. Habilitar TimescaleDB
docker exec aegis-postgres psql -U aegis -d aegis -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

# 5. Criar hypertables
docker exec aegis-postgres psql -U aegis -d aegis << 'EOF'
-- Tabelas para TimescaleDB
SELECT create_hypertable('audit_logs', 'timestamp', if_not_exists => TRUE);
SELECT create_hypertable('custody_events', 'timestamp', if_not_exists => TRUE);

-- Índices otimizados
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_ts ON audit_logs (actor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_ts ON audit_logs (entity_type, entity_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_custody_events_evidence_ts ON custody_events (evidence_id, timestamp DESC);

-- Políticas de compressão (opcional)
ALTER TABLE audit_logs SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'actor_id'
);

SELECT add_compression_policy('audit_logs', INTERVAL '7 days');

-- Política de retenção (opcional - 3 anos)
SELECT add_retention_policy('audit_logs', INTERVAL '3 years');
EOF

# 6. Instalar dependências Python
pip install -r requirements.txt

# 7. Configurar .env
cp .env.example .env
# Editar .env com suas configurações

# 8. Iniciar API
cd /app/aegis
python -m app.main
```

### Opção 2: Instalação Manual PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15 postgresql-15-timescaledb

# macOS (Homebrew)
brew install postgresql@15
brew install timescaledb

# Habilitar TimescaleDB
sudo timescaledb-tune --quiet --yes

# Criar banco de dados
sudo -u postgres psql << 'EOF'
CREATE DATABASE aegis;
CREATE USER aegis WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE aegis TO aegis;
\c aegis
CREATE EXTENSION IF NOT EXISTS timescaledb;
EOF

# Continuar com passos 6-8 acima
```

---

## ⚙️ Configuração

### Arquivo .env

Crie o arquivo `/app/aegis/.env` com as seguintes variáveis:

```bash
# Banco de Dados
DATABASE_URL=postgresql+psycopg2://aegis:aegis@localhost:5433/aegis

# Storage (local ou S3)
STORAGE_BACKEND=local
STORAGE_LOCAL_DIR=/app/aegis/data/evidences

# S3 (opcional - se usar storage na nuvem)
# S3_ENDPOINT_URL=https://s3.amazonaws.com
# S3_ACCESS_KEY_ID=sua_access_key
# S3_SECRET_ACCESS_KEY=sua_secret_key
# S3_BUCKET=aegis-evidences
# S3_REGION=us-east-1

# Emergent LLM Key (para transcrição Whisper)
EMERGENT_LLM_KEY=sk-emergent-aD33e9977E0D345EfD

# API Port (opcional)
PORT=8002
```

### Estrutura de Diretórios

```
/app/aegis/
├── app/
│   ├── __init__.py
│   ├── main.py          # API FastAPI
│   ├── models.py        # Modelos SQLAlchemy
│   ├── schemas.py       # Schemas Pydantic
│   ├── db.py            # Conexão banco
│   ├── config.py        # Configurações
│   ├── security.py      # Autenticação
│   └── storage.py       # Storage backend
├── data/
│   └── evidences/       # Armazenamento local
├── docker-compose.yml   # Docker PostgreSQL
├── requirements.txt     # Dependências Python
├── .env                 # Configurações (criar)
└── README.md            # Esta documentação
```

---

## 🚀 Uso

### Iniciar a API

```bash
# Método 1: Python direto
cd /app/aegis
python -m app.main

# Método 2: Uvicorn com reload
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload

# Método 3: Background (produção)
nohup uvicorn app.main:app --host 0.0.0.0 --port 8002 > aegis.log 2>&1 &
```

A API estará disponível em: `http://localhost:8002`

Documentação interativa: `http://localhost:8002/docs`

---

## 📡 API Endpoints

### Autenticação

Todos os endpoints requerem o header `X-Actor-Id` com o ID do usuário/sistema:

```bash
curl -H "X-Actor-Id: usuario@example.com" http://localhost:8002/cases
```

### 1. Casos

#### Criar Caso
```bash
POST /cases
Content-Type: application/json
X-Actor-Id: usuario@example.com

{
  "name": "Operação Exemplo"
}

# Resposta:
{
  "id": "uuid",
  "name": "Operação Exemplo",
  "status": "ACTIVE",
  "created_at": "2025-01-02T..."
}
```

#### Listar Casos
```bash
GET /cases
X-Actor-Id: usuario@example.com
```

#### Obter Caso
```bash
GET /cases/{case_id}
X-Actor-Id: usuario@example.com
```

### 2. Alvos

#### Adicionar Alvo ao Caso
```bash
POST /cases/{case_id}/targets
Content-Type: application/json
X-Actor-Id: usuario@example.com

{
  "type": "PHONE",
  "value": "+5511987654321",
  "label": "Suspeito Principal"
}
```

### 3. Ordens Judiciais

#### Upload de Ordem Judicial
```bash
POST /cases/{case_id}/judicial-orders
Content-Type: multipart/form-data
X-Actor-Id: usuario@example.com

Form Data:
- process_number: "1234567-89.2024.8.26.0100"
- court: "1ª Vara Criminal de São Paulo"
- judge: "Dr. João Silva"
- valid_from: "2024-01-01T00:00:00Z"
- valid_until: "2024-12-31T23:59:59Z"
- file: ordem_judicial.pdf
```

### 4. Evidências de Áudio

#### Ingestão de Áudio (com transcrição automática)
```bash
POST /cases/{case_id}/evidences/audio
Content-Type: multipart/form-data
X-Actor-Id: usuario@example.com

Form Data:
- file: audio_interceptacao.mp3
- target_id: "uuid-do-alvo" (opcional)
- collected_at: "2024-01-15T14:30:00Z" (opcional)
- judicial_order_id: "uuid-da-ordem" (opcional - usa ordem vigente se omitido)

# Resposta:
{
  "id": "uuid",
  "case_id": "uuid",
  "type": "AUDIO",
  "status": "PROCESSING",
  "sha256": "hash...",
  "transcription": null  # Será preenchido após processamento
}
```

#### Listar Evidências
```bash
GET /cases/{case_id}/evidences
X-Actor-Id: usuario@example.com
```

#### Obter Evidência
```bash
GET /evidences/{evidence_id}
X-Actor-Id: usuario@example.com

# Resposta incluirá transcrição se disponível:
{
  "id": "uuid",
  "status": "PROCESSED",
  "transcription": "Texto transcrito do áudio...",
  ...
}
```

---

## 🔍 Exemplo Completo de Fluxo

```bash
# 1. Criar Caso
CASE_ID=$(curl -s -X POST http://localhost:8002/cases \
  -H "Content-Type: application/json" \
  -H "X-Actor-Id: delegado@policia.gov.br" \
  -d '{"name":"Operação Silêncio"}' \
  | jq -r '.id')

echo "Caso criado: $CASE_ID"

# 2. Adicionar Alvo
TARGET_ID=$(curl -s -X POST http://localhost:8002/cases/$CASE_ID/targets \
  -H "Content-Type: application/json" \
  -H "X-Actor-Id: delegado@policia.gov.br" \
  -d '{"type":"PHONE","value":"+5511999999999","label":"Suspeito A"}' \
  | jq -r '.id')

echo "Alvo criado: $TARGET_ID"

# 3. Upload Ordem Judicial
ORDER_ID=$(curl -s -X POST http://localhost:8002/cases/$CASE_ID/judicial-orders \
  -H "X-Actor-Id: delegado@policia.gov.br" \
  -F "process_number=1234567-89.2024.8.26.0100" \
  -F "court=1ª Vara Criminal SP" \
  -F "judge=Dr. João Silva" \
  -F "valid_from=2024-01-01T00:00:00Z" \
  -F "valid_until=2024-12-31T23:59:59Z" \
  -F "file=@ordem.pdf" \
  | jq -r '.id')

echo "Ordem judicial criada: $ORDER_ID"

# 4. Ingerir Áudio (será transcrito automaticamente)
EVIDENCE_ID=$(curl -s -X POST http://localhost:8002/cases/$CASE_ID/evidences/audio \
  -H "X-Actor-Id: delegado@policia.gov.br" \
  -F "file=@interceptacao.mp3" \
  -F "target_id=$TARGET_ID" \
  -F "collected_at=2024-06-15T10:30:00Z" \
  | jq -r '.id')

echo "Evidência criada: $EVIDENCE_ID"

# 5. Aguardar transcrição (processamento em background)
sleep 30

# 6. Consultar evidência com transcrição
curl -s http://localhost:8002/evidences/$EVIDENCE_ID \
  -H "X-Actor-Id: delegado@policia.gov.br" \
  | jq '{id, status, transcription}'
```

---

## 🐛 Troubleshooting

### Problema: "Connection refused" ao conectar no PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep aegis-postgres

# Ver logs do container
docker logs aegis-postgres

# Reiniciar container
docker-compose restart
```

### Problema: TimescaleDB não habilitado

```bash
# Verificar extensão
docker exec aegis-postgres psql -U aegis -d aegis -c "SELECT * FROM pg_extension WHERE extname='timescaledb';"

# Habilitar novamente
docker exec aegis-postgres psql -U aegis -d aegis -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

### Problema: Erro na transcrição de áudio

```bash
# Verificar se EMERGENT_LLM_KEY está configurado
cat /app/aegis/.env | grep EMERGENT_LLM_KEY

# Verificar logs da API
tail -f aegis.log

# Testar manualmente
python << 'EOF'
from emergentintegrations.llm.openai import OpenAISpeechToText
import os
from dotenv import load_dotenv

load_dotenv()
stt = OpenAISpeechToText(api_key=os.getenv("EMERGENT_LLM_KEY"))
print("✅ Conexão OK" if stt else "❌ Erro")
EOF
```

### Problema: Arquivo muito grande (>25MB para Whisper)

O Whisper da OpenAI tem limite de 25MB. Para arquivos maiores:

```bash
# Opção 1: Comprimir áudio
ffmpeg -i audio_grande.mp3 -ab 64k audio_comprimido.mp3

# Opção 2: Dividir em chunks
ffmpeg -i audio_grande.mp3 -f segment -segment_time 600 -c copy chunk_%03d.mp3
```

### Problema: Permissões no diretório de storage

```bash
# Criar diretório e dar permissões
mkdir -p /app/aegis/data/evidences
chmod 777 /app/aegis/data/evidences
```

---

## 🔐 Segurança e Boas Práticas

### 1. Produção

```bash
# Usar senha forte para PostgreSQL
# Trocar no docker-compose.yml e .env

# Habilitar SSL/TLS no PostgreSQL
# Adicionar certificados em /etc/postgresql/

# Usar firewall
sudo ufw allow 8002/tcp
sudo ufw allow 5433/tcp  # Apenas de IPs confiáveis

# Reverse proxy com Nginx
# (configuração fornecida separadamente se necessário)
```

### 2. Backup

```bash
# Backup automático diário
crontab -e
# Adicionar:
0 2 * * * docker exec aegis-postgres pg_dump -U aegis aegis > /backups/aegis_$(date +\%Y\%m\%d).sql
```

### 3. Monitoramento

```bash
# Logs da API
tail -f aegis.log

# Status do banco
docker exec aegis-postgres pg_isready -U aegis

# Espaço em disco
df -h /app/aegis/data/evidences
```

---

## 📊 Modelo de Dados

### Relacionamentos

```
Case (Caso)
├── JudicialOrder (Ordem Judicial) [1:N]
├── Target (Alvo) [1:N]
└── Evidence (Evidência) [1:N]
    └── CustodyEvent (Cadeia de Custódia) [1:N]

AuditLog (Auditoria) - registro de todas ações
```

### Cadeia de Custódia

Cada evento registra:
- `actor_id`: Quem realizou a ação
- `action`: Tipo de ação (INGESTED, ACCESSED, TRANSCRIBED, etc.)
- `timestamp`: Quando ocorreu
- `prev_event_hash`: Hash do evento anterior
- `event_hash`: Hash do evento atual (SHA-256)
- `metadata`: Dados adicionais (JSON)

O hash é calculado como:
```python
SHA256(evidence_id + actor_id + action + timestamp + prev_hash + metadata)
```

Isso garante que qualquer alteração seja detectada.

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar esta documentação
2. Consultar logs: `tail -f aegis.log`
3. Verificar issues conhecidos na seção Troubleshooting

---

## 📝 Licença

Sistema proprietário - AP Elite Gravitas™
Todos os direitos reservados.
