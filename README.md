# T3 Tasks - Gerenciador de Tarefas

Aplicação SaaS de gerenciamento de tarefas construída com T3 Stack.

## 🚀 Tecnologias

- Next.js 16 (App Router)
- TypeScript
- tRPC
- Drizzle ORM
- Better Auth
- Zod
- Tailwind CSS
- shadcn/ui
- PostgreSQL

## 📋 Pré-requisitos

- Node.js 24.12.0
- Docker & Docker Compose (opcional)

## 🔧 Instalação
```bash
# Clone e instale
git clone 
cd t3-tasks
npm install

# Configure variáveis de ambiente
cp .env.example .env
```

**Arquivo `.env`:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/t3_tasks"
BETTER_AUTH_SECRET="your-secret-key-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```
```bash
# Inicie o banco de dados
docker-compose up -d

# Execute migrations
npm run db:push

# Inicie o servidor
npm run dev
```

Acesse: **http://localhost:3000**

## 📝 Scripts
```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run db:push      # Sync schema com DB
npm run db:studio    # Interface Drizzle Studio
```

## ✨ Funcionalidades

- ✅ Autenticação (Sign Up/Sign In/Logout)
- ✅ CRUD completo de tarefas
- ✅ Status: Pendente, Em Progresso, Completa
- ✅ Dashboard com estatísticas
- ✅ Interface responsiva

## 📁 Estrutura
```
├── app/                 # Next.js App Router
│   ├── (auth)/         # Páginas de autenticação
│   ├── (dashboard)/    # Páginas protegidas
│   └── api/            # Endpoints
├── server/             # Backend (tRPC + DB)
├── lib/                # Validações e utils
└── components/         # Componentes UI
```
