# Football Analytics - SaaS de Análise de Jogadores com IA

Plataforma de análise de vídeos de futebol usando IA (YOLOv8 + ByteTrack) para gerar rankings e relatórios de jogadores jovens de campeonatos regionais.

## 🎯 Problema e Solução

**Problema:** Clubes médios não têm acesso a dados de jogadores jovens de campeonatos regionais invisíveis.

**Solução:** Processar vídeos com IA, gerar ranking do campeonato inteiro, vender acesso aos clubes.

## 💰 Monetização

1. **Ranking público (free)** → Viraliza (LinkedIn da Bola)
2. **Subscription pro clube (R$1.5-2k/mês)** → Acesso ao banco de dados completo
3. **Relatório individual (R$200-300)** → Complemento detalhado

## 🏗️ Arquitetura

```
football-analytics/
├── backend-ml/         # Python: FastAPI + ML Pipeline
│   ├── app/
│   │   ├── api/        # Rotas FastAPI
│   │   ├── ml/         # YOLOv8 + ByteTrack + Analytics
│   │   ├── models/     # Database models (SQLAlchemy)
│   │   └── services/   # Pagamentos, export, etc.
│   └── requirements.txt
└── frontend/           # Next.js 14 (React)
    └── app/
        ├── dashboard/  # Dashboard clubes (subscription)
        ├── ranking/    # Ranking público (free)
        └── reports/    # Relatórios individuais
```

## 🚀 Stack Tecnológica

**Backend + ML (Python):**
- FastAPI (API REST)
- YOLOv8 (detecção jogadores/bola)
- ByteTrack (tracking consistente)
- Custom analytics (velocidade, passes, distâncias)
- Supabase (PostgreSQL)
- Stripe (pagamentos)
- Celery + Redis (processamento assíncrono)

**Frontend (React/Next.js):**
- Next.js 14 (App Router)
- shadcn/ui + TailwindCSS
- Recharts (gráficos)
- NextAuth.js (autenticação)

## 📋 Status do Projeto

### ✅ FASE 2: Subscription para Clubes (EM DESENVOLVIMENTO)
- [x] Backend FastAPI estruturado
- [x] API de Autenticação (JWT)
- [x] API de Clubs, Players, Matches
- [x] API de Upload de Vídeos
- [x] API de Subscriptions (Stripe)
- [x] ML Pipeline base (YOLOv8 + ByteTrack)
- [ ] Frontend Next.js
- [ ] Dashboard Clubes

### ⏳ FASE 3: Relatórios Individuais
- [ ] Geração de PDFs
- [ ] Pagamento one-time
- [ ] Preview + download

### ⏳ FASE 1: Ranking Público
- [ ] API pública (rate limiting)
- [ ] Página pública SEO otimizada
- [ ] Viralização (compartilhamento)

## 🔧 Setup

### Backend (Python)
```bash
cd backend-ml
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env  # Configurar variáveis Supabase
uvicorn app.main:app --reload
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentação

- [Backend README](./backend-ml/README.md)
- [Frontend README](./frontend/README.md) (em breve)

## 🤝 Contribuindo

Este é um projeto comercial. Para contribuições, entre em contato.

## 📄 Licença

Todos os direitos reservados.
