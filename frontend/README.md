# Football Analytics - Frontend

Frontend em Next.js 14 para o dashboard de análise de futebol.

## 🚀 Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie o arquivo `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sua-anon-key
```

### 3. Rodar servidor
```bash
npm run dev
```

Frontend estará disponível em: http://localhost:3000

## 📁 Estrutura

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de cadastro
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── ranking/           # Ranking público
│   │   └── reports/           # Relatórios
│   ├── components/
│   │   └── ui/                # Componentes UI reutilizáveis
│   ├── hooks/                 # Custom hooks (useAuth)
│   └── lib/                   # Utils (api, types)
└── package.json
```

## 🔧 Páginas

### Pública
- `/` - Landing page com features e pricing
- `/ranking` - Ranking público (FASE 1)
- `/login` - Login
- `/register` - Cadastro

### Protegidas
- `/dashboard` - Dashboard principal (FASE 2)
- `/dashboard/players` - Gestão de jogadores
- `/dashboard/matches` - Gestão de partidas
- `/reports` - Relatórios individuais (FASE 3)

## 🛠️ Stack

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Data Fetching**: React Query (@tanstack/react-query)
- **Charts**: Recharts
