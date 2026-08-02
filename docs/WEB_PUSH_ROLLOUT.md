# Render Web Push rollout

Use this order so notifications cannot dispatch before the database, API, and preview client are ready.

## 1. Generate and store VAPID credentials

Generate one VAPID pair locally with `npx web-push generate-vapid-keys`. Store the values only in Render secret environment variables:

- `WEB_PUSH_VAPID_PUBLIC_KEY`
- `WEB_PUSH_VAPID_PRIVATE_KEY`
- `WEB_PUSH_SUBJECT` (for example, `mailto:support@example.com`)

Never commit the private key or paste it into Vercel. The web client reads only the public key through the authenticated API.

## 2. Database migration

Take a Render PostgreSQL backup, then run:

```bash
npx prisma migrate deploy
```

The migration adds `PushSubscription`, `NotificationDelivery`, the delivery-status enum, ownership foreign keys, and the unique delivery constraint. It does not alter mobile tables or endpoints.

## 3. Deploy API with dispatcher disabled

Deploy `develop` to a non-production Render service first. Verify:

- `GET /api/v1/notifications/vapid-public-key` requires authentication.
- A user can create and delete only their own subscription.
- Reposting the same endpoint updates one row rather than creating duplicates.
- Existing mobile authentication, semesters, courses, GPA, planner, and data-transfer tests still pass.

## 4. Validate Vercel preview

Against the preview deployment, test permission denied, permission granted, subscription refresh, logout/login, due-task payload, and the `/th/planner` notification deep link. Confirm the refresh token never appears in localStorage or IndexedDB.

## 5. Scheduled job

Create a Render cron/scheduled job from the same backend repository and environment. Use:

```bash
npm run notifications:dispatch
```

Run every minute or the shortest interval supported by the selected Render plan. Keep it disabled until preview validation is complete. The one-shot dispatcher:

- creates idempotent delivery rows using a database unique constraint;
- claims pending rows with a status guard;
- retries transient errors at bounded intervals;
- recovers stale claims;
- removes subscriptions that return HTTP 404 or 410;
- stops after three delivery attempts.

## 6. Production observation

Enable the job after promoting the web and backend releases. Watch API/worker logs and the `NotificationDelivery` failure rate. If delivery errors spike, disable only the scheduled job; the core mobile and web planner APIs remain available.
