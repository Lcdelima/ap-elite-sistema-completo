-- ================================================
-- Script de Criação do Banco de Dados Aegis
-- Execute como usuário postgres
-- ================================================

-- 1. Criar usuário aegis
CREATE USER aegis WITH PASSWORD 'TROCAR_SENHA_AQUI_SENHA_FORTE';

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
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO aegis;

-- 8. Configurar permissões futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aegis;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aegis;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO aegis;

-- 9. Habilitar pg_stat_statements (monitoramento)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Sucesso!
SELECT '✅ Banco de dados Aegis criado com sucesso!' AS status;
SELECT '✅ TimescaleDB habilitado: ' || extversion AS timescale_version
FROM pg_extension WHERE extname = 'timescaledb';
