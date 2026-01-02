#!/bin/bash
set -e

echo "🚀 Iniciando Aegis..."

# Iniciar PostgreSQL+TimescaleDB
echo "📦 Iniciando PostgreSQL + TimescaleDB..."
cd /app/aegis
docker-compose up -d

# Aguardar banco estar pronto
echo "⏳ Aguardando banco de dados..."
sleep 10

# Habilitar TimescaleDB
echo "🔧 Configurando TimescaleDB..."
docker exec aegis-postgres psql -U aegis -d aegis -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

echo "📊 Criando hypertables..."
docker exec aegis-postgres psql -U aegis -d aegis -c "SELECT create_hypertable('audit_logs', 'timestamp', if_not_exists => TRUE);"
docker exec aegis-postgres psql -U aegis -d aegis -c "SELECT create_hypertable('custody_events', 'timestamp', if_not_exists => TRUE);"

echo "✅ Aegis pronto!"
echo "📡 API rodando em: http://localhost:8002"
echo "🗄️  PostgreSQL em: localhost:5433"
