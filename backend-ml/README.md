# Football Analytics - Backend ML

Backend em Python (FastAPI) com pipeline de ML para análise de vídeos de futebol.

## 🚀 Setup

### 1. Criar ambiente virtual
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente
Copie `.env.example` para `.env` e preencha as variáveis:
```bash
cp .env.example .env
```

**Variáveis necessárias:**
- `DATABASE_URL`: URL do PostgreSQL
- `REDIS_URL`: URL do Redis (opcional para desenvolvimento)
- `JWT_SECRET`: Segredo para tokens JWT
- `STRIPE_API_KEY`: Chave API do Stripe
- `STRIPE_WEBHOOK_SECRET`: Segredo do webhook Stripe
- `STRIPE_PRICE_ID_BASIC`: ID do preço plano Basic
- `STRIPE_PRICE_ID_PRO`: ID do preço plano Pro

### 4. Configurar Banco de Dados
```bash
# Criar banco PostgreSQL
createdb football_analytics

# As tabelas serão criadas automaticamente no primeiro startup
```

### 5. Rodar servidor
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API estará disponível em: http://localhost:8000
Documentação: http://localhost:8000/docs

## 📁 Estrutura

```
backend-ml/
├── app/
│   ├── api/           # Rotas FastAPI
│   ├── ml/            # Pipeline ML (YOLOv8 + ByteTrack)
│   ├── models/        # Models SQLAlchemy
│   ├── services/      # Serviços (pagamentos, export, etc.)
│   ├── main.py        # Entry point
│   ├── database.py    # Configuração DB
│   └── config.py      # Configurações
├── models/            # Modelos YOLO treinados
├── uploads/           # Vídeos upload
├── processed/         # Vídeos processados
└── reports/           # Relatórios PDF gerados
```

## 🔧 API Endpoints

### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual

### Clubs
- `POST /api/clubs/` - Criar clube
- `GET /api/clubs/` - Buscar clube atual
- `PUT /api/clubs/` - Atualizar clube

### Players
- `POST /api/players/` - Criar jogador
- `GET /api/players/` - Listar jogadores
- `GET /api/players/{id}` - Buscar jogador

### Matches
- `POST /api/matches/championships` - Criar campeonato
- `GET /api/matches/championships` - Listar campeonatos
- `POST /api/matches/` - Criar partida
- `GET /api/matches/` - Listar partidas
- `GET /api/matches/{id}` - Buscar partida

### Videos
- `POST /api/videos/upload/{match_id}` - Upload vídeo
- `GET /api/videos/{id}` - Buscar vídeo
- `GET /api/videos/match/{match_id}` - Vídeos da partida

### Reports
- `POST /api/reports/` - Criar relatório
- `GET /api/reports/` - Listar relatórios
- `GET /api/reports/{id}` - Buscar relatório
- `POST /api/reports/{id}/purchase` - Comprar relatório

### Subscriptions
- `POST /api/subscriptions/create-checkout-session` - Criar checkout Stripe
- `GET /api/subscriptions/` - Buscar assinatura
- `POST /api/subscriptions/cancel` - Cancelar assinatura
- `POST /api/subscriptions/webhook` - Webhook Stripe

## 🧪 Testes

```bash
# Testar registro
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Testar login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```
