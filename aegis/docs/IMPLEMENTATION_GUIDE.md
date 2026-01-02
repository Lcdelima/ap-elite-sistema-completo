# 🔧 Guia Completo de Implementação PostgreSQL + TimescaleDB
## Aegis/Thanatos - Passo a Passo Detalhado

---

## 📋 ETAPA 1: Instalação do PostgreSQL

### Windows

```powershell
# 1. Baixar PostgreSQL 15
# Acessar: https://www.postgresql.org/download/windows/
# Ou usar o instalador EnterpriseDB

# 2. Durante instalação, anotar:
# - Porta: 5432 (padrão)
# - Senha do postgres: [SENHA_FORTE]
# - Diretório de dados: C:\Program Files\PostgreSQL\15\data

# 3. Após instalação, verificar:
psql --version
# Saída esperada: psql (PostgreSQL) 15.x

# 4. Conectar ao PostgreSQL
psql -U postgres
```

### Linux (Ubuntu/Debian)

```bash
# 1. Atualizar repositórios
sudo apt update

# 2. Instalar PostgreSQL 15
sudo apt install postgresql-15 postgresql-contrib-15

# 3. Verificar instalação
psql --version

# 4. Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 5. Verificar status
sudo systemctl status postgresql

# 6. Conectar
sudo -u postgres psql
```

### macOS

```bash
# 1. Usando Homebrew
brew install postgresql@15

# 2. Iniciar serviço
brew services start postgresql@15

# 3. Verificar
psql --version

# 4. Conectar
psql postgres
```

---

## 📦 ETAPA 2: Instalação do TimescaleDB

### Windows

```powershell
# 1. Baixar TimescaleDB
# Acessar: https://docs.timescale.com/install/latest/self-hosted/installation-windows/

# 2. Executar instalador
# timescaledb-windows-2.14.2-postgresql-15.exe

# 3. Durante instalação:
# - Selecionar PostgreSQL 15
# - Confirmar caminho de instalação
# - Permitir modificação do postgresql.conf

# 4. Verificar instalação
psql -U postgres -c "SELECT * FROM pg_available_extensions WHERE name = 'timescaledb';"
```

### Linux (Ubuntu/Debian)

```bash
# 1. Adicionar repositório TimescaleDB
sudo sh -c "echo 'deb [signed-by=/usr/share/keyrings/timescale.keyring] https://packagecloud.io/timescale/timescaledb/ubuntu/ $(lsb_release -c -s) main' > /etc/apt/sources.list.d/timescaledb.list"

# 2. Importar chave GPG
wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/timescale.keyring

# 3. Atualizar e instalar
sudo apt update
sudo apt install timescaledb-2-postgresql-15

# 4. Configurar PostgreSQL
sudo timescaledb-tune --quiet --yes

# 5. Reiniciar PostgreSQL
sudo systemctl restart postgresql

# 6. Verificar instalação
sudo -u postgres psql -c "SELECT * FROM pg_available_extensions WHERE name = 'timescaledb';"
```

### macOS

```bash
# 1. Usando Homebrew
brew install timescaledb

# 2. Configurar
timescaledb-tune --quiet --yes

# 3. Reiniciar PostgreSQL
brew services restart postgresql@15

# 4. Verificar
psql postgres -c "SELECT * FROM pg_available_extensions WHERE name = 'timescaledb';"
```

---

## 🗄️ ETAPA 3: Criar Banco de Dados TimescaleDB

### Script de Criação

```sql
-- ================================================
-- Aegis Database Setup Script
-- Execute como usuário postgres
-- ================================================

-- 1. Criar usuário aegis
CREATE USER aegis WITH PASSWORD 'sua_senha_muito_forte_aqui';

-- 2. Criar banco de dados
CREATE DATABASE aegis OWNER aegis;

-- 3. Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE aegis TO aegis;

-- 4. Conectar ao banco aegis
\c aegis

-- 5. Habilitar TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 6. Verificar extensão
SELECT * FROM pg_extension WHERE extname = 'timescaledb';

-- 7. Conceder permissões ao usuário aegis
GRANT ALL ON SCHEMA public TO aegis;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aegis;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aegis;

-- 8. Configurar permissões futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aegis;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aegis;

-- Sucesso!
SELECT 'Banco de dados Aegis criado com sucesso!' AS status;
```

### Execução do Script

```bash
# Linux/macOS
sudo -u postgres psql < /app/aegis/scripts/create_database.sql

# Windows
psql -U postgres -f C:\aegis\scripts\create_database.sql

# Ou manualmente
sudo -u postgres psql
\i /app/aegis/scripts/create_database.sql
```

---

## 📊 ETAPA 4: Definir Estrutura do Banco de Dados

### 4.1 Diagrama Entidade-Relacionamento (ER)

```
┌─────────────────┐
│     CASE        │
│─────────────────│
│ id (PK)         │
│ name            │
│ status          │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────┬────────────┬──────────┐
    │         │            │          │
    ▼         ▼            ▼          ▼
┌────────┐ ┌─────────┐ ┌────────┐ ┌─────────┐
│JUDICIAL│ │ TARGET  │ │EVIDENCE│ │ AUDIT   │
│ ORDER  │ │         │ │        │ │  LOG    │
└────────┘ └────┬────┘ └───┬────┘ └─────────┘
                │          │
                │ 1:N      │ 1:N
                │          │
                └──────────┴─────────┐
                                     ▼
                              ┌──────────────┐
                              │CUSTODY_EVENT │
                              │              │
                              │ (Blockchain) │
                              └──────────────┘
```

### 4.2 Modelo de Dados Detalhado

#### Tabela: CASES
```sql
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CLOSED'))
);

-- Índice para busca por status
CREATE INDEX idx_cases_status ON cases(status, created_at DESC);
```

#### Tabela: JUDICIAL_ORDERS
```sql
CREATE TABLE judicial_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    
    process_number VARCHAR(80) NOT NULL,
    court VARCHAR(120) NOT NULL,
    judge VARCHAR(120) NOT NULL,
    
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    
    document_sha256 VARCHAR(64) NOT NULL,
    document_uri TEXT NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_case_process_number UNIQUE(case_id, process_number),
    CONSTRAINT chk_valid_dates CHECK (valid_until > valid_from)
);

-- Índices
CREATE INDEX idx_judicial_orders_case ON judicial_orders(case_id);
CREATE INDEX idx_judicial_orders_dates ON judicial_orders(valid_from, valid_until);
```

#### Tabela: TARGETS
```sql
CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    
    type VARCHAR(20) NOT NULL,
    value VARCHAR(200) NOT NULL,
    label VARCHAR(200),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_case_target UNIQUE(case_id, type, value),
    CONSTRAINT chk_target_type CHECK (type IN ('PHONE', 'IP', 'PERSON', 'IDENTIFIER'))
);

CREATE INDEX idx_targets_case ON targets(case_id);
CREATE INDEX idx_targets_value ON targets(value, type);
```

#### Tabela: EVIDENCES
```sql
CREATE TABLE evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    target_id UUID REFERENCES targets(id) ON DELETE SET NULL,
    judicial_order_id UUID REFERENCES judicial_orders(id) ON DELETE SET NULL,
    
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED',
    
    mime_type VARCHAR(120) NOT NULL,
    original_filename VARCHAR(260) NOT NULL,
    size_bytes INTEGER NOT NULL,
    
    sha256 VARCHAR(64) NOT NULL,
    storage_uri TEXT NOT NULL,
    
    collected_at TIMESTAMPTZ,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    transcription TEXT,
    
    CONSTRAINT chk_evidence_type CHECK (type IN ('AUDIO', 'DATA', 'IMAGE', 'VIDEO', 'DOCUMENT')),
    CONSTRAINT chk_evidence_status CHECK (status IN ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED'))
);

CREATE INDEX idx_evidences_case ON evidences(case_id, ingested_at DESC);
CREATE INDEX idx_evidences_sha256 ON evidences(sha256);
CREATE INDEX idx_evidences_status ON evidences(status);
```

#### Tabela: CUSTODY_EVENTS (Blockchain-like)
```sql
CREATE TABLE custody_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID NOT NULL REFERENCES evidences(id) ON DELETE CASCADE,
    
    actor_id VARCHAR(120) NOT NULL,
    action VARCHAR(30) NOT NULL,
    
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    prev_event_hash VARCHAR(64),  -- Hash do evento anterior (blockchain)
    event_hash VARCHAR(64) NOT NULL,  -- Hash deste evento
    
    metadata JSONB NOT NULL DEFAULT '{}',
    
    CONSTRAINT chk_custody_action CHECK (action IN (
        'INGESTED', 'HASH_VERIFIED', 'ACCESSED', 
        'EXPORTED', 'TRANSCRIBED', 'REDACTED'
    ))
);

CREATE INDEX idx_custody_events_evidence ON custody_events(evidence_id, timestamp DESC);
CREATE INDEX idx_custody_events_actor ON custody_events(actor_id, timestamp DESC);

-- Trigger para validar cadeia
CREATE OR REPLACE FUNCTION validate_custody_chain()
RETURNS TRIGGER AS $$
DECLARE
    last_hash VARCHAR(64);
BEGIN
    -- Buscar último hash
    SELECT event_hash INTO last_hash
    FROM custody_events
    WHERE evidence_id = NEW.evidence_id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- Se não for o primeiro evento, validar hash anterior
    IF last_hash IS NOT NULL AND NEW.prev_event_hash != last_hash THEN
        RAISE EXCEPTION 'Cadeia de custódia corrompida! Hash anterior não corresponde.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_custody_chain
    BEFORE INSERT ON custody_events
    FOR EACH ROW
    EXECUTE FUNCTION validate_custody_chain();
```

#### Tabela: AUDIT_LOGS
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id VARCHAR(120) NOT NULL,
    action VARCHAR(120) NOT NULL,
    
    entity_type VARCHAR(120) NOT NULL,
    entity_id VARCHAR(120) NOT NULL,
    
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    ip VARCHAR(64),
    user_agent VARCHAR(240),
    
    details JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, timestamp DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, timestamp DESC);
```

### 4.3 Converter para Hypertables (TimescaleDB)

```sql
-- Converter audit_logs para hypertable
SELECT create_hypertable('audit_logs', 'timestamp', if_not_exists => TRUE);

-- Converter custody_events para hypertable
SELECT create_hypertable('custody_events', 'timestamp', if_not_exists => TRUE);

-- Políticas de compressão (economiza espaço)
ALTER TABLE audit_logs SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'actor_id'
);

SELECT add_compression_policy('audit_logs', INTERVAL '7 days');

ALTER TABLE custody_events SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'evidence_id'
);

SELECT add_compression_policy('custody_events', INTERVAL '7 days');
```

### 4.4 Estratégia de Sharding e Chunks

```sql
-- Configurar tamanho de chunks (1 dia para audit_logs)
SELECT set_chunk_time_interval('audit_logs', INTERVAL '1 day');

-- Configurar tamanho de chunks (1 semana para custody_events)
SELECT set_chunk_time_interval('custody_events', INTERVAL '1 week');

-- Ver chunks criados
SELECT * FROM timescaledb_information.chunks
WHERE hypertable_name IN ('audit_logs', 'custody_events');

-- Reordenar chunks por timestamp (melhora performance)
SELECT add_reorder_policy('audit_logs', 'idx_audit_logs_actor');
SELECT add_reorder_policy('custody_events', 'idx_custody_events_evidence');
```

---

## 📝 ETAPA 5: Documentação da Implementação

### 5.1 Documentação de Tabelas

Já criado em: `/app/aegis/docs/DATABASE_SCHEMA.md`

### 5.2 Diagrama de Fluxo de Dados

```
┌─────────────────┐
│   CLIENTE/UI    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   AEGIS API     │
│   (FastAPI)     │
└────────┬────────┘
         │
         ├──────────────────┬─────────────────┐
         ▼                  ▼                 ▼
┌─────────────┐    ┌──────────────┐   ┌──────────────┐
│ PostgreSQL  │    │   Storage    │   │   Whisper    │
│+ TimescaleDB│    │ (Local/S3)   │   │     AI       │
└─────────────┘    └──────────────┘   └──────────────┘
```

### 5.3 Código de Exemplo - Ingestão de Evidência

```python
# Exemplo de uso da API
import requests
import hashlib

API_URL = "http://localhost:8002"
ACTOR_ID = "delegado@policia.gov.br"

# 1. Criar caso
response = requests.post(
    f"{API_URL}/cases",
    json={"name": "Operação Exemplo"},
    headers={"X-Actor-Id": ACTOR_ID}
)
case_id = response.json()["id"]
print(f"Caso criado: {case_id}")

# 2. Upload de áudio
audio_file = open("interceptacao.mp3", "rb")
audio_content = audio_file.read()
audio_sha256 = hashlib.sha256(audio_content).hexdigest()

response = requests.post(
    f"{API_URL}/cases/{case_id}/evidences/audio",
    files={"file": ("interceptacao.mp3", audio_content, "audio/mpeg")},
    headers={"X-Actor-Id": ACTOR_ID}
)

evidence = response.json()
print(f"Evidência criada: {evidence['id']}")
print(f"SHA256 calculado: {audio_sha256}")
print(f"SHA256 armazenado: {evidence['sha256']}")
assert audio_sha256 == evidence['sha256'], "Hash não corresponde!"

# 3. Aguardar transcrição (processamento assíncrono)
import time
time.sleep(30)

# 4. Buscar evidência com transcrição
response = requests.get(
    f"{API_URL}/evidences/{evidence['id']}",
    headers={"X-Actor-Id": ACTOR_ID}
)

evidence_updated = response.json()
if evidence_updated.get("transcription"):
    print("Transcrição:", evidence_updated["transcription"])
else:
    print("Transcrição ainda em processamento")
```

---

## 🧪 ETAPA 6: Testes e Depuração

### 6.1 Script de Teste Automatizado

Criar arquivo: `/app/aegis/tests/test_integration.py`

```python
import pytest
import requests
import os
from pathlib import Path

API_URL = os.getenv("AEGIS_API_URL", "http://localhost:8002")
ACTOR_ID = "test@example.com"

def test_health():
    """Teste 1: Verificar se API está online"""
    response = requests.get(f"{API_URL}/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_case():
    """Teste 2: Criar caso"""
    response = requests.post(
        f"{API_URL}/cases",
        json={"name": "Teste Automatizado"},
        headers={"X-Actor-Id": ACTOR_ID}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["name"] == "Teste Automatizado"
    return data["id"]

def test_full_workflow():
    """Teste 3: Fluxo completo"""
    # Criar caso
    case_id = test_create_case()
    
    # Criar target
    response = requests.post(
        f"{API_URL}/cases/{case_id}/targets",
        json={"type": "PHONE", "value": "+5511999999999", "label": "Teste"},
        headers={"X-Actor-Id": ACTOR_ID}
    )
    assert response.status_code == 200
    
    # Upload ordem judicial (arquivo mock)
    response = requests.post(
        f"{API_URL}/cases/{case_id}/judicial-orders",
        files={"file": ("ordem.pdf", b"Mock PDF", "application/pdf")},
        data={
            "process_number": "1234567-89.2024.8.26.0100",
            "court": "Teste Court",
            "judge": "Teste Judge",
            "valid_from": "2024-01-01T00:00:00Z",
            "valid_until": "2024-12-31T23:59:59Z"
        },
        headers={"X-Actor-Id": ACTOR_ID}
    )
    assert response.status_code == 200

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

### 6.2 Testes de Performance

```bash
# Instalar Apache Bench
sudo apt install apache2-utils

# Teste de carga - criar casos
ab -n 1000 -c 10 -p case.json -T application/json \
   -H "X-Actor-Id: test@example.com" \
   http://localhost:8002/cases

# case.json:
# {"name": "Teste Performance"}
```

### 6.3 Validação de Cadeia de Custódia

```sql
-- Função para verificar integridade
SELECT * FROM verify_custody_chain('evidence-uuid-aqui');

-- Resultado esperado:
--  event_id  | event_num | is_valid | computed_hash | stored_hash
-- -----------+-----------+----------+---------------+-------------
--  uuid1     |     1     |    t     |  abc123...    | abc123...
--  uuid2     |     2     |    t     |  def456...    | def456...
```

---

## 🚀 ETAPA 7: Implantação em Produção

### 7.1 Checklist Pré-Deployment

- [ ] PostgreSQL 15+ instalado
- [ ] TimescaleDB 2.0+ configurado
- [ ] Banco de dados criado e testado
- [ ] Usuários e permissões configurados
- [ ] Senha forte para usuário aegis
- [ ] SSL/TLS configurado no PostgreSQL
- [ ] Firewall configurado (apenas portas necessárias)
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Testes de integração passando
- [ ] Documentação atualizada
- [ ] Plano de rollback definido

### 7.2 Configuração SSL no PostgreSQL

```bash
# 1. Gerar certificados
cd /etc/postgresql/15/main/
sudo openssl req -new -x509 -days 365 -nodes -text \
     -out server.crt -keyout server.key -subj "/CN=aegis.seudominio.com"

sudo chmod 600 server.key
sudo chown postgres:postgres server.key server.crt

# 2. Configurar postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Adicionar:
```conf
ssl = on
ssl_cert_file = '/etc/postgresql/15/main/server.crt'
ssl_key_file = '/etc/postgresql/15/main/server.key'
```

```bash
# 3. Configurar pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Modificar:
```conf
# TYPE  DATABASE    USER    ADDRESS         METHOD
hostssl aegis       aegis   0.0.0.0/0       scram-sha-256
```

```bash
# 4. Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 7.3 Backup Automático com Cron

```bash
# Criar script de backup
sudo nano /opt/aegis/backup_database.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/aegis/backups"
DATE=$(date +%Y%m%d_%H%M%S)
PGPASSWORD="senha_aegis"

mkdir -p $BACKUP_DIR

# Backup completo
pg_dump -h localhost -U aegis aegis | gzip > $BACKUP_DIR/aegis_full_$DATE.sql.gz

# Backup apenas hypertables (dados temporais)
pg_dump -h localhost -U aegis aegis \
        -t audit_logs -t custody_events \
        | gzip > $BACKUP_DIR/aegis_temporal_$DATE.sql.gz

# Remover backups antigos (>30 dias)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

```bash
# Tornar executável
sudo chmod +x /opt/aegis/backup_database.sh

# Agendar backup diário às 2h
sudo crontab -e
# Adicionar:
0 2 * * * /opt/aegis/backup_database.sh >> /var/log/aegis_backup.log 2>&1
```

### 7.4 Monitoramento com pg_stat_statements

```sql
-- Habilitar extensão
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Ver queries mais lentas
SELECT 
    query,
    calls,
    total_exec_time / 1000 as total_time_sec,
    mean_exec_time / 1000 as avg_time_sec,
    max_exec_time / 1000 as max_time_sec
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Resetar estatísticas
SELECT pg_stat_statements_reset();
```

### 7.5 Manutenção Regular

```sql
-- Executar semanalmente

-- 1. Vacuum completo
VACUUM FULL ANALYZE;

-- 2. Reindexar
REINDEX DATABASE aegis;

-- 3. Ver tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 4. Ver chunks do TimescaleDB
SELECT 
    hypertable_name,
    chunk_name,
    range_start,
    range_end,
    pg_size_pretty(total_bytes) as size
FROM timescaledb_information.chunks
ORDER BY range_start DESC;
```

---

## 📈 Monitoramento em Tempo Real

### Grafana Dashboard

```sql
-- Queries para métricas

-- Total de evidências por hora
SELECT 
    time_bucket('1 hour', ingested_at) as hora,
    count(*) as total,
    sum(size_bytes) / 1024 / 1024 as mb_total
FROM evidences
WHERE ingested_at > NOW() - INTERVAL '24 hours'
GROUP BY hora
ORDER BY hora;

-- Casos ativos
SELECT count(*) FROM cases WHERE status = 'ACTIVE';

-- Taxa de transcrição
SELECT 
    status,
    count(*) as total,
    round(count(*) * 100.0 / sum(count(*)) OVER (), 2) as percentage
FROM evidences
WHERE type = 'AUDIO'
GROUP BY status;
```

---

## ✅ Validação Final

```bash
# 1. Verificar versões
psql --version
psql -c "SELECT version();"
psql -c "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';"

# 2. Testar conexão
psql -h localhost -U aegis -d aegis -c "SELECT 1;"

# 3. Verificar hypertables
psql -U aegis -d aegis -c "SELECT * FROM timescaledb_information.hypertables;"

# 4. Testar API
curl -H "X-Actor-Id: test@example.com" http://localhost:8002/health

# 5. Executar testes
cd /app/aegis/tests
pytest -v
```

**✅ Se todos os testes passarem, seu sistema Aegis/Thanatos está pronto para produção!**
