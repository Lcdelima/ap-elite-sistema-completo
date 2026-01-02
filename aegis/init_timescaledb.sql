-- ================================================
-- Aegis - Script de Inicialização TimescaleDB
-- ================================================

-- 1. Criar extensão TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 2. Criar hypertables (executar DEPOIS que SQLAlchemy criar as tabelas)
-- As tabelas precisam existir antes de convertê-las em hypertables

-- Audit Logs - hypertable
SELECT create_hypertable('audit_logs', 'timestamp', if_not_exists => TRUE);

-- Custody Events - hypertable
SELECT create_hypertable('custody_events', 'timestamp', if_not_exists => TRUE);

-- 3. Criar índices otimizados

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_ts 
    ON audit_logs (actor_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_ts 
    ON audit_logs (entity_type, entity_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
    ON audit_logs (action, timestamp DESC);

-- Custody Events
CREATE INDEX IF NOT EXISTS idx_custody_events_evidence_ts 
    ON custody_events (evidence_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_custody_events_actor 
    ON custody_events (actor_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_custody_events_action 
    ON custody_events (action, timestamp DESC);

-- Cases
CREATE INDEX IF NOT EXISTS idx_cases_status 
    ON cases (status, created_at DESC);

-- Evidences
CREATE INDEX IF NOT EXISTS idx_evidences_case 
    ON evidences (case_id, ingested_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidences_status 
    ON evidences (status, ingested_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidences_sha256 
    ON evidences (sha256);

-- Judicial Orders
CREATE INDEX IF NOT EXISTS idx_judicial_orders_case 
    ON judicial_orders (case_id, valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_judicial_orders_valid 
    ON judicial_orders (valid_from, valid_until);

-- Targets
CREATE INDEX IF NOT EXISTS idx_targets_case 
    ON targets (case_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_targets_value 
    ON targets (value, type);

-- 4. Políticas de compressão (opcional - economiza espaço)

-- Comprimir audit_logs depois de 7 dias
ALTER TABLE audit_logs SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'actor_id'
);

SELECT add_compression_policy('audit_logs', INTERVAL '7 days');

-- Comprimir custody_events depois de 7 dias
ALTER TABLE custody_events SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'evidence_id'
);

SELECT add_compression_policy('custody_events', INTERVAL '7 days');

-- 5. Políticas de retenção (opcional - ajustar conforme necessidade legal)

-- Reter audit_logs por 3 anos (ajustar conforme legislação)
-- SELECT add_retention_policy('audit_logs', INTERVAL '3 years');

-- Reter custody_events por 10 anos (recomendado para cadeia de custódia)
-- SELECT add_retention_policy('custody_events', INTERVAL '10 years');

-- 6. Continuous Aggregates (opcional - para dashboards)

-- View materializada: contagem de evidências por dia
CREATE MATERIALIZED VIEW IF NOT EXISTS evidence_daily_stats
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', ingested_at) AS bucket,
    case_id,
    type,
    status,
    COUNT(*) as count,
    SUM(size_bytes) as total_bytes
FROM evidences
GROUP BY bucket, case_id, type, status
WITH NO DATA;

-- Política de refresh automático
SELECT add_continuous_aggregate_policy('evidence_daily_stats',
  start_offset => INTERVAL '3 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');

-- View materializada: atividade de auditoria por hora
CREATE MATERIALIZED VIEW IF NOT EXISTS audit_hourly_stats
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', timestamp) AS bucket,
    actor_id,
    action,
    entity_type,
    COUNT(*) as count
FROM audit_logs
GROUP BY bucket, actor_id, action, entity_type
WITH NO DATA;

SELECT add_continuous_aggregate_policy('audit_hourly_stats',
  start_offset => INTERVAL '1 day',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');

-- 7. Funções auxiliares

-- Função para verificar integridade da cadeia de custódia
CREATE OR REPLACE FUNCTION verify_custody_chain(p_evidence_id UUID)
RETURNS TABLE (
    event_id UUID,
    event_num INT,
    is_valid BOOLEAN,
    computed_hash VARCHAR(64),
    stored_hash VARCHAR(64)
) AS $$
DECLARE
    r RECORD;
    prev_hash VARCHAR(64);
    event_count INT := 0;
BEGIN
    FOR r IN 
        SELECT * FROM custody_events 
        WHERE evidence_id = p_evidence_id 
        ORDER BY timestamp ASC
    LOOP
        event_count := event_count + 1;
        
        -- Verificar se prev_event_hash está correto
        IF event_count = 1 THEN
            -- Primeiro evento deve ter prev_event_hash NULL
            RETURN QUERY SELECT 
                r.id,
                event_count,
                r.prev_event_hash IS NULL,
                r.event_hash,
                r.event_hash;
        ELSE
            -- Eventos subsequentes devem referenciar o anterior
            RETURN QUERY SELECT 
                r.id,
                event_count,
                r.prev_event_hash = prev_hash,
                r.event_hash,
                r.event_hash;
        END IF;
        
        prev_hash := r.event_hash;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de um caso
CREATE OR REPLACE FUNCTION get_case_stats(p_case_id UUID)
RETURNS TABLE (
    total_evidences BIGINT,
    total_size_mb NUMERIC,
    total_targets BIGINT,
    total_orders BIGINT,
    total_audio BIGINT,
    transcribed BIGINT,
    processing BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT e.id)::BIGINT as total_evidences,
        ROUND((SUM(e.size_bytes) / 1024.0 / 1024.0)::NUMERIC, 2) as total_size_mb,
        COUNT(DISTINCT t.id)::BIGINT as total_targets,
        COUNT(DISTINCT jo.id)::BIGINT as total_orders,
        COUNT(DISTINCT CASE WHEN e.type = 'AUDIO' THEN e.id END)::BIGINT as total_audio,
        COUNT(DISTINCT CASE WHEN e.transcription IS NOT NULL THEN e.id END)::BIGINT as transcribed,
        COUNT(DISTINCT CASE WHEN e.status = 'PROCESSING' THEN e.id END)::BIGINT as processing
    FROM cases c
    LEFT JOIN evidences e ON e.case_id = c.id
    LEFT JOIN targets t ON t.case_id = c.id
    LEFT JOIN judicial_orders jo ON jo.case_id = c.id
    WHERE c.id = p_case_id
    GROUP BY c.id;
END;
$$ LANGUAGE plpgsql;

-- 8. Triggers para validação

-- Trigger para validar datas de ordem judicial
CREATE OR REPLACE FUNCTION validate_judicial_order_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.valid_until <= NEW.valid_from THEN
        RAISE EXCEPTION 'valid_until deve ser maior que valid_from';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_judicial_order_dates
    BEFORE INSERT OR UPDATE ON judicial_orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_judicial_order_dates();

-- 9. Views úteis

-- View: Ordens judiciais vigentes
CREATE OR REPLACE VIEW active_judicial_orders AS
SELECT 
    jo.*,
    c.name as case_name,
    c.status as case_status
FROM judicial_orders jo
JOIN cases c ON c.id = jo.case_id
WHERE 
    CURRENT_TIMESTAMP BETWEEN jo.valid_from AND jo.valid_until
    AND c.status = 'ACTIVE';

-- View: Evidências pendentes de transcrição
CREATE OR REPLACE VIEW pending_transcriptions AS
SELECT 
    e.*,
    c.name as case_name
FROM evidences e
JOIN cases c ON c.id = e.case_id
WHERE 
    e.type = 'AUDIO'
    AND e.transcription IS NULL
    AND e.status IN ('RECEIVED', 'PROCESSING')
ORDER BY e.ingested_at ASC;

-- View: Resumo de casos
CREATE OR REPLACE VIEW case_summary AS
SELECT 
    c.id,
    c.name,
    c.status,
    c.created_at,
    COUNT(DISTINCT e.id) as total_evidences,
    COUNT(DISTINCT t.id) as total_targets,
    COUNT(DISTINCT jo.id) as total_orders,
    COALESCE(SUM(e.size_bytes), 0) as total_bytes
FROM cases c
LEFT JOIN evidences e ON e.case_id = c.id
LEFT JOIN targets t ON t.case_id = c.id
LEFT JOIN judicial_orders jo ON jo.case_id = c.id
GROUP BY c.id, c.name, c.status, c.created_at;

-- 10. Permissões (ajustar conforme necessidade)

-- Usuário read-only para dashboards/relatórios
-- CREATE USER aegis_readonly WITH PASSWORD 'senha_segura';
-- GRANT CONNECT ON DATABASE aegis TO aegis_readonly;
-- GRANT USAGE ON SCHEMA public TO aegis_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO aegis_readonly;
-- GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO aegis_readonly;

-- 11. Finalização

SELECT 'TimescaleDB inicializado com sucesso!' as status;
