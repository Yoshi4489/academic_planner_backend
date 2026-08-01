# Backend setup and deployment

Copy `.env.example` to `.env`, use strong independent access/refresh secrets,
and configure PostgreSQL. Never commit `.env`.

```powershell
npm ci
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Verify with `npm test`, `npx tsc --noEmit`, `npm run build`, and
`npx prisma validate`. Health endpoints are `/health/live` and `/health/ready`.

## Render

1. Use separate staging and production databases/services.
2. Configure every variable from `.env.example`.
3. Build with `npm ci && npm run build`.
4. Run `npx prisma migrate deploy` before deploying application code.
5. Start with `npm start` and use `/health/ready` for health checks.
6. Rehearse migrations against a recent staging backup.

For Prisma `P1000` or `P1010`, verify the database user, password, database
name, SSL URL, and service environment. Do not hide configuration failures with
automatic registration retries.

Before production schema changes, take and verify a backup. Roll application
code back only when migrations are backward compatible. For destructive
rollback, restore into a new database and validate staging before repointing
production.

Logs may contain request IDs but must never contain passwords, OTPs, refresh
tokens, SMTP credentials, or exported planner payloads.
