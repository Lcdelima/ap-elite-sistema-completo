# 🚀 Guia de Deployment - Aegis/Thanatos

## Deployment em Produção

### Opção 1: Servidor Dedicado (Ubuntu 22.04)

#### Passo 1: Preparar Servidor

```bash
# Conectar ao servidor
ssh usuario@seu-servidor.com

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install python3.11 python3.11-venv python3.11-dev -y

# Criar ambiente virtual
python3.11 -m venv /opt/aegis-venv
source /opt/aegis-venv/bin/activate
```

#### Passo 2: Transferir Código

```bash
# No seu computador local
cd /app/aegis
tar -czf aegis.tar.gz app/ docker-compose.yml requirements.txt setup.sh init_timescaledb.sql README.md

# Copiar para servidor
scp aegis.tar.gz usuario@seu-servidor.com:/opt/

# No servidor
cd /opt
tar -xzf aegis.tar.gz
mv app aegis
cd aegis
```

#### Passo 3: Executar Setup

```bash
# Dar permissão ao script
chmod +x setup.sh

# Executar setup automatizado
sudo ./setup.sh

# Aguardar conclusão (2-3 minutos)
```

#### Passo 4: Configurar Serviço Systemd

```bash
# Criar arquivo de serviço
sudo nano /etc/systemd/system/aegis.service

# Colar conteúdo:
```

```ini
[Unit]
Description=Aegis - Interceptação Legal API
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/aegis
Environment="PATH=/opt/aegis-venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/opt/aegis-venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8002 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable aegis
sudo systemctl start aegis

# Verificar status
sudo systemctl status aegis

# Ver logs
sudo journalctl -u aegis -f
```

#### Passo 5: Configurar Nginx (Reverse Proxy + SSL)

```bash
# Instalar Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/aegis
```

```nginx
server {
    listen 80;
    server_name aegis.seudominio.com;

    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aegis.seudominio.com;

    # Certificados SSL (certbot irá preencher)
    ssl_certificate /etc/letsencrypt/live/aegis.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aegis.seudominio.com/privkey.pem;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Tamanho máximo de upload (para evidências grandes)
    client_max_body_size 500M;

    # Proxy para Aegis API
    location / {
        proxy_pass http://localhost:8002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts para uploads grandes
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }

    # Logs
    access_log /var/log/nginx/aegis_access.log;
    error_log /var/log/nginx/aegis_error.log;
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/aegis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obter certificado SSL
sudo certbot --nginx -d aegis.seudominio.com
```

#### Passo 6: Firewall

```bash
# Configurar UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Bloquear acesso direto à API (força passar pelo Nginx)
sudo ufw deny 8002/tcp
```

#### Passo 7: Backup Automático

```bash
# Criar script de backup
sudo nano /opt/aegis/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/aegis/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec aegis-postgres pg_dump -U aegis aegis | gzip > $BACKUP_DIR/aegis_db_$DATE.sql.gz

# Backup arquivos de evidências
tar -czf $BACKUP_DIR/aegis_files_$DATE.tar.gz /opt/aegis/data/evidences/

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

```bash
# Dar permissão
sudo chmod +x /opt/aegis/backup.sh

# Agendar no cron (diário às 2h)
sudo crontab -e
# Adicionar:
0 2 * * * /opt/aegis/backup.sh >> /var/log/aegis_backup.log 2>&1
```

---

### Opção 2: Docker Swarm (Alta Disponibilidade)

```yaml
# docker-stack.yml
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_USER: aegis
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: aegis
    volumes:
      - postgres-data:/var/lib/postgresql/data
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    networks:
      - aegis-net

  api:
    image: aegis-api:latest
    environment:
      DATABASE_URL: postgresql+psycopg2://aegis:${POSTGRES_PASSWORD}@postgres:5432/aegis
      STORAGE_BACKEND: s3
      S3_BUCKET: aegis-evidences
      EMERGENT_LLM_KEY: ${EMERGENT_LLM_KEY}
    ports:
      - "8002:8002"
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - aegis-net
    depends_on:
      - postgres

volumes:
  postgres-data:

networks:
  aegis-net:
    driver: overlay
```

```bash
# Deployment
docker stack deploy -c docker-stack.yml aegis
```

---

### Opção 3: Kubernetes (Cloud Native)

```yaml
# aegis-deployment.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: aegis

---
apiVersion: v1
kind: Secret
metadata:
  name: aegis-secrets
  namespace: aegis
type: Opaque
stringData:
  postgres-password: "senha_super_segura"
  emergent-llm-key: "sk-emergent-aD33e9977E0D345EfD"

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: aegis
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: timescale/timescaledb:latest-pg15
        env:
        - name: POSTGRES_USER
          value: "aegis"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: aegis-secrets
              key: postgres-password
        - name: POSTGRES_DB
          value: "aegis"
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 100Gi

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: aegis
spec:
  selector:
    app: postgres
  ports:
  - port: 5432

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aegis-api
  namespace: aegis
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aegis-api
  template:
    metadata:
      labels:
        app: aegis-api
    spec:
      containers:
      - name: api
        image: aegis-api:latest
        env:
        - name: DATABASE_URL
          value: "postgresql+psycopg2://aegis:$(POSTGRES_PASSWORD)@postgres:5432/aegis"
        - name: EMERGENT_LLM_KEY
          valueFrom:
            secretKeyRef:
              name: aegis-secrets
              key: emergent-llm-key
        ports:
        - containerPort: 8002
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"

---
apiVersion: v1
kind: Service
metadata:
  name: aegis-api
  namespace: aegis
spec:
  type: LoadBalancer
  selector:
    app: aegis-api
  ports:
  - port: 80
    targetPort: 8002
```

```bash
# Deploy
kubectl apply -f aegis-deployment.yaml
```

---

## Monitoramento

### Prometheus + Grafana

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'aegis'
    static_configs:
      - targets: ['localhost:8002']
```

### Métricas Custom

Adicionar ao `main.py`:

```python
from prometheus_client import Counter, Histogram, generate_latest

# Métricas
evidence_ingested = Counter('aegis_evidence_ingested_total', 'Total evidences ingested')
transcription_duration = Histogram('aegis_transcription_duration_seconds', 'Transcription duration')

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

---

## Segurança Adicional

### 1. Autenticação JWT

```python
# Adicionar ao security.py
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload["user_id"]
```

### 2. Rate Limiting

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/cases/{case_id}/evidences/audio")
@limiter.limit("10/minute")
async def ingest_audio(...):
    ...
```

### 3. Criptografia de Evidências

```python
from cryptography.fernet import Fernet

def encrypt_evidence(content: bytes, key: bytes) -> bytes:
    f = Fernet(key)
    return f.encrypt(content)
```

---

## Checklist de Produção

- [ ] PostgreSQL com senha forte
- [ ] SSL/TLS habilitado
- [ ] Firewall configurado
- [ ] Backup automático
- [ ] Monitoramento ativo
- [ ] Logs centralizados
- [ ] Rate limiting
- [ ] Autenticação robusta
- [ ] Documentação atualizada
- [ ] Testes de carga
- [ ] Plano de disaster recovery
- [ ] Conformidade LGPD/GDPR

---

## Suporte e Contato

Para dúvidas ou problemas, consultar:
- README.md principal
- Logs: `sudo journalctl -u aegis -f`
- Status: `sudo systemctl status aegis`
