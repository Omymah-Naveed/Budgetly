# Budgetly Frontend

React + Vite client for the Budgetly expense tracker.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment

```env
VITE_API_URL=http://localhost:5000/api
```

## Scripts

```bash
npm run dev      # Development server
npm run lint     # ESLint
npm run build    # Production build
npm run preview  # Preview production build
```

## Vercel

Use `frontend` as the project root directory, Vite as the framework preset, `npm run build` as the build command, and `dist` as the output directory. Set `VITE_API_URL` to the deployed API URL, including `/api`.

The included `vercel.json` rewrites client-side routes such as `/reset-password` to `index.html`.
