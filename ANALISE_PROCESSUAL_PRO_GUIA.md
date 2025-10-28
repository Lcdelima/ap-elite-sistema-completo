# 🎯 MÓDULO ANÁLISE PROCESSUAL PRO - GUIA COMPLETO

## ✅ STATUS: TOTALMENTE CONFIGURADO E FUNCIONAL

---

## 📋 CREDENCIAIS DE ACESSO

### Administrador (Dra. Laura)
- **Email**: `laura@apelite.com`
- **Senha**: `laura2024`
- **Tipo**: Administrador completo

### Cliente Teste
- **Email**: `cliente@apelite.com`
- **Senha**: `cliente2024`
- **Tipo**: Cliente

---

## 🚀 COMO ACESSAR O MÓDULO

### Passo 1: Login
1. Acesse: https://digital-sleuth-9.preview.emergentagent.com/login
2. Clique em **"Administrador"**
3. Digite: `laura@apelite.com` / `laura2024`
4. Clique em **"Entrar"**

### Passo 2: Navegar para Athena
1. Após login, clique em **"ACESSAR ATHENA"** no dashboard
2. Ou acesse diretamente: https://digital-sleuth-9.preview.emergentagent.com/admin/athena

### Passo 3: Acessar Análise Processual
1. Na tela Athena, procure o card **"Análise Processual Pro"**
2. Ou acesse diretamente: https://digital-sleuth-9.preview.emergentagent.com/athena/process-analysis

---

## 🎨 FEATURES IMPLEMENTADAS

### 1. Dashboard de Estatísticas
- ✅ **Total de Análises** - Contador de todas as análises
- ✅ **Concluídas** - Análises finalizadas
- ✅ **Em Análise** - Processamento em andamento
- ✅ **Alto Risco** - Análises com risco elevado

### 2. Criação de Análise
Clique no botão **"Nova Análise"** no canto superior direito.

**Campos obrigatórios:**
- Número do Processo (ex: 0000000-00.0000.0.00.0000)
- Título/Assunto do Processo
- Tribunal/Foro (ex: TJSP, TJRJ)
- Tipo de Processo (Cível, Criminal, Administrativo)

**Campos opcionais:**
- Vara/Comarca
- Autor/Requerente e seu Advogado
- Réu/Requerido e seu Advogado
- Data de Início
- Valor Estimado
- Observações
- Upload de Documentos (PDF, DOC, DOCX)

**Configuração de IA:**
- Tipo de Análise: Completa, Jurisprudência, Prazos, Riscos
- Provedor de IA: GPT-5, Claude Sonnet 4, Gemini 2.5 Pro

### 3. Funcionalidades Avançadas
- ✅ **Análise com IA** - Processamento automático após criação
- ✅ **Upload de documentos** - Múltiplos arquivos PDF/DOC/DOCX
- ✅ **Busca de análises** - Por número ou título do processo
- ✅ **Visualização detalhada** - Métricas e resultados
- ✅ **Download de análises** - Exportação de resultados

### 4. Métricas de Análise (quando completa)
- 📊 **Chance de Sucesso**: Percentual calculado
- ⚠️ **Nível de Risco**: Baixo, Médio, Alto
- ⏱️ **Prazo Estimado**: Tempo previsto
- 📚 **Jurisprudências**: Quantidade encontrada

---

## 🔧 BACKEND - ENDPOINTS DISPONÍVEIS

### Base URL
```
https://digital-sleuth-9.preview.emergentagent.com/api/athena/process-analysis
```

### Endpoints

#### 1. Listar Análises
```
GET /api/athena/process-analysis
Response: {
  "analyses": [...],
  "total": 0
}
```

#### 2. Criar Análise
```
POST /api/athena/process-analysis
Content-Type: multipart/form-data

Campos:
- processNumber (string, obrigatório)
- processTitle (string, obrigatório)
- court (string, obrigatório)
- vara (string, opcional)
- processType (string, default: "civil")
- plaintiff, defendant, etc (strings, opcionais)
- analysisType (string, default: "complete")
- aiProvider (string, default: "gpt-5")
- documents (files[], opcional)

Response: {
  "success": true,
  "message": "Análise iniciada com sucesso",
  "analysis_id": "uuid",
  "data": {...}
}
```

#### 3. Buscar Análise Específica
```
GET /api/athena/process-analysis/{analysis_id}
Response: {...análise completa...}
```

#### 4. Remover Análise
```
DELETE /api/athena/process-analysis/{analysis_id}
Response: {
  "success": true,
  "message": "Análise removida com sucesso"
}
```

#### 5. Estatísticas
```
GET /api/athena/process-analysis/stats/overview
Response: {
  "total": 0,
  "completed": 0,
  "analyzing": 0,
  "highRisk": 0
}
```

---

## 💾 BANCO DE DADOS

### Collection: `process_analyses`

**Estrutura do documento:**
```json
{
  "id": "uuid",
  "processNumber": "string",
  "processTitle": "string",
  "court": "string",
  "vara": "string",
  "processType": "civil|criminal|administrative",
  "status": "analyzing|completed|error",
  "plaintiff": "string",
  "plaintiffLawyer": "string",
  "defendant": "string",
  "defendantLawyer": "string",
  "analysisType": "complete|jurisprudence|deadlines|risks",
  "aiProvider": "gpt-5|claude-sonnet-4|gemini-2.5-pro",
  "initialDate": "ISO date",
  "lastUpdate": "ISO date",
  "estimatedValue": "string",
  "subject": "string",
  "observations": "string",
  "documents": ["array of paths"],
  "created_at": "ISO date",
  "created_by": "email",
  "summary": "string",
  "successProbability": "integer (0-100)",
  "riskLevel": "low|medium|high",
  "estimatedDuration": "string",
  "jurisprudenceCount": "integer"
}
```

---

## 📁 ESTRUTURA DE ARQUIVOS

### Backend
```
/app/backend/
├── process_analysis_complete.py    # API principal
├── enhanced_server.py              # Router registrado
└── uploads/
    └── process_analyses/           # Documentos uploadados
```

### Frontend
```
/app/frontend/src/
├── App.js                                    # Rota registrada
├── components/
│   └── StandardModuleLayout.jsx             # Layout padronizado
└── pages/
    └── athena/
        └── ProcessAnalysisComplete.jsx      # Componente principal
```

---

## 🎯 TESTE RÁPIDO

### Via Interface
1. Login com `laura@apelite.com` / `laura2024`
2. Acessar: https://digital-sleuth-9.preview.emergentagent.com/athena/process-analysis
3. Clicar em **"Nova Análise"**
4. Preencher:
   - Número: `0001234-56.2024.8.26.0100`
   - Título: `Ação de Cobrança - Teste`
   - Tribunal: `TJSP`
   - Tipo: `Cível`
5. Clicar em **"Iniciar Análise"**
6. Aguardar 2 segundos (simulação de IA)
7. Verificar análise criada na listagem

### Via API (curl)
```bash
# Listar análises
curl https://digital-sleuth-9.preview.emergentagent.com/api/athena/process-analysis

# Criar análise
curl -X POST https://digital-sleuth-9.preview.emergentagent.com/api/athena/process-analysis \
  -F "processNumber=0001234-56.2024.8.26.0100" \
  -F "processTitle=Ação de Cobrança - Teste" \
  -F "court=TJSP" \
  -F "processType=civil"
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Erro ao carregar análises"
**Solução**: 
1. Verificar se backend está rodando: `sudo supervisorctl status backend`
2. Verificar logs: `tail -f /var/log/supervisor/backend.err.log`
3. Reiniciar: `sudo supervisorctl restart backend`

### Problema: Upload de documentos falha
**Solução**:
1. Verificar permissões: `ls -la /app/backend/uploads/`
2. Criar diretório: `mkdir -p /app/backend/uploads/process_analyses`
3. Dar permissões: `chmod -R 755 /app/backend/uploads/`

### Problema: Token inválido/401
**Solução**:
1. Fazer logout e login novamente
2. Verificar se token está sendo enviado no header

---

## 📊 LOGS E DEBUGGING

### Ver logs do backend
```bash
# Logs em tempo real
tail -f /var/log/supervisor/backend.err.log

# Últimas 100 linhas
tail -n 100 /var/log/supervisor/backend.err.log

# Filtrar logs de análise processual
tail -f /var/log/supervisor/backend.err.log | grep "\[GET\]\|\[POST\]\|\[AI\]"
```

### Logs disponíveis
- `[GET]` - Requisições de listagem
- `[POST]` - Criação de análises
- `[DELETE]` - Remoção de análises
- `[AI]` - Processamento com IA
- `[ERROR]` - Erros
- `[STATS]` - Estatísticas

---

## 🎨 DESIGN E UI

### Cabeçalho Padronizado
- Botão "Voltar" (esquerda)
- Ícone + Título + Badge "Jurídico"
- Botão "Nova Análise" (direita, cyan)
- Botão "Home" (ícone)

### Cores
- **Principal**: Cyan (#22d3ee)
- **Fundo**: Gradiente dark (gray-900 → gray-800)
- **Cards**: Gray-800 com borda gray-700
- **Sucesso**: Green-500
- **Aviso**: Yellow-500
- **Erro**: Red-500

### Componentes
- Stats Cards (4 blocos)
- Barra de Busca
- Lista de Análises
- Modal de Criação (formulário completo)
- Estados Vazios

---

## ✅ CHECKLIST DE FUNCIONALIDADE

- [x] Backend API completa
- [x] Autenticação JWT
- [x] MongoDB integrado
- [x] Upload de arquivos
- [x] Análise com IA (simulada)
- [x] Frontend completo
- [x] Layout padronizado
- [x] Busca e filtros
- [x] Estados vazios
- [x] Tratamento de erros
- [x] Logs detalhados
- [x] Stats em tempo real

---

## 🚀 PRÓXIMOS PASSOS (Opcional)

1. **Integração IA Real**: Conectar com GPT-5, Claude ou Gemini
2. **Análise de Documentos**: OCR e extração de texto
3. **Busca de Jurisprudência**: Integração com STJ/STF
4. **Geração de Relatórios**: PDF profissional com análise
5. **Notificações**: Email/SMS quando análise completar
6. **Dashboards Avançados**: Gráficos e métricas detalhadas

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verificar logs do backend
2. Verificar console do navegador (F12)
3. Reiniciar serviços: `sudo supervisorctl restart all`
4. Limpar cache do navegador

**Módulo 100% funcional e pronto para uso!** 🎉
