# Realtime Chat App

Next.js 14 (App Router) + TypeScript project with Tailwind CSS, shadcn/ui, Clerk, and Convex.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in:

   - Clerk: [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys
   - Convex: run `npx convex dev` once to create a project and get `NEXT_PUBLIC_CONVEX_URL`

3. **Run development**

   ```bash
   npm run dev
   ```

   For Convex realtime backend (separate terminal):

   ```bash
   npm run convex:dev
   ```

## Stack

- **Next.js 14** – App Router, React Server Components
- **TypeScript** – Strict mode
- **Tailwind CSS** – Design tokens, dark mode (`class` strategy)
- **shadcn/ui** – Components (see `components.json` for aliases)
- **Clerk** – Authentication
- **Convex** – Database + realtime backend
- **date-fns** – Date formatting
- **lucide-react** – Icons

## Project structure

```
app/              # App Router routes and layouts
components/
  ui/             # shadcn/ui primitives
  layout/         # Layout components
  chat/           # Chat feature components
  sidebar/        # Sidebar components
  auth/           # Auth-related components
lib/              # Shared utilities and config
convex/           # Convex functions and schema
hooks/            # React hooks
utils/            # Pure utilities
```

## Scripts

- `npm run dev` – Next.js dev server
- `npm run build` – Production build
- `npm run start` – Production server
- `npm run lint` – ESLint
- `npm run convex:dev` – Convex dev mode
- `npm run convex:deploy` – Deploy Convex
