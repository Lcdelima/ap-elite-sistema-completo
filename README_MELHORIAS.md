# 🛡️ AP Elite ATHENA - CISAI-Forense 3.0

Sistema ERP Completo para Perícia Digital, Investigação Criminal e Advocacia

## 📋 Sobre o Sistema

Sistema completo com **19 módulos especializados** para:
- Perícia Digital e Forense
- Análise Processual com IA
- Interceptações Telefônicas e Telemáticas
- Gestão de Processos Jurídicos
- Inteligência OSINT
- Cadeia de Custódia Forense

## 🚀 Instalação

### Requisitos
- Python 3.11+
- Node.js 18+
- MongoDB 5.0+
- Yarn 1.22.22

### Backend (FastAPI + MongoDB)

1. **Criar ambiente virtual:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. **Instalar dependências:**
```bash
pip install -r requirements.txt
```

3. **Configurar variáveis de ambiente:**
Crie `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=apelite_db
CORS_ORIGINS=http://localhost:3000,https://seu-dominio.com
```

4. **Iniciar servidor:**
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

5. **Migrar senhas para hash (IMPORTANTE!):**
```bash
python3 migrate_passwords.py
```

### Frontend (React 19 + CRACO)

1. **Instalar dependências:**
```bash
cd frontend
yarn install
```

2. **Configurar ambiente:**
Crie `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

3. **Iniciar desenvolvimento:**
```bash
yarn start
```

4. **Build para produção:**
```bash
yarn build
```

## 🔒 Segurança Implementada

### ✅ Hashing de Senhas
- **Algoritmo**: bcrypt com salt automático
- **Biblioteca**: passlib com CryptContext
- **Migração**: Script `migrate_passwords.py` para migrar senhas antigas
- **Validação**: Força de senha (8+ caracteres, maiúscula, minúscula, número)

### ✅ Tokens Seguros
- Geração com `secrets.token_urlsafe(32)` + UUID
- Armazenamento em MongoDB vinculado ao usuário
- Suporte a múltiplos formatos (`token` e `ap_elite_token`)

### ✅ RBAC (Role-Based Access Control)
Papéis implementados:
- `super_admin` - Todas as permissões
- `administrator` - Gestão completa
- `perito` - Acesso a perícia e evidências
- `advogado` - Processos e documentos
- `cliente` - Leitura apenas
- `auditor` - Auditoria e compliance

### ✅ Compliance
- ISO 27037 (Preservação de evidências digitais)
- ISO 27042 (Análise de evidências)
- NIST 800-86 (Integração de forens investigações)
- LGPD (Lei Geral de Proteção de Dados)
- CPP (Código de Processo Penal - Arts. 158-184)

## 📦 Módulos Implementados (19)

### Perícia & Investigação (16)
1. **Perícia Digital** (`/api/forensics/digital`)
2. **Perícia Digital Avançada** (`/api/forensics/advanced`)
3. **Interceptações Telefônicas** (`/api/telephony`)
4. **Interceptações Telemáticas** (`/api/telematics`)
5. **Extração de Dados** (`/api/extraction`)
6. **Extração IA** (`/api/extraction/advanced`)
7. **Análise de ERBs** (`/api/erbs`)
8. **ERBs Radiobase** (`/api/erbs/radiobase`)
9. **ERBs Avançadas** (`/api/erbs/advanced`)
10. **ERBs Geoespacial** (`/api/geo/erbs`)
11. **IPED Integration** (`/api/iped`)
12. **Processamento de Evidências** (`/api/evidence`)
13. **Cadeia de Custódia** (`/api/custody`)
14. **Processamento Avançado** (`/api/processing/advanced`)
15. **Evidências Avançadas** (`/api/processing/evidence-advanced`)
16. **Análise IA** (`/api/evidence-ai`)

### Módulos Jurídicos (3)
17. **Análise Processual Profissional** (`/api/processo`)
    - IA jurídico-forense (resumo, prescrição, nulidades, dosimetria)
    - Correlação probatória
    - Relatórios PAdES + JSON
18. **Forensics Enhanced** (`/api/forensics/enhanced`)
    - ML/IA analysis
    - Automated reports
19. **Gestão de Processos** (`/api/athena/processes`)
    - CRUD completo
    - Andamentos
    - Prazos

## 🔧 Melhorias Implementadas

### ✅ Resiliência na Configuração
- Validação de variáveis de ambiente com mensagens claras
- Valores padrão para `MONGO_URL` e `DB_NAME`
- Logs informativos durante inicialização
- Tratamento de erro ao conectar MongoDB

### ✅ Segurança de Credenciais
- **Hashing de senhas** com bcrypt
- Validação de força de senha
- Script de migração de senhas antigas
- Tokens seguros com secrets module

### ✅ Observabilidade e Logs
- Logs estruturados com timestamp, arquivo e linha
- Níveis adequados (INFO, WARNING, ERROR)
- Rastreamento de login/logout
- Logs de carregamento de módulos

### ✅ Compatibilidade de Token
- Login salva `token` E `ap_elite_token`
- Suporte a módulos antigos e novos
- Zero breaking changes

## 📊 Verificação de Saúde

### Backend
```bash
curl http://localhost:8001/api/pericia/health
```

Retorna status de todos os 19 módulos.

### Testar Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"laura@apelite.com","password":"laura2024","role":"administrator"}'
```

## 👥 Usuários Padrão

| Email | Senha | Papel |
|-------|-------|-------|
| laura@apelite.com | laura2024 | administrator |
| carlos@apelite.com | carlos2024 | administrator |
| cliente@teste.com | cliente123 | client |

**Nota**: As senhas estão em hash bcrypt no banco.

## 🐛 Troubleshooting

### Erro: "Erro ao carregar..."
**Solução**: Verificar se o módulo backend está carregado e se o token está correto.

### MongoDB não conecta
**Solução**: Verificar se MongoDB está rodando e se `MONGO_URL` está correta no `.env`.

### Módulo não carrega
**Solução**: Verificar logs em `/var/log/supervisor/backend.err.log`.

## 📝 Desenvolvimento

### Adicionar Novo Módulo

1. Criar arquivo em `backend/modules/novo_modulo.py`
2. Importar e incluir no `server.py`:
```python
try:
    from modules.novo_modulo import router as novo_router
    app.include_router(novo_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ novo_modulo error: {e}")
```

3. Criar componente React em `frontend/src/pages/athena/NovoModulo.jsx`
4. Adicionar rota no `App.js`
5. Adicionar no menu `AthenaMainReorganized.jsx`

## 🎯 Próximos Passos

- [ ] Implementar MFA (Multi-Factor Authentication)
- [ ] Adicionar testes automatizados
- [ ] Docker Compose para deploy simplificado
- [ ] CI/CD pipeline
- [ ] Documentação OpenAPI completa
- [ ] Integração com sistemas externos (PJe, eproc, Projudi)

## 📄 Licença

Uso interno - AP Elite

## 🆘 Suporte

Para suporte técnico, contate: suporte@apelite.com
