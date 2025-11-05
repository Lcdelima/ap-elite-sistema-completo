# 🔌 INTEGRAÇÕES NECESSÁRIAS - AP ELITE

**Data**: Janeiro 2025
**Status**: Mapeamento completo para implementação da proposta Elite

---

## ✅ INTEGRAÇÕES JÁ CONFIGURADAS

### Backend (`.env` atual)
- ✅ **MongoDB**: `mongodb://localhost:27017` (DB_NAME: test_database)
- ✅ **Emergent LLM Key**: `sk-emergent-aD33e9977E0D345EfD` (OpenAI, Anthropic, Google)
- ✅ **Google Maps API**: `AIzaSyDPPT-KaJl0ctGBQPOAYSVaWwu6uZPyAPA`

---

## 🔴 INTEGRAÇÕES NECESSÁRIAS (A PROVIDENCIAR)

### 1️⃣ **TRANSCRIÇÃO FORENSE (VFT Pack™)** - PRIORIDADE ALTA

#### Opção A: OpenAI Whisper API (RECOMENDADO)
- **Serviço**: OpenAI Whisper API
- **O que faz**: Transcrição de áudio/vídeo em 99+ idiomas
- **Qualidade**: Nível forense, timestamps precisos, diarização
- **Preço**: ~$0.006/minuto
- **Você precisa**:
  - `OPENAI_API_KEY` (pode usar sua Emergent LLM Key se cobrir Whisper)
  
#### Opção B: Google Speech-to-Text
- **Serviço**: Google Cloud Speech-to-Text
- **O que faz**: Transcrição com diarização de falantes
- **Preço**: ~$0.006-0.012/minuto
- **Você precisa**:
  - Conta Google Cloud Platform
  - Projeto GCP ativo
  - `GOOGLE_APPLICATION_CREDENTIALS` (arquivo JSON)
  - Ativar Speech-to-Text API

#### Opção C: AssemblyAI (MELHOR PARA FORENSE)
- **Serviço**: AssemblyAI
- **O que faz**: Transcrição + diarização + detecção de PII + análise de sentimento
- **Qualidade**: Especializada em legal/compliance
- **Preço**: ~$0.00025/segundo (~$0.015/minuto)
- **Você precisa**:
  - Conta AssemblyAI: https://www.assemblyai.com/
  - `ASSEMBLYAI_API_KEY`

**DECISÃO NECESSÁRIA**: Qual serviço de transcrição você prefere? (A, B ou C)

---

### 2️⃣ **ASSINATURA DIGITAL E CERTIFICAÇÃO**

#### Para "Elite Seal" (Manifesto de Custódia)

##### Opção A: ICP-Brasil (RECOMENDADO para Brasil)
- **Serviço**: Certificado Digital ICP-Brasil (A3 ou A1)
- **O que faz**: Assinatura digital com validade jurídica no Brasil
- **Padrões**: PAdES, CAdES, XAdES
- **Você precisa**:
  - Certificado Digital ICP-Brasil (comprar em AC certificadora)
  - Token/Smartcard ou arquivo .pfx/.p12
  - Senha do certificado
  - Bibliotecas: `cryptography`, `pyhanko` (PAdES)

##### Opção B: Assinatura Simples (sem ICP-Brasil)
- **O que faz**: Hash + timestamp + assinatura RSA própria
- **Validade**: Técnica (não jurídica formal)
- **Você precisa**:
  - Apenas gerar par de chaves RSA (posso implementar)
  - Nenhum custo

**DECISÃO NECESSÁRIA**: ICP-Brasil (custo ~R$ 200-500/ano) ou assinatura técnica própria?

---

### 3️⃣ **ARMAZENAMENTO EXTERNO (Storage Connectors)**

#### A) AWS S3 (Storage do Cliente)
- **Serviço**: Amazon S3 (conta do cliente, não sua)
- **O que faz**: Armazenamento de evidências com WORM/Object Lock
- **Você precisa** (para conectar à conta do CLIENTE):
  - SDK boto3 (já disponível)
  - Cliente fornece: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
  
**AÇÃO**: Implementar interface para cliente configurar suas credenciais S3

#### B) Google Drive/Workspace
- **Serviço**: Google Drive API
- **O que faz**: Sincronização com Drive do cliente (até 30TB)
- **Você precisa**:
  1. Projeto no Google Cloud Console
  2. Ativar Google Drive API
  3. Criar OAuth 2.0 Client ID
  4. Configurar tela de consentimento
  5. Obter `client_id` e `client_secret`
  
**Passos**: https://console.cloud.google.com/apis/credentials

#### C) Microsoft OneDrive/SharePoint
- **Serviço**: Microsoft Graph API
- **O que faz**: Integração com OneDrive for Business
- **Você precisa**:
  - App registration no Azure AD
  - `MICROSOFT_CLIENT_ID`
  - `MICROSOFT_CLIENT_SECRET`
  - `MICROSOFT_TENANT_ID`

**DECISÃO NECESSÁRIA**: Quais storage connectors implementar primeiro? (AWS, Google, Microsoft)

---

### 4️⃣ **PAGAMENTOS E BILLING**

#### Para Sistema de Licenciamento (Entitlements)

##### Opção A: Stripe (RECOMENDADO para Brasil + Internacional)
- **Serviço**: Stripe Payments + Billing
- **O que faz**: Assinaturas recorrentes, one-time, billing automático
- **Preço**: 4.99% + R$ 0.69 por transação (Brasil)
- **Você precisa**:
  - Conta Stripe: https://stripe.com/
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET` (para eventos de pagamento)

##### Opção B: PagBank (PagSeguro)
- **Serviço**: PagBank API
- **O que faz**: Pagamentos no Brasil (boleto, PIX, cartão)
- **Preço**: ~3-5% por transação
- **Você precisa**:
  - Conta PagBank empresarial
  - `PAGBANK_TOKEN`
  - `PAGBANK_EMAIL`

##### Opção C: Mercado Pago
- **Serviço**: Mercado Pago API
- **O que faz**: Pagamentos Brasil/LATAM
- **Você precisa**:
  - Conta Mercado Pago
  - `MERCADOPAGO_ACCESS_TOKEN`

**DECISÃO NECESSÁRIA**: Qual gateway de pagamento? (Stripe, PagBank, Mercado Pago)

---

### 5️⃣ **AUTENTICAÇÃO AVANÇADA (MFA/2FA)**

#### Para "Session Concurrency Guard" e "FIDO2/WebAuthn"

##### Opção A: Auth0 (Managed, RECOMENDADO)
- **Serviço**: Auth0 by Okta
- **O que faz**: MFA, WebAuthn, biometria, social login, device fingerprint
- **Preço**: Grátis até 7.000 usuários/mês, depois $23/mês por 1000 usuários
- **Você precisa**:
  - Conta Auth0: https://auth0.com/
  - `AUTH0_DOMAIN`
  - `AUTH0_CLIENT_ID`
  - `AUTH0_CLIENT_SECRET`

##### Opção B: AWS Cognito
- **Serviço**: Amazon Cognito
- **O que faz**: MFA, pools de usuários
- **Preço**: Grátis até 50.000 MAU, depois $0.0055/MAU
- **Você precisa**:
  - Conta AWS
  - `COGNITO_USER_POOL_ID`
  - `COGNITO_CLIENT_ID`
  - Região AWS

##### Opção C: Implementação Própria (PyOTP + FIDO2)
- **O que faz**: TOTP (Google Authenticator) + WebAuthn
- **Custo**: Zero
- **Você precisa**: Apenas implementação (posso fazer)

**DECISÃO NECESSÁRIA**: Managed (Auth0/Cognito) ou implementação própria?

---

### 6️⃣ **ANÁLISE DE MÍDIA (Deepfake, Autenticidade)**

#### Para módulo "Autenticidade de Mídia & Deepfake Lab"

##### Opção A: Sentinel (RECOMENDADO para deepfake)
- **Serviço**: Sentinel.ai ou Reality Defender
- **O que faz**: Detecção de deepfakes em vídeo/áudio
- **Você precisa**: Contato comercial (APIs enterprise)

##### Opção B: Implementação Própria (ML Models)
- **O que faz**: Usar modelos open-source (MesoNet, FaceForensics++)
- **Você precisa**:
  - GPU (recomendado)
  - Modelos treinados
  - Bibliotecas: `torch`, `opencv-python`, `face_recognition`

**DECISÃO NECESSÁRIA**: API comercial ou modelos próprios?

---

### 7️⃣ **JURISPRUDÊNCIA (RAG Jurídico)**

#### Para "Jurisprudência & Inteligência de Precedentes"

##### Base de dados públicas (FREE)
- **STF API**: https://api.stf.jus.br/ (gratuita)
- **STJ**: Web scraping (sem API oficial)
- **TRFs/TJs**: Scraping por tribunal

##### Embeddings e RAG
- **Serviço**: OpenAI Embeddings (text-embedding-3-large)
- **Você precisa**: Usa sua `EMERGENT_LLM_KEY` (já tem!)
- **Vector DB**: 
  - Opção A: Pinecone (grátis até 1GB)
  - Opção B: ChromaDB (local, grátis)
  - Opção C: PostgreSQL + pgvector (grátis)

**DECISÃO NECESSÁRIA**: Qual vector database? (Pinecone, ChromaDB, pgvector)

---

### 8️⃣ **BLOCKCHAIN (Cadeia de Custódia)**

#### Para módulo "Blockchain Custody"

##### Opção A: Ethereum (Sepolia Testnet → Mainnet)
- **O que faz**: Registro imutável de hashes de evidências
- **Você precisa**:
  - Conta Infura ou Alchemy (RPC provider)
  - `INFURA_PROJECT_ID` ou `ALCHEMY_API_KEY`
  - Carteira Ethereum (chave privada)
  - ETH para gas (Mainnet) ou grátis (Testnet)

##### Opção B: Polygon/BSC (mais barato)
- **O que faz**: Mesmo que Ethereum, custo muito menor
- **Você precisa**: Mesma estrutura, rede Polygon

##### Opção C: Banco de dados com hash-chain (simulação)
- **O que faz**: Hash encadeado local (não é blockchain real)
- **Custo**: Zero

**DECISÃO NECESSÁRIA**: Blockchain real (Ethereum/Polygon) ou hash-chain local?

---

### 9️⃣ **CRIPTOATIVOS (Blockchain Analytics)**

#### Para módulo "Criptoativos & Blockchain Analytics"

##### APIs de Rastreamento
- **Chainalysis**: Enterprise (muito caro)
- **Elliptic**: Enterprise (caro)
- **TRM Labs**: Enterprise (caro)
- **BlockCypher**: API pública (limitada, grátis)
- **Blockchain.com API**: Grátis (básica)

**DECISÃO NECESSÁRIA**: Começar com APIs gratuitas (BlockCypher) ou investir em enterprise?

---

### 🔟 **EMAIL (SMTP para notificações)**

#### Para envio de e-mails do sistema

##### Opção A: SendGrid (RECOMENDADO)
- **Serviço**: Twilio SendGrid
- **Preço**: Grátis até 100 emails/dia, depois $19.95/mês (40.000 emails)
- **Você precisa**:
  - Conta SendGrid: https://sendgrid.com/
  - `SENDGRID_API_KEY`

##### Opção B: AWS SES
- **Serviço**: Amazon Simple Email Service
- **Preço**: $0.10 por 1000 emails
- **Você precisa**:
  - Conta AWS
  - Verificar domínio
  - `AWS_SES_REGION`

##### Opção C: SMTP próprio
- **Serviço**: Servidor SMTP do seu domínio
- **Você precisa**:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USERNAME`
  - `SMTP_PASSWORD`

**DECISÃO NECESSÁRIA**: SendGrid, AWS SES ou SMTP próprio?

---

### 1️⃣1️⃣ **SMS (Opcional - para MFA via SMS)**

#### Se implementar MFA por SMS

##### Opção A: Twilio
- **Serviço**: Twilio SMS
- **Preço**: ~$0.075 por SMS (Brasil)
- **Você precisa**:
  - Conta Twilio: https://www.twilio.com/
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`

##### Opção B: AWS SNS
- **Serviço**: Amazon SNS
- **Preço**: $0.00645 por SMS (Brasil)
- **Você precisa**:
  - Conta AWS
  - `AWS_SNS_REGION`

**DECISÃO NECESSÁRIA**: Implementar MFA via SMS? Se sim, qual serviço?

---

### 1️⃣2️⃣ **VIDEOCONFERÊNCIA**

#### Para módulo "Video Conference" (já existe frontend)

##### Opção A: Daily.co (RECOMENDADO - simples)
- **Serviço**: Daily.co Video API
- **Preço**: Grátis até 10.000 minutos/mês, depois $0.004/minuto
- **Você precisa**:
  - Conta Daily: https://www.daily.co/
  - `DAILY_API_KEY`

##### Opção B: Twilio Video
- **Serviço**: Twilio Programmable Video
- **Preço**: Varia por qualidade
- **Você precisa**:
  - Conta Twilio
  - `TWILIO_API_KEY`
  - `TWILIO_API_SECRET`

##### Opção C: Zoom API
- **Serviço**: Zoom Meeting API
- **Você precisa**:
  - Conta Zoom Developer
  - OAuth app
  - `ZOOM_CLIENT_ID`
  - `ZOOM_CLIENT_SECRET`

**DECISÃO NECESSÁRIA**: Qual serviço de vídeo? (Daily, Twilio, Zoom, outro)

---

### 1️⃣3️⃣ **OCR AVANÇADO**

#### Para módulo "OCR Dashboard" (já existe)

##### Atual vs. Upgrade

**Atual**: Provavelmente Tesseract (grátis, local)

**Upgrade para Forense**:
- **Google Cloud Vision API**: OCR premium
  - Você precisa: `GOOGLE_APPLICATION_CREDENTIALS` (mesmo da transcrição)
- **AWS Textract**: OCR + extração de formulários
  - Você precisa: Conta AWS
- **Azure Computer Vision**: OCR Microsoft
  - Você precisa: `AZURE_COMPUTER_VISION_KEY`

**DECISÃO NECESSÁRIA**: Manter Tesseract ou upgrade para nuvem?

---

### 1️⃣4️⃣ **GEOLOCALIZAÇÃO E MAPAS**

#### Para ERBs, OSINT, tracking

**JÁ TEM**: Google Maps API (`AIzaSyDPPT-KaJl0ctGBQPOAYSVaWwu6uZPyAPA`)

**Opcional**:
- **Mapbox**: Mapas mais customizáveis
- **OpenStreetMap**: Gratuito

---

## 📋 RESUMO POR PRIORIDADE

### 🔴 PRIORIDADE CRÍTICA (para começar)
1. ✅ **MongoDB** - já configurado
2. ✅ **Emergent LLM Key** - já tem
3. ⚠️ **Transcrição de Áudio** - ESCOLHER: OpenAI Whisper, Google, ou AssemblyAI
4. ⚠️ **Pagamentos** - ESCOLHER: Stripe, PagBank, ou Mercado Pago

### 🟡 PRIORIDADE ALTA (fase 1-2)
5. ⚠️ **Assinatura Digital** - ESCOLHER: ICP-Brasil ou assinatura técnica
6. ⚠️ **Storage Connectors** - AWS S3 (interface para cliente)
7. ⚠️ **Google Drive API** - OAuth setup
8. ⚠️ **Email (SMTP)** - SendGrid ou AWS SES
9. ⚠️ **MFA/2FA** - Auth0, Cognito ou implementação própria

### 🟢 PRIORIDADE MÉDIA (fase 3-4)
10. ⚠️ **Vector DB** (RAG Jurídico) - Pinecone, ChromaDB ou pgvector
11. ⚠️ **Blockchain** - Ethereum/Polygon ou hash-chain
12. ⚠️ **Videoconferência** - Daily.co ou outro
13. ⚠️ **Deepfake Detection** - API ou modelos próprios

### ⚪ PRIORIDADE BAIXA (opcional)
14. ⚠️ **Microsoft OneDrive** - se houver demanda
15. ⚠️ **SMS (MFA)** - Twilio ou SNS
16. ⚠️ **Criptoativos** - APIs de rastreamento
17. ⚠️ **OCR Premium** - upgrade de Tesseract

---

## 💰 ESTIMATIVA DE CUSTOS MENSAIS

### Cenário Mínimo (50 usuários ativos)
- **Transcrição**: ~$50-100/mês (500-1000 horas)
- **Stripe**: ~R$ 200-500/mês (taxa sobre vendas)
- **SendGrid**: $19.95/mês (40k emails)
- **Auth0**: Grátis (até 7k usuários)
- **Emergent LLM**: Você já paga
- **MongoDB**: Local (zero) ou Atlas $57/mês (M10)
- **Total mínimo**: **~$100-150/mês** (sem contar % do Stripe)

### Cenário Premium (500 usuários ativos)
- **Transcrição**: ~$500/mês
- **Stripe**: 4.99% sobre faturamento
- **Auth0**: $23-50/mês
- **Daily.co Video**: ~$100/mês
- **MongoDB Atlas**: $200/mês (M30)
- **Google Drive API**: Grátis (quota generosa)
- **AWS S3**: Cliente paga
- **Total estimado**: **~$1000/mês** (+ % Stripe sobre receita)

---

## ✅ CHECKLIST DE DECISÕES

Copie e responda:

```
[ ] 1. Transcrição: ( ) OpenAI Whisper  ( ) Google Speech  ( ) AssemblyAI
[ ] 2. Assinatura Digital: ( ) ICP-Brasil  ( ) Técnica própria
[ ] 3. Pagamentos: ( ) Stripe  ( ) PagBank  ( ) Mercado Pago
[ ] 4. Storage Connectors: ( ) AWS S3  ( ) Google Drive  ( ) OneDrive  ( ) Todos
[ ] 5. Email: ( ) SendGrid  ( ) AWS SES  ( ) SMTP próprio
[ ] 6. MFA: ( ) Auth0  ( ) Cognito  ( ) Próprio (TOTP)
[ ] 7. Vector DB (RAG): ( ) Pinecone  ( ) ChromaDB  ( ) pgvector
[ ] 8. Blockchain: ( ) Ethereum  ( ) Polygon  ( ) Hash-chain local
[ ] 9. Videoconferência: ( ) Daily.co  ( ) Twilio  ( ) Zoom  ( ) Não implementar
[ ] 10. Deepfake: ( ) API comercial  ( ) Modelos próprios  ( ) Versão futura
```

---

## 🎯 PRÓXIMA AÇÃO

Depois que você responder o checklist acima, vou:
1. Criar o **plano faseado** de implementação
2. Começar pela **prioridade escolhida**
3. Implementar **preservando tudo que existe**

**Aguardando suas escolhas! 🚀**
