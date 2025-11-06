# 🧪 ELITE ATHENA - PLANO DE TESTES PRÁTICO
## Validação do Sistema Existente

**Objetivo**: Testar funcionalidades REAIS sem criar mais código

---

## ✅ TESTES PRIORITÁRIOS (Esta Semana)

### **DIA 1 - Evidence Vault** 📁

**Teste Manual**:
1. Acesse: `/athena/evidence-vault`
2. Faça upload de um arquivo PDF (qualquer)
3. Verifique se retorna hash SHA-256
4. Tente fazer upload do mesmo arquivo novamente
5. Verifique se detecta duplicação

**Teste Automático** (usar o script que você enviou):
```bash
cd /app/backend
pytest tests/test_evidence_vault.py -v
```

**Critério de Sucesso**:
- ✅ Upload funciona
- ✅ Hash é gerado
- ✅ Duplicação é detectada

---

### **DIA 2 - Transcrição** 🎙️

**Teste Manual**:
1. Acesse: `/athena/transcription-vft`
2. Faça upload de um áudio (MP3, 1-2 min)
3. Clique em "Processar"
4. Aguarde resultado
5. Verifique transcrição

**Teste de API** (curl):
```bash
curl -X POST https://legaltech-forensics.preview.emergentagent.com/api/transcription/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@test_audio.mp3"
```

**Critério de Sucesso**:
- ✅ Upload aceita MP3
- ✅ Transcrição é gerada
- ✅ Texto está correto (português)

---

### **DIA 3 - Calculadoras** 🧮

**Teste Manual (3 calculadoras)**:

**Teste 1 - Pena Trifásico**:
```bash
curl -X POST https://legaltech-forensics.preview.emergentagent.com/api/calculadoras/criminal/pena-trifasico \
  -H "Content-Type: application/json" \
  -d '{"pena_base_meses": 60, "atenuantes": 1, "agravantes": 0, "majorantes_percentual": 0, "minorantes_percentual": 0}'
```

**Esperado**: Retorna pena calculada corretamente

**Teste 2 - IRPF**:
```bash
curl -X POST https://legaltech-forensics.preview.emergentagent.com/api/calc-universal/tributario/irpf \
  -H "Content-Type: application/json" \
  -d '{"renda_anual": 50000, "dependentes": 2, "deducoes": 5000}'
```

**Esperado**: Retorna imposto calculado

**Teste 3 - Férias**:
```bash
curl -X POST https://legaltech-forensics.preview.emergentagent.com/api/calculadoras/trabalhista/ferias \
  -H "Content-Type: application/json" \
  -d '{"salario": 3000, "dias_ferias": 30}'
```

**Esperado**: Retorna valor de férias + 1/3

**Critério de Sucesso**:
- ✅ 3/3 calculadoras respondem
- ✅ Cálculos estão corretos
- ✅ Fundamentação legal presente

---

### **DIA 4 - Chat IA Jurídico** 🤖

**Teste Manual**:
1. Acesse: `/athena/chat-elitelex`
2. Digite: "Qual a prescrição para crime com pena de 4 anos?"
3. Aguarde resposta
4. Verifique se cita artigos do CP

**Teste de API**:
```bash
curl -X POST https://legaltech-forensics.preview.emergentagent.com/api/chat/elite-lex \
  -H "Content-Type: application/json" \
  -d '{"query": "prescrição penal", "analysis_type": "prescricao"}'
```

**Critério de Sucesso**:
- ✅ Responde em < 10 segundos
- ✅ Cita artigos do CP
- ✅ Resposta é coerente

---

### **DIA 5 - Login e Segurança** 🔐

**Teste Manual**:
1. Tente fazer login
2. Verifique se Session Guard funciona
3. Tente login duplo (2 navegadores)
4. Verifique se bloqueia

**Teste 2FA**:
1. Acesse: `/athena/2fa` (se rota existir)
2. Tente habilitar 2FA
3. Escaneie QR Code
4. Verifique token

**Critério de Sucesso**:
- ✅ Login funciona
- ✅ Bloqueia login duplicado
- ✅ 2FA pode ser ativado

---

## 📊 CRITÉRIOS DE APROVAÇÃO PARA BETA

**Mínimo para lançar**:
- ✅ 3/5 testes passam
- ✅ Evidence Vault funciona
- ✅ Transcrição funciona
- ✅ 1 calculadora funciona

**Se 3/5 OK**: **LANCE BETA!**

---

## 📋 PRÓXIMA AÇÃO

**ESTA SEMANA**:
1. Execute os 5 testes acima
2. Documente resultados
3. Corrija bugs críticos
4. Crie manual de 1 página
5. **LANCE BETA**

**NÃO**:
- ❌ Implementar novas features
- ❌ Refatorar projeto
- ❌ Adicionar mais código

---

**Foco total em TESTAR e VALIDAR! 🧪**

**Documento**: `/app/PLANO_TESTES_PRATICO.md`
