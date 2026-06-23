# Explorer's Journal

Next.js editorial site with a protected admin area, Prisma, PostgreSQL, and multi-image entry publishing.

## Docker setup

Start the application and PostgreSQL together:

```bash
docker compose up --build
```

Open `http://localhost:3000`. The local admin password defaults to `admin` and
can be overridden before startup:

```bash
ADMIN_PASSWORD=your-password AUTH_SECRET=your-long-random-secret docker compose up --build
```

Database data and uploaded files are stored in named Docker volumes. Stop the
containers with `docker compose down`; add `--volumes` only when you also want
to delete the local data.

## Local setup

1. Copy `.env.example` values into your local environment.
2. Make sure `DATABASE_URL` points to PostgreSQL.
3. Run:

```bash
npm install
npm run db:migrate
npm run dev
```

Admin access is protected by:

- `AUTH_SECRET` for signing the session cookie
- `ADMIN_PASSWORD` for logging into `/admin/login`

## Railway deployment

Recommended Railway setup:

1. Create a PostgreSQL service.
2. Attach `DATABASE_URL` from that service to the Next.js app.
3. Set these app variables:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
GOOGLE_SITE_VERIFICATION=google-search-console-token
AUTH_SECRET=generate-a-long-random-secret
ADMIN_PASSWORD=use-a-strong-unique-password
ANTHROPIC_API_KEY=sk-ant-...
FILE_STORAGE_MODE=local
UPLOADS_SUBDIR=uploads
ENABLE_SEED_CONTENT=false
SERVER_ACTIONS_ALLOWED_ORIGINS=your-app.up.railway.app
```

4. Choose one file storage mode:

For Railway volume-backed local storage:

```bash
FILE_STORAGE_MODE=local
UPLOADS_SUBDIR=uploads
```

Mount a Railway volume to `/app/public/uploads` so uploaded images persist between deploys.

For S3-compatible bucket storage on Railway or an external provider:

```bash
FILE_STORAGE_MODE=s3
S3_BUCKET=your-bucket-name
S3_ENDPOINT=https://your-s3-endpoint
S3_REGION=auto
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_KEY_PREFIX=uploads
S3_FORCE_PATH_STYLE=true
```

For private buckets, omit `S3_PUBLIC_BASE_URL`. The app will upload files through
the S3 API and serve them back through `/api/media/...`.

`ANTHROPIC_API_KEY` is required for automatic article translations. It must be a
server-only Railway variable, without a `NEXT_PUBLIC_` prefix.

5. Set the Railway pre-deploy command to:

```bash
npm run db:migrate:deploy
```

6. Start command:

```bash
npm run start
```

## Security notes

- `/admin` now requires a signed `httpOnly` session cookie.
- Server Actions verify admin auth server-side and do not rely on client state.
- Default seed content is disabled in production unless `ENABLE_SEED_CONTENT=true`.
- Security headers are configured in `next.config.ts`.
- Uploads accept common image formats supported by the publishing form.
- Uploads can be stored either on a Railway volume or an S3-compatible bucket, depending on `FILE_STORAGE_MODE`.

## Post-deploy checklist

1. Point your custom domain at Railway and set `NEXT_PUBLIC_SITE_URL` to that exact HTTPS domain.
2. Set `GOOGLE_SITE_VERIFICATION` after adding the property in Google Search Console.
3. Confirm `/robots.txt`, `/sitemap.xml`, `/privacy`, and `/terms` all resolve publicly.
4. Run `npm run db:migrate:deploy` through Railway pre-deploy and verify the first boot can reach PostgreSQL.
5. Open PageSpeed Insights and Lighthouse against the production home page and one article page to validate LCP, CLS, and INP.
6. In Search Console, submit the sitemap and inspect at least `/`, one section page, and one article page.
