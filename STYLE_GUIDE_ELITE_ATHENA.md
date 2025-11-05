# 💎 ELITE ATHENA - STYLE GUIDE OFICIAL
## Design System V2.0 | Forensic Luxury Minimalism

**Versão**: 2.0  
**Data**: Janeiro 2025  
**Proprietária**: Dra. Laura Cunha de Lima  
**Empresa**: Elite – Estratégias em Perícia e Investigação Criminal

---

## 🎨 CONCEITO VISUAL

### **Estilo**: Forensic Luxury Minimalism

**Inspiração**: Combinação de ciberinteligência, direito penal e perícia digital

**Essência**: 
> "Um ambiente que transmite o mesmo impacto de uma prova pericial bem documentada — limpo, verificável e elegante."

**Sensação**: Poder técnico + Precisão + Sigilo + Sofisticação

---

## 🎨 PALETA CROMÁTICA OFICIAL

### Cores Base

| Função | Hex | Nome | Uso |
|--------|-----|------|-----|
| **Primária** | `#0B1220` | Azul-carbono | Background principal |
| **Acento Elite** | `#00A3C4` | Ciano metálico | Tecnologia, perícia |
| **Champagne** | `#C7BEB7` | Champagne-acinzentado | Elegância, luxo |
| **Magenta Elite** | `#C2185B` | Magenta profundo | Títulos jurídicos, IA |
| **Texto Primário** | `#E4E6EB` | Branco-acinzentado | Leitura principal |
| **Texto Secundário** | `#BFC3C9` | Cinza-claro | Leitura secundária |
| **Platina** | `#B3B8C2` | Metal | Detalhes refinados |

### Cores de Estado

| Estado | Hex | Nome | Uso |
|--------|-----|------|-----|
| **Alerta/Prazos** | `#E67E22` | Âmbar elegante | Prazos urgentes |
| **Sucesso** | `#27AE60` | Verde esmeralda | Confirmações |
| **Erro/Risco** | `#E74C3C` | Vermelho controlado | Falhas, não conformidade |

### Cores por Categoria

| Módulo | Hex | Cor |
|--------|-----|-----|
| Advocacia | `#2563EB` | Azul |
| Perícia | `#7C3AED` | Roxo forense |
| Admin | `#059669` | Verde esmeralda |
| Comunicação | `#EA580C` | Laranja âmbar |
| Sala de Aula | `#C026D3` | Magenta |
| Diversos | `#0891B2` | Ciano |
| OSINT | `#6366F1` | Azul-violeta |
| IA | `#C2185B` | Magenta profundo |
| Conformidade | `#DC2626` | Vermelho escuro |

### Regra de Ouro
- **80%** fundo escuro (#0B1220)
- **15%** tons neutros (cinzas, champagne)
- **5%** acentos metálicos (ciano, magenta)

---

## ✍️ TIPOGRAFIA

### Famílias de Fontes

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
```

| Uso | Fonte | Peso | Características |
|-----|-------|------|-----------------|
| **Títulos** | Orbitron | 700-800 | Geometria técnica, marca Elite |
| **Subtítulos** | Poppins | 500-600 | Limpa e equilibrada |
| **Texto longo** | Inter | 400-500 | Legibilidade técnica |
| **Dados técnicos** | IBM Plex Mono | 400-600 | Hashes, ISO, artigos, código |

### Hierarquia de Tamanhos

```css
--text-xs: 0.75rem    /* 12px - Labels, badges */
--text-sm: 0.875rem   /* 14px - Descrições */
--text-base: 1rem     /* 16px - Corpo */
--text-lg: 1.125rem   /* 18px - Destaques */
--text-xl: 1.25rem    /* 20px - Subtítulos */
--text-2xl: 1.5rem    /* 24px - Títulos seção */
--text-3xl: 1.875rem  /* 30px - Títulos página */
--text-4xl: 2.25rem   /* 36px - Hero */
--text-5xl: 3rem      /* 48px - Hero principal */
```

---

## 🧱 COMPONENTES

### 1. CipherGlass Card

**Descrição**: Card translúcido com efeito vidro fosco e linhas de energia

```jsx
<CipherGlassCard category="pericia" className="p-6">
  {/* Conteúdo */}
</CipherGlassCard>
```

**Variantes**:
- `default` - Blur 12px
- `strong` - Blur 18px

**Efeitos**:
- Linha de energia no topo (animada no hover)
- Borda ciano sutil
- Shadow com glow
- Transform lift (-4px)

### 2. ProofBar™

**Descrição**: Barra de conformidade que detecta normas ISO/ABNT

```jsx
<ProofBar />
```

**Comportamento**:
- Detecta palavras: ISO, ABNT, NBR, 27037, 27001, LGPD
- Pisca em gradiente ciano → magenta
- Animação pulse-forensic (2s)

### 3. Buttons Elite

**Tipos**:

```jsx
// Primary
<button className="btn-elite btn-elite-primary">
  Criar Elite Seal
</button>

// Secondary
<button className="btn-elite btn-elite-secondary">
  Cancelar
</button>
```

**Efeitos**:
- Ripple effect (::before)
- Gradient background (primary)
- Glow no hover
- Transform lift

### 4. Inputs Elite

```jsx
<input 
  type="text" 
  className="input-elite" 
  placeholder="Digite o ID..."
/>
```

**Efeitos**:
- Border ciano no focus
- Glow box-shadow
- Background lift (surface-01 → surface-02)

### 5. Category Badges

```jsx
<div className="category-badge badge-pericia">
  PERÍCIA
</div>
```

**9 categorias** disponíveis

### 6. Verified Seal

```jsx
<div className="verified-seal">
  Verified by Elite Seal 3D
</div>
```

### 7. Tech Text

```jsx
<div className="tech-text">
  Hash: sha256:abc123...
</div>
```

---

## 🎬 ANIMAÇÕES

### Animações Disponíveis

```css
.fade-in        /* Fade in com translateY */
.slide-in-right /* Slide da direita */
.scale-in       /* Scale de 95% → 100% */
```

### Animações Custom

```css
@keyframes logo-shimmer     /* Logo com shimmer effect */
@keyframes pulse-forensic   /* Pulse com glow */
@keyframes energy-flow      /* Linha de energia */
@keyframes slide-line       /* Linha deslizante */
```

### Timing Functions

```css
cubic-bezier(0.4, 0, 0.2, 1)  /* Smooth ease */
```

---

## 📐 LAYOUT PATTERNS

### Dashboard Layout

```
┌────────────────────────────────────────┐
│ HEADER (sticky, blur, border-bottom)   │
├────────────┬───────────────────────────┤
│ SIDEBAR    │ MAIN CONTENT              │
│ (módulos)  │ (cards 2x3 ou 3x4)        │
│            │                           │
│ colored    │ CipherGlass cards         │
│ icons      │ com hover effects         │
└────────────┴───────────────────────────┘
```

### Site Layout

```
HEADER FIXO (sticky)
  ↓
HERO SECTION (gradient + circuit bg)
  ↓
PILARES (4 cards glassmorphism)
  ↓
MÓDULOS (grid de cards)
  ↓
CTA FINAL
  ↓
FOOTER (selos ISO/ABNT)
```

---

## 🧩 GRID SYSTEMS

### Desktop:
- **2 colunas**: md:grid-cols-2
- **3 colunas**: lg:grid-cols-3
- **4 colunas**: lg:grid-cols-4
- **6 colunas**: xl:grid-cols-6

### Gaps:
- **Small**: gap-4 (1rem)
- **Medium**: gap-6 (1.5rem)
- **Large**: gap-8 (2rem)

---

## 🎭 MICROINTERAÇÕES

### 1. Hover em Botões
→ Sutil brilho em ciano + ripple effect

### 2. Ícones Ativos
→ Traço metálico pulsante

### 3. Mudança de Módulo
→ Linha de energia viaja pelo header

### 4. Scroll
→ Parallax nas linhas de circuito

### 5. Card Hover
→ Lift + glow + linha animada

---

## 🌈 BACKGROUNDS

### Circuit Background

```css
.circuit-bg {
  background-image: 
    linear-gradient(90deg, rgba(0, 163, 196, 0.03) 1px, transparent 1px),
    linear-gradient(rgba(0, 163, 196, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

### Gradient Radial Overlay

```css
body::before {
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(0, 163, 196, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(194, 24, 91, 0.03) 0%, transparent 50%);
}
```

---

## 📱 RESPONSIVE

### Breakpoints

```css
sm: 640px   /* Mobile large */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop large */
2xl: 1536px /* Wide screen */
```

### Mobile Adjustments

```css
@media (max-width: 768px) {
  --text-4xl: 1.875rem;
  --text-3xl: 1.5rem;
  
  .btn-elite {
    padding: 0.75rem 1.25rem;
    font-size: 0.8125rem;
  }
}
```

---

## 🧮 SPACING

### Padding/Margin Scale

| Token | Valor | Uso |
|-------|-------|-----|
| `p-1` | 0.25rem | Micro spacing |
| `p-2` | 0.5rem | Small spacing |
| `p-3` | 0.75rem | Default spacing |
| `p-4` | 1rem | Medium spacing |
| `p-6` | 1.5rem | Card padding |
| `p-8` | 2rem | Section padding |
| `p-12` | 3rem | Hero padding |

---

## 🎯 EXEMPLOS DE USO

### Hero Section

```jsx
<div className="hero-elite py-20 px-6">
  <div className="container mx-auto max-w-6xl text-center">
    <h1 className="text-5xl font-title text-elite-text mb-4">
      Prova Digital <span className="text-elite-accent">Impecável</span>
    </h1>
    <p className="text-xl text-elite-champagne subtitle">
      Perícia forense digital com governança ISO/IEC 27037
    </p>
  </div>
</div>
```

### Dashboard Card

```jsx
<CipherGlassCard category="pericia" className="p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-2xl font-title">Evidence Vault</h3>
    <div className="category-badge badge-pericia">ATIVO</div>
  </div>
  <p className="text-elite-metal">
    342 evidências registradas com hash verificado
  </p>
</CipherGlassCard>
```

### Technical Data

```jsx
<div className="tech-text p-4 bg-elite/50 rounded-lg border border-white/10">
  <div>Hash SHA-256:</div>
  <div className="text-elite-accent font-mono">
    a3d7f8e9c2b1a0d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
  </div>
</div>
```

---

## 🔐 ELEMENTOS DE SEGURANÇA

### Hash Display

```jsx
<div className="verified-seal">
  Verified by Elite Seal 3D
</div>
```

### ISO Compliance Badge

```jsx
<div className="flex space-x-2">
  <div className="category-badge badge-pericia">ISO/IEC 27037</div>
  <div className="category-badge badge-admin">ISO 27001</div>
  <div className="category-badge badge-diversos">ABNT NBR</div>
</div>
```

---

## 🧠 IDENTIDADE VISUAL

### Logo Elite Athena

```jsx
<div className="logo-elite">ELITE ATHENA</div>
```

**Efeito**: Shimmer animado (gradiente ciano → branco)

### Marca d'água

- Selo Elite criptográfico
- Baixa opacidade (5-10%)
- Posição: footer ou background

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### CSS
- [x] Importar Google Fonts (Orbitron, Poppins, Inter, IBM Plex Mono)
- [x] Definir paleta de cores refinada
- [x] Criar variáveis CSS
- [x] Implementar CipherGlass V2
- [x] Criar buttons com ripple effect
- [x] Adicionar animações (slide-line, energy-flow, pulse-forensic)
- [x] Background com texturas de circuito
- [x] Scrollbar com gradient
- [x] Modo Elite Silver (light mode)

### Componentes
- [x] CipherGlassCard
- [x] ProofBar
- [x] Category badges
- [x] Buttons Elite
- [x] Inputs Elite
- [x] Verified seal
- [x] Logo effect

### Páginas
- [x] Site institucional
- [x] Dashboards (Main, Perícia, Advocacia, Diversos)
- [x] Módulos (Evidence Vault, Elite Seal, etc.)

---

## 🎨 CÓDIGO DE EXEMPLO COMPLETO

```jsx
import React from 'react';
import '../styles/elite-gravitas.css';
import CipherGlassCard from '../components/ui/CipherGlassCard';
import ProofBar from '../components/ui/ProofBar';

const ExamplePage = () => {
  return (
    <div className="min-h-screen bg-elite">
      <ProofBar />
      
      {/* Header */}
      <header className="header-elite p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="logo-elite">ELITE ATHENA</div>
          <nav className="flex space-x-6">
            <a href="#" className="text-elite-text hover:text-elite-accent">Sobre</a>
            <a href="#" className="text-elite-text hover:text-elite-accent">Módulos</a>
          </nav>
          <button className="btn-elite btn-elite-primary">Acessar</button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-elite py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-title mb-4 fade-in">
            Prova Digital <span className="text-elite-accent">Impecável</span>
          </h1>
          <p className="text-xl subtitle text-elite-champagne mb-8">
            Perícia forense com ISO/IEC 27037
          </p>
          
          <div className="flex space-x-4 justify-center">
            <button className="btn-elite btn-elite-primary">
              Solicitar Avaliação
            </button>
            <button className="btn-elite btn-elite-secondary">
              Conhecer Serviços
            </button>
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            <CipherGlassCard category="pericia" className="p-6 hover:scale-105 transition-all">
              <div className="text-5xl text-center mb-4">🔬</div>
              <h3 className="text-xl font-title text-center mb-2">
                Perícia Digital
              </h3>
              <p className="text-elite-metal text-sm text-center">
                Análise forense de evidências
              </p>
              <div className="mt-4 text-center">
                <div className="category-badge badge-pericia">ATIVO</div>
              </div>
            </CipherGlassCard>
            
            {/* Mais cards... */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-surface-02 border-t border-white/10">
        <div className="container mx-auto text-center">
          <div className="verified-seal mb-4">
            Verified by Elite Seal 3D
          </div>
          <div className="flex justify-center space-x-4 mb-4">
            <div className="category-badge badge-pericia">ISO/IEC 27037</div>
            <div className="category-badge badge-admin">ISO 27001</div>
          </div>
          <p className="text-elite-metal text-sm">
            © 2025 Elite Athena. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ExamplePage;
```

---

## 🎨 TOKENS CSS (Para Tailwind)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'elite-bg': '#0B1220',
        'elite-accent': '#00A3C4',
        'elite-magenta': '#C2185B',
        'elite-champagne': '#C7BEB7',
        // ... mais cores
      },
      fontFamily: {
        'title': ['Orbitron', 'sans-serif'],
        'subtitle': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['IBM Plex Mono', 'monospace']
      },
      backdropBlur: {
        'glass': '12px'
      }
    }
  }
}
```

---

## 📱 PWA MOBILE

### Menu Inferior

```jsx
<nav className="fixed bottom-0 left-0 right-0 bg-surface-02 border-t border-white/10 p-4">
  <div className="flex justify-around">
    <button className="text-2xl">📁</button>
    <button className="text-2xl">💬</button>
    <button className="text-2xl">⚖️</button>
    <button className="text-2xl">👤</button>
  </div>
</nav>
```

### Dark Mode Fixo
- Padrão: Dark (Elite Gravitas)
- Opcional: Light (Elite Silver)

---

## 🛡️ IDENTIDADE DE SEGURANÇA

### Elementos Obrigatórios

1. **Hash SHA-256** no rodapé
2. **"Verified by Elite Seal 3D"** ao lado do logo
3. **QR code dinâmico** no dashboard (autenticação)
4. **Cadeado animado** no login
5. **ProofBar** em todas as páginas

---

## ✅ RESULTADO FINAL

**"Um ecossistema digital premium, com a sobriedade da perícia criminal, o luxo discreto da tecnologia suíça e a clareza operacional de um cockpit de segurança cibernética."**

Cada tela transmite:
- ✅ Confiança
- ✅ Sigilo
- ✅ Precisão
- ✅ Prosperidade
- ✅ Exclusividade

**Assinatura visual Elite ATHENA** 💎

---

**Implementado em**: `/app/frontend/src/styles/elite-gravitas.css`  
**Versão**: 2.0  
**Status**: ✅ PRONTO PARA PRODUÇÃO
