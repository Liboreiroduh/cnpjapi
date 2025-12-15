# Next.js CNPJ lookup app

Aplicação Next.js 15 com Prisma/SQLite e Tailwind. Ajustada para rodar com Node.js (npm) e deployment no Render usando o output standalone gerado pelo `next build`.

## Requisitos de ambiente

- Node.js 18+
- Variáveis:
  - `DATABASE_URL=file:./db/dev.db`

## Scripts

```bash
# Instalação
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção (usa $PORT se definido)
npm run start
```

O build gera `.next/standalone` com os assets estáticos copiados; `npm run start` inicializa o servidor com Node.js respeitando a porta fornecida pelo ambiente.
