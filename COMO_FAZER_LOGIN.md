# 🔐 Como Fazer Login no AP Elite

## Credenciais de Administrador

**E-mail:** `laura@apelite.com`  
**Senha:** `laura2024`

## 📋 Passo a Passo para Login

### ⚠️ IMPORTANTE: Ordem Correta!

1. **PRIMEIRO:** Clique no botão **"Administrador"** (ícone de escudo)
   - O formulário deve mudar de "Portal do Cliente" para "Acesso Administrativo"
   - Aguarde 1-2 segundos para o estado atualizar
   
2. **SEGUNDO:** Preencha o email: `laura@apelite.com`

3. **TERCEIRO:** Preencha a senha: `laura2024`

4. **QUARTO:** Clique em "Entrar"

## ❌ Erro Comum

Se você preencher o email e senha **ANTES** de clicar em "Administrador", o sistema tentará fazer login como Cliente e retornará:

```
Erro interno. Tente novamente mais tarde.
```

**Solução:** Limpe os campos, clique em "Administrador" PRIMEIRO, depois preencha as credenciais.

## ✅ Verificação Visual

Após clicar em "Administrador", você deve ver:
- Botão "Administrador" com borda cyan/azul brilhante
- Título do formulário mudou para "**Acesso Administrativo**"
- Ícone do escudo em cyan

Se ainda estiver mostrando "Portal do Cliente", clique novamente no botão "Administrador".

## 🔧 Troubleshooting

### Login não funciona mesmo seguindo os passos?

1. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
2. **Recarregue a página** (F5 ou Ctrl+R)
3. **Tente em modo anônimo/privado**

### Ainda não funciona?

O backend pode estar com problemas. Verifique:

```bash
# Status do backend
curl -s http://0.0.0.0:8001/api/health | python3 -m json.tool

# Teste manual de login
curl -s -X POST "http://0.0.0.0:8001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"laura@apelite.com","password":"laura2024","role":"administrator"}' \
  | python3 -m json.tool
```

Se o comando curl retornar sucesso mas o frontend não, é um problema de estado React.

## 📊 Dados do Usuário no Banco

```javascript
{
  "id": "a0004b72-52e5-4862-aed1-00fb89553020",
  "name": "Laura Admin",
  "email": "laura@apelite.com",
  "role": "administrator",
  "password": "laura2024",  // Senha em texto plano (apenas para desenvolvimento!)
  "active": true
}
```

## 🚀 Após Login Bem-Sucedido

Você será redirecionado para:
- **URL:** `/admin/dashboard`
- **Acesso ao:** Sistema completo AP Elite Athena
- **Módulos disponíveis:** 
  - CISAI+ (Geointeligência)
  - Processos Jurídicos
  - Dashboard Administrativo
  - E muito mais!

---

**Nota de Segurança:** As senhas estão em texto plano APENAS em ambiente de desenvolvimento. Em produção, todas as senhas devem ser hash
eadas com bcrypt ou argon2.
