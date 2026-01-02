# 📈 Modelo de Dados - Aegis/Thanatos

## Visão Geral

O banco de dados Aegis utiliza PostgreSQL 15+ com a extensão TimescaleDB para gerenciamento eficiente de dados temporais.

---

## Diagrama Entidade-Relacionamento

```
╭───────────────────╮
│      CASE          │
├───────────────────┤
│ id (PK)           │
│ name              │
│ status            │
│ created_at        │
╰───────┬───────────╯
        │
        │ 1:N
        │
   ┌────┼────┬─────────┬──────────┐
   │    │    │         │          │
   ▼    ▼    ▼         ▼          ▼
╭────────────────╮ ╭────────────╮ ╭──────────────╮ ╭───────────────╮
│JUDICIAL_ORDER   │ │   TARGET   │ │   EVIDENCE   │ │   AUDIT_LOG   │
├────────────────┤ ├────────────┤ ├──────────────┤ ├───────────────┤
│ process_number  │ │ type       │ │ sha256       │ │ actor_id      │
│ valid_from      │ │ value      │ │ storage_uri  │ │ action        │
│ valid_until     │ │ label      │ │ transcription│ │ timestamp     │
╰────────────────╯ ╰────┬───────╯ ╰────┬─────────╯ ╰───────────────╯
                       │         │
                       │ 1:N     │ 1:N
                       │         │
                  ╭────┼─────────┼────╮
                  │                  │
                  ▼                  ▼
          ╭─────────────────────╮
          │   CUSTODY_EVENT      │
          ├─────────────────────┤
          │ prev_event_hash     │
          │ event_hash          │
          │ action              │
          │ timestamp           │
          │ (Blockchain-like)   │
          ╰─────────────────────╯
```

---

## Tabelas Principais

### 1. CASES (Casos de Investigação)

**Descrição:** Armazena casos de investigação/interceptação.

| Coluna      | Tipo         | Descrição                           | Constraints      |
|-------------|--------------|----------------------------------------|------------------|
| id          | UUID         | Identificador único                   | PRIMARY KEY      |
| name        | VARCHAR(200) | Nome do caso                           | NOT NULL         |
| status      | VARCHAR(20)  | Status (ACTIVE, SUSPENDED, CLOSED)     | NOT NULL         |
| created_at  | TIMESTAMPTZ  | Data/hora de criação                  | NOT NULL         |

**Índices:**
- `idx_cases_status` - (status, created_at DESC)

**Relações:**
- 1:N com judicial_orders
- 1:N com targets
- 1:N com evidences

---

### 2. JUDICIAL_ORDERS (Ordens Judiciais)

**Descrição:** Armazena ordens judiciais autorizando interceptações.

| Coluna           | Tipo         | Descrição                      | Constraints      |
|------------------|--------------|-----------------------------------|------------------|
| id               | UUID         | Identificador único              | PRIMARY KEY      |
| case_id          | UUID         | Referência ao caso              | FOREIGN KEY      |
| process_number   | VARCHAR(80)  | Número do processo              | NOT NULL         |
| court            | VARCHAR(120) | Tribunal/Vara                    | NOT NULL         |
| judge            | VARCHAR(120) | Juiz responsável                | NOT NULL         |
| valid_from       | TIMESTAMPTZ  | Início da vigência             | NOT NULL         |
| valid_until      | TIMESTAMPTZ  | Fim da vigência                | NOT NULL         |
| document_sha256  | VARCHAR(64)  | Hash SHA-256 do documento        | NOT NULL         |
| document_uri     | TEXT         | Localização do documento        | NOT NULL         |
| created_at       | TIMESTAMPTZ  | Data/hora de criação           | NOT NULL         |

**Índices:**
- `idx_judicial_orders_case` - (case_id)
- `idx_judicial_orders_dates` - (valid_from, valid_until)

**Constraints:**
- UNIQUE (case_id, process_number)
- CHECK (valid_until > valid_from)

---

### 3. TARGETS (Alvos de Interceptação)

**Descrição:** Define alvos (telefones, IPs, pessoas) associados a casos.

| Coluna      | Tipo         | Descrição                           | Constraints      |
|-------------|--------------|----------------------------------------|------------------|
| id          | UUID         | Identificador único                   | PRIMARY KEY      |
| case_id     | UUID         | Referência ao caso                    | FOREIGN KEY      |
| type        | VARCHAR(20)  | Tipo (PHONE, IP, PERSON, IDENTIFIER)   | NOT NULL         |
| value       | VARCHAR(200) | Valor do alvo (+55119...)              | NOT NULL         |
| label       | VARCHAR(200) | Rótulo descritivo                     | NULL             |
| created_at  | TIMESTAMPTZ  | Data/hora de criação                  | NOT NULL         |

**Índices:**
- `idx_targets_case` - (case_id)
- `idx_targets_value` - (value, type)

**Constraints:**
- UNIQUE (case_id, type, value)

---

### 4. EVIDENCES (Evidências)

**Descrição:** Armazena evidências (principalmente áudios) coletadas.

| Coluna             | Tipo         | Descrição                           | Constraints      |
|--------------------|--------------|----------------------------------------|------------------|
| id                 | UUID         | Identificador único                   | PRIMARY KEY      |
| case_id            | UUID         | Referência ao caso                    | FOREIGN KEY      |
| target_id          | UUID         | Referência ao alvo                    | FOREIGN KEY      |
| judicial_order_id  | UUID         | Referência à ordem judicial          | FOREIGN KEY      |
| type               | VARCHAR(20)  | Tipo (AUDIO, DATA, IMAGE, VIDEO, DOC)  | NOT NULL         |
| status             | VARCHAR(20)  | Status do processamento                | NOT NULL         |
| mime_type          | VARCHAR(120) | Tipo MIME do arquivo                   | NOT NULL         |
| original_filename  | VARCHAR(260) | Nome original do arquivo               | NOT NULL         |
| size_bytes         | INTEGER      | Tamanho em bytes                       | NOT NULL         |
| sha256             | VARCHAR(64)  | Hash SHA-256 do arquivo                | NOT NULL         |
| storage_uri        | TEXT         | Localização do arquivo               | NOT NULL         |
| collected_at       | TIMESTAMPTZ  | Data/hora da coleta                    | NULL             |
| ingested_at        | TIMESTAMPTZ  | Data/hora da ingestão                 | NOT NULL         |
| transcription      | TEXT         | Transcrição do áudio (se AUDIO)      | NULL             |

**Índices:**
- `idx_evidences_case` - (case_id, ingested_at DESC)
- `idx_evidences_sha256` - (sha256)
- `idx_evidences_status` - (status)

**Status Possíveis:**
- `RECEIVED` - Recebido, aguardando processamento
- `PROCESSING` - Em processamento (transcrição)
- `PROCESSED` - Processado com sucesso
- `FAILED` - Falha no processamento

---

### 5. CUSTODY_EVENTS (Cadeia de Custódia)

**Descrição:** Registro blockchain-like de todos eventos relacionados a uma evidência.

| Coluna           | Tipo         | Descrição                           | Constraints      |
|------------------|--------------|----------------------------------------|------------------|
| id               | UUID         | Identificador único                   | PRIMARY KEY      |
| evidence_id      | UUID         | Referência à evidência              | FOREIGN KEY      |
| actor_id         | VARCHAR(120) | Quem executou a ação                | NOT NULL         |
| action           | VARCHAR(30)  | Tipo de ação                         | NOT NULL         |
| timestamp        | TIMESTAMPTZ  | Data/hora do evento                    | NOT NULL         |
| prev_event_hash  | VARCHAR(64)  | Hash do evento anterior (blockchain)  | NULL (1º evento)|
| event_hash       | VARCHAR(64)  | Hash deste evento                      | NOT NULL         |
| metadata         | JSONB        | Dados adicionais                       | NOT NULL         |

**Índices:**
- `idx_custody_events_evidence` - (evidence_id, timestamp DESC)
- `idx_custody_events_actor` - (actor_id, timestamp DESC)

**Ações Possíveis:**
- `INGESTED` - Evidência ingerida
- `HASH_VERIFIED` - Hash verificado
- `ACCESSED` - Evidência acessada
- `EXPORTED` - Evidência exportada
- `TRANSCRIBED` - Áudio transcrito
- `REDACTED` - Conteúdo redatado

**Cálculo do Hash:**
```
event_hash = SHA256(
    evidence_id +
    actor_id +
    action +
    timestamp +
    prev_event_hash +
    metadata
)
```

---

### 6. AUDIT_LOGS (Auditoria)

**Descrição:** Registro completo de auditoria de todas ações no sistema.

| Coluna       | Tipo         | Descrição                           | Constraints      |
|--------------|--------------|----------------------------------------|------------------|
| id           | UUID         | Identificador único                   | PRIMARY KEY      |
| actor_id     | VARCHAR(120) | Quem executou                          | NOT NULL         |
| action       | VARCHAR(120) | Ação executada                         | NOT NULL         |
| entity_type  | VARCHAR(120) | Tipo de entidade afetada               | NOT NULL         |
| entity_id    | VARCHAR(120) | ID da entidade                         | NOT NULL         |
| timestamp    | TIMESTAMPTZ  | Data/hora                              | NOT NULL         |
| ip           | VARCHAR(64)  | Endereço IP                            | NULL             |
| user_agent   | VARCHAR(240) | User-Agent do navegador                | NULL             |
| details      | JSONB        | Detalhes adicionais                    | NOT NULL         |

**Índices:**
- `idx_audit_logs_actor` - (actor_id, timestamp DESC)
- `idx_audit_logs_entity` - (entity_type, entity_id, timestamp DESC)
- `idx_audit_logs_action` - (action, timestamp DESC)

**Hypertable:** SIM (TimescaleDB)

---

## TimescaleDB - Hypertables

As seguintes tabelas são hypertables:

1. **audit_logs** - Particionada por `timestamp`
2. **custody_events** - Particionada por `timestamp`

**Benefícios:**
- Inserção rápida de dados temporais
- Consultas eficientes por período
- Compressão automática de dados antigos
- Retenção automática configurada

---

## Funções Personalizadas

### verify_custody_chain(evidence_id)

Verifica integridade da cadeia de custódia de uma evidência.

```sql
SELECT * FROM verify_custody_chain('evidence-uuid-aqui');
```

Retorna:
- `event_id` - ID do evento
- `event_num` - Número sequencial
- `is_valid` - Se o hash é válido
- `computed_hash` - Hash calculado
- `stored_hash` - Hash armazenado

### get_case_stats(case_id)

Obtém estatísticas de um caso.

```sql
SELECT * FROM get_case_stats('case-uuid-aqui');
```

Retorna:
- `total_evidences` - Total de evidências
- `total_size_mb` - Tamanho total em MB
- `total_targets` - Total de alvos
- `total_orders` - Total de ordens judiciais
- `total_audio` - Total de áudios
- `transcribed` - Total transcrito
- `processing` - Total em processamento

---

## Views

### active_judicial_orders

Ordens judiciais vigentes.

```sql
SELECT * FROM active_judicial_orders;
```

### pending_transcriptions

Evidências de áudio aguardando transcrição.

```sql
SELECT * FROM pending_transcriptions;
```

### case_summary

Resumo de todos os casos.

```sql
SELECT * FROM case_summary;
```

---

## Políticas de Compressão e Retenção

### Compressão (TimescaleDB)

- **audit_logs**: Comprimido após 7 dias
- **custody_events**: Comprimido após 7 dias

### Retenção

- **audit_logs**: 3 anos (configurável)
- **custody_events**: 10 anos (recomendado para forense)

---

## Segurança

### Permissões

- **aegis** (owner): Full access
- **aegis_readonly** (opcional): SELECT only

### Auditoria

TODAS as ações são registradas em `audit_logs`.

### Integridade

Cadeia de custódia com hash blockchain-like garante detecção de adulterações.
