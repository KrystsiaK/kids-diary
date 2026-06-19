# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run lint     # ESLint
```

Prisma:
```bash
npx prisma migrate dev --name <name>   # create and apply migration
npx prisma migrate deploy              # apply migrations in CI/prod
npx prisma generate                    # regenerate client after schema change
npx prisma studio                      # visual DB browser
```

## Architecture

**Stack:** Next.js 16.2 · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 · PostgreSQL

### Next.js 16 — important differences from earlier versions

This is **not** the Next.js 13-15 you may know. Read `node_modules/next/dist/docs/` before writing code. Key differences:

- **`params` is a `Promise`** — always `await params` in page/layout components:
  ```tsx
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  }
  ```
- **Instant navigations** require exporting `unstable_instant` from the route _in addition to_ using `<Suspense>`. `Suspense` alone is not enough — see `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`.
- **Tailwind CSS v4** uses `@import "tailwindcss"` (no config file required). Theme tokens go in `globals.css` under `@theme inline { ... }`. See `src/app/globals.css`.
- **Prisma client** is generated into `src/generated/prisma` (not `node_modules/@prisma/client`). Always import from `@/generated/prisma`.

### Directory layout

```
src/
  app/          # App Router — pages, layouts, route handlers
  lib/
    prisma.ts   # Prisma singleton (use this everywhere, never new PrismaClient() inline)
  generated/
    prisma/     # auto-generated Prisma client (gitignored, run prisma generate)
prisma/
  schema.prisma # data models go here
prisma.config.ts # Prisma config — reads DATABASE_URL from env
```

### Data access pattern

Import the singleton from `src/lib/prisma.ts`:
```ts
import { prisma } from "@/lib/prisma"
```

Database queries run in Server Components or Route Handlers (`app/**/route.ts`). Never import `prisma` in Client Components (`"use client"`).

### Environment variables

- `.env.local` — local dev (gitignored, loaded by Next.js automatically)
- `.env` — read only by Prisma CLI via `prisma.config.ts` (dotenv)
- `NEXT_PUBLIC_` prefix required to expose a variable to the browser

### Server vs Client Components

All components are **Server Components by default**. Add `"use client"` only when the component needs state, event handlers, `useEffect`, or browser APIs. Pass server-fetched data down as props.

### Animations

**Always use Framer Motion** (`framer-motion@12`) for all animations and transitions — never use raw CSS `transition`/`animation` or `@keyframes` for interactive/component animations.

- Any animated component must have `"use client"` (Framer Motion requires it)
- Use `motion.*` components (`motion.div`, `motion.button`, etc.) with `initial`, `animate`, `exit`, `whileHover`, `whileTap` props
- Wrap conditionally rendered elements with `<AnimatePresence>` for exit animations
- Respect `prefers-reduced-motion` — use `useReducedMotion()` hook to disable or reduce motion
- Duration guidelines (from ui-ux-pro-max skill): micro-interactions 150–300ms, complex transitions ≤400ms
- Prefer `transform`/`opacity` variants — never animate `width`, `height`, `top`, `left`

```tsx
"use client"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
/>
```
