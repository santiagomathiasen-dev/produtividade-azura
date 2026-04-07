# Backend Node.js + Express + Prisma

## Setup

1. Copie `.env.example` para `.env`.
2. Instale dependências:
   ```bash
   npm install
   ```
3. Gere o client do Prisma:
   ```bash
   npm run prisma:generate
   ```
4. Rode migração:
   ```bash
   npm run prisma:migrate -- --name init
   ```
5. Suba a API:
   ```bash
   npm run dev
   ```

## Requisitos implementados

- Modelos `tenants`, `users` e `refresh_tokens` com Prisma.
- Login com `bcrypt`, `access_token` e `refresh_token`.
- Middleware `authenticate` injeta `tenant_id` da sessão JWT no contexto da requisição.
- Autorização por perfil (`ADMIN`, `OPERADOR`) via middleware `authorize`.
- Filtro obrigatório por `tenant_id` em todas as queries do modelo de domínio (`users`) no Prisma middleware.
