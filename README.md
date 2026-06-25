# Football Analytics - SaaS de Análise de Jogadores com IA

Plataforma de análise de vídeos de futebol usando IA (YOLOv8 + ByteTrack) para gerar rankings e relatórios de jogadores jovens de campeonatos regionais.

## 🎯 Problema e Solução

**Problema:** Clubes médios não têm acesso a dados de jogadores jovens de campeonatos regionais invisíveis.

**Solução:** Processar vídeos com IA, gerar ranking do campeonato inteiro, vender acesso aos clubes.

## 💰 Monetização

1. **Ranking público (free)** → Viraliza (LinkedIn da Bola)
2. **Subscription pro clube (R$1.5-2k/mês)** → Acesso ao banco de dados completo
3. **Relatório individual (R$200-300)** → Complemento detalhado

## 👥 Fluxo de Usuários

### 1. Visitante (sem login)
- Acessa a home pública
- Vê ranking filtrável por campeonato, categoria, posição
- Compartilha jogadores no WhatsApp
- CTA: "Quer mais dados? Assine" → Redireciona para registro

### 2. Admin (você)
- Acessa `/dashboard/admin`
- **Upload Vídeo**: Seleciona campeonato + faz upload de .mp4
- **Processing Queue**: Acompanha progresso (uploading → processing → analyzing → validating → published)
- **Validação**: Preview de dados extraídos (jogadores detectados, qualidade tracking, stats)
- **Publicação**: Publica ranking após validação manual
- **Analytics**: Dashboard com ranking atualizado

### 3. Clube Assinante (R$1.5-2k/mês)
- Acessa `/dashboard`
- Vê banner com status da assinatura
- **Ranking Dinâmico**: Tabela filtrável que atualiza em tempo real
- **Detalhes do Jogador**:
  - Stats da carreira (partidas, gols, assists, rating médio)
  - Heatmap de posicionamento
  - Comparação vs média da categoria (com percentuais)
  - Clipes de vídeo destacados
  - Botão para gerar PDF
- **Alertas**: Notificações de novos talentos (novo talento, performance destacada, desempenho consistente)
- **Histórico**: Campanhas anteriores

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
    └── src/
        ├── app/
        │   ├── page.tsx                    # Home pública com ranking
        │   ├── login/page.tsx             # Login
        │   ├── register/page.tsx          # Registro
        │   ├── dashboard/
        │   │   ├── page.tsx               # Dashboard Clube (assinante)
        │   │   ├── admin/page.tsx         # Dashboard Admin (upload/validação)
        │   │   ├── players/page.tsx       # Gestão de jogadores
        │   │   └── matches/page.tsx       # Gestão de partidas
        │   └── ranking/page.tsx           # Ranking público (legacy)
        ├── components/
        │   ├── VideoUploadCard.tsx        # Card de upload de vídeo
        │   ├── ProcessingProgress.tsx     # Fila de processamento
        │   ├── RankingTable.tsx           # Tabela de ranking
        │   ├── PlayerCard.tsx             # Card de jogador
        │   ├── TalentAlerts.tsx           # Alertas de talentos
        │   ├── RankingFilters.tsx         # Filtros de ranking
        │   ├── PlayerDetailsModal.tsx     # Modal de detalhes do jogador
        │   └── ui/                        # Componentes UI base
        ├── lib/
        │   ├── types.ts                   # Tipos TypeScript
        │   ├── api.ts                     # Cliente API
        │   └── hooks/                     # Hooks customizados
        └── hooks/
            └── useAuth.ts                 # Hook de autenticação
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
- [x] Frontend Next.js
- [x] Landing page com pricing
- [x] Login e registro
- [x] Dashboard básico
- [x] **UI completa para fluxo Admin (upload/validação/publicação)**
- [x] **UI completa para Dashboard Clube (ranking/alertas/detalhes)**
- [x] **UI completa para Home pública (ranking filtrável + CTA)**
- [x] **Componentes reutilizáveis (VideoUploadCard, ProcessingProgress, RankingTable, etc.)**
- [x] **Tipos TypeScript para o novo fluxo**
- [ ] Conectar UI à APIs do backend
- [ ] Implementar integração real com ML Pipeline
- [ ] Implementar geração de PDFs
- [ ] Implementar alerts em tempo real

### ⏳ FASE 3: Relatórios Individuais
- [ ] Geração de PDFs detalhados
- [ ] Pagamento one-time via Stripe
- [ ] Preview + download de relatórios

### ✅ FASE 1: Ranking Público
- [x] UI de ranking público com filtros
- [x] Compartilhamento no WhatsApp
- [x] CTA para assinatura
- [ ] API pública com rate limiting
- [ ] SEO otimizado
- [ ] Dados reais do backend

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

## 🎯 Como Usar a Nova UI

### 1. Home Pública (Visitante)
Acesse `http://localhost:3000` para ver:
- Ranking público filtrável por campeonato, categoria e posição
- Ordenação por rating, gols, assists, passes, duelos
- Compartilhamento no WhatsApp de jogadores
- CTA para assinatura

### 2. Dashboard Admin
Acesse `http://localhost:3000/dashboard/admin` para:
- **Upload Vídeo**: Selecione campeonato e faça upload de .mp4
- **Processing Queue**: Acompanhe status de cada vídeo (uploading → processing → analyzing → validating → published)
- **Validação**: Quando status = "analyzing", valide os dados extraídos antes de publicar
- **Publicação**: Publique o ranking para assinantes após validação

### 3. Dashboard Clube
Acesse `http://localhost:3000/dashboard` para:
- Ver banner com status da assinatura
- **Ranking**: Filtre e explore ranking dinâmico que atualiza em tempo real
- **Alertas**: Receba notificações de novos talentos
- **Detalhes**: Clique em qualquer jogador para ver stats completos, heatmap, comparações e clipes
- **PDF**: Gere relatórios PDF individuais

### 4. Componentes Reutilizáveis
Os componentes podem ser importados de `@/components`:

```tsx
import {
  VideoUploadCard,
  ProcessingProgress,
  RankingTable,
  PlayerCard,
  TalentAlerts,
  RankingFilters,
  PlayerDetailsModal
} from '@/components';
```

## 📚 Documentação

- [Backend README](./backend-ml/README.md)
- [Frontend README](./frontend/README.md) (em breve)

## 📊 Estrutura de Dados

### Tipos TypeScript (`frontend/src/lib/types.ts`)

**Upload & Processamento:**
- `VideoUpload` - Status de upload (uploading, uploaded, processing, analyzing, validating, published, failed)
- `ProcessingQueue` - Fila de processamento com contadores (total, processing, completed, failed)
- `VideoValidation` - Dados para validação admin (jogadores detectados, qualidade tracking, stats)

**Ranking:**
- `PlayerRanking` - Dados do ranking público (rank, jogador, stats, categoria)
- `RankingFilters` - Filtros (campeonato, categoria, posição, ordenação)

**Dashboard Clube:**
- `PlayerDetails` - Detalhes completos (career stats, heatmap_url, video_clips, comparison_vs_category)
- `TalentAlert` - Alertas de talentos (new_talent, breakout_performance, consistent_performer)
- `VideoClip` - Clipes destacados (título, descrição, vídeo, timestamps)

## 🧩 Componentes Frontend

**Admin:**
- `VideoUploadCard` - Card de upload com seleção de campeonato e progress bar
- `ProcessingProgress` - Exibe fila de processamento com status coloridos
- `VideoValidation` - Modal de validação com preview de dados extraídos

**Ranking Público:**
- `RankingTable` - Tabela de ranking com ações (compartilhar WhatsApp, ver detalhes)
- `RankingFilters` - Componente de filtros reutilizável
- `PlayerCard` - Card compacto de jogador para grids

**Dashboard Clube:**
- `TalentAlerts` - Lista de alertas com badges de "novo"
- `PlayerDetailsModal` - Modal completo com:
  - Header com foto e info básica
  - Career stats (partidas, gols, assists, rating)
  - Heatmap
  - Comparação vs média da categoria (com barras de progresso)
  - Clipes de vídeo destacados
  - Botão para gerar PDF

## 🔌 APIs Backend Necessárias

Para conectar a UI ao backend, as seguintes rotas precisam ser implementadas:

### Admin APIs
- `POST /api/admin/videos/upload` - Upload de vídeo com campeonato
- `GET /api/admin/processing-queue` - Lista vídeos na fila de processamento
- `GET /api/admin/videos/:id/validate` - Dados para validação (jogadores detectados, stats)
- `POST /api/admin/videos/:id/publish` - Publicar ranking após validação

### Público APIs
- `GET /api/public/ranking` - Ranking público com filtros (campeonato, categoria, posição, ordenação)
- Rate limiting para prevenir abuso

### Clube APIs (requer autenticação)
- `GET /api/club/ranking` - Ranking completo para assinantes
- `GET /api/club/alerts` - Alertas de novos talentos
- `PUT /api/club/alerts/:id/read` - Marcar alerta como lido
- `GET /api/club/players/:id` - Detalhes completos do jogador
- `POST /api/club/players/:id/report` - Gerar relatório PDF

## 🚀 Próximos Passos

### 1. Conectar UI ao Backend
- Implementar as APIs listadas acima no FastAPI
- Atualizar `frontend/src/lib/api.ts` com os endpoints corretos
- Testar fluxo completo (upload → processamento → validação → publicação)

### 2. Integração ML Pipeline
- Conectar upload ao pipeline YOLOv8 + ByteTrack
- Implementar atualização de status em tempo real (WebSocket ou polling)
- Gerar heatmaps a partir dos dados de tracking
- Extrair métricas avançadas (velocidade, passes, duelos)

### 3. Geração de PDFs
- Implementar backend para gerar PDFs com stats, heatmaps e comparações
- Adicionar template profissional de relatório
- Integração com Stripe para pagamento one-time

### 4. Alertas em Tempo Real
- Implementar lógica de detecção de novos talentos
- WebSocket para push de alertas em tempo real
- Configuração de thresholds (rating, gols, percentil)

### 5. SEO e Viralização
- Implementar meta tags e Open Graph para ranking público
- Adicionar compartilhamento em mais redes (LinkedIn, Twitter)
- Implementar página de jogador individual com URL amigável

## 🤝 Contribuindo

Este é um projeto comercial. Para contribuições, entre em contato.

## 📄 Licença

Todos os direitos reservados.
