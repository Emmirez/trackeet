# Trackeet Frontend

## Stack
- React 18 + Vite
- Tailwind CSS
- Zustand (state)
- TanStack Query (data fetching)
- React Hook Form + Yup
- Recharts (charts)
- Framer Motion (animations)
- Lucide React (icons)

## Setup
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## API
Proxied to http://localhost:5000 (backend)

## Structure
src/
  layouts/         # DashboardLayout, AdminLayout
  pages/           # All pages
  store/           # Zustand stores
  services/        # API calls
  utils/           # helpers
