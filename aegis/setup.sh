#!/bin/bash

# ================================================
# Aegis - Script de Setup Automatizado
# ================================================

set -e

echo "🚀 Aegis Setup - Sistema de Interceptação Legal"
echo "================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções auxiliares
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Verificar requisitos
echo "1️⃣  Verificando requisitos..."

if ! command -v docker &> /dev/null; then
    error "Docker não encontrado. Instale: https://docs.docker.com/get-docker/"
    exit 1
fi
info "Docker OK"

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não encontrado. Instale: https://docs.docker.com/compose/install/"
    exit 1
fi
info "Docker Compose OK"

if ! command -v python3 &> /dev/null; then
    error "Python 3 não encontrado. Instale Python 3.11+"
    exit 1
fi
info "Python OK"

echo ""

# 2. Criar estrutura de diretórios
echo "2️⃣  Criando estrutura de diretórios..."

mkdir -p /app/aegis/data/evidences
mkdir -p /app/aegis/data/backups
chmod -R 777 /app/aegis/data

info "Diretórios criados"
echo ""

# 3. Configurar .env
echo "3️⃣  Configurando variáveis de ambiente..."

if [ ! -f /app/aegis/.env ]; then
    cat > /app/aegis/.env << 'EOF'
DATABASE_URL=postgresql+psycopg2://aegis:aegis@localhost:5433/aegis
STORAGE_BACKEND=local
STORAGE_LOCAL_DIR=/app/aegis/data/evidences
EMERGENT_LLM_KEY=sk-emergent-aD33e9977E0D345EfD
PORT=8002
EOF
    info "Arquivo .env criado"
else
    warn "Arquivo .env já existe - pulando"
fi
echo ""

# 4. Iniciar PostgreSQL + TimescaleDB
echo "4️⃣  Iniciando PostgreSQL + TimescaleDB..."

cd /app/aegis
docker-compose down 2>/dev/null || true
docker-compose up -d

info "Aguardando banco de dados iniciar..."
sleep 15

# Verificar se o banco está pronto
for i in {1..30}; do
    if docker exec aegis-postgres pg_isready -U aegis &>/dev/null; then
        info "PostgreSQL pronto!"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Timeout esperando PostgreSQL"
        exit 1
    fi
    sleep 2
done

echo ""

# 5. Instalar dependências Python
echo "5️⃣  Instalando dependências Python..."

pip install -q -r /app/aegis/requirements.txt
info "Dependências instaladas"
echo ""

# 6. Inicializar banco de dados
echo "6️⃣  Inicializando banco de dados..."

# Criar tabelas (SQLAlchemy)
cd /app/aegis
python << 'PYEOF'
from app.db import engine
from app.models import Base

print("⏳ Criando tabelas...")
Base.metadata.create_all(bind=engine)
print("✅ Tabelas criadas!")
PYEOF

info "Tabelas criadas"

# Configurar TimescaleDB
info "Configurando TimescaleDB..."
docker exec aegis-postgres psql -U aegis -d aegis -f /tmp/init_timescaledb.sql 2>/dev/null || {
    # Se falhar, copiar SQL e executar
    docker cp /app/aegis/init_timescaledb.sql aegis-postgres:/tmp/
    docker exec aegis-postgres psql -U aegis -d aegis -f /tmp/init_timescaledb.sql
}

info "TimescaleDB configurado"
echo ""

# 7. Testar conexão
echo "7️⃣  Testando conexão..."

python << 'PYEOF'
from sqlalchemy import text
from app.db import engine

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ Conexão com banco OK!")
except Exception as e:
    print(f"❌ Erro na conexão: {e}")
    exit(1)
PYEOF

echo ""

# 8. Resumo
echo "================================================"
echo "🎉 Setup concluído com sucesso!"
echo "================================================"
echo ""
echo "📚 Próximos passos:"
echo ""
echo "1. Iniciar a API:"
echo "   cd /app/aegis"
echo "   python -m app.main"
echo ""
echo "2. Ou usar Uvicorn:"
echo "   uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload"
echo ""
echo "3. Acessar documentação:"
echo "   http://localhost:8002/docs"
echo ""
echo "4. Testar API:"
echo "   curl -H 'X-Actor-Id: test@example.com' http://localhost:8002/health"
echo ""
echo "🗄️  Informações do serviço:"
echo "   - API: http://localhost:8002"
echo "   - PostgreSQL: localhost:5433"
echo "   - Storage: /app/aegis/data/evidences"
echo "   - Logs: docker logs aegis-postgres"
echo ""
echo "📚 Documentação completa: /app/aegis/README.md"
echo ""
