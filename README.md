# vercel-demo-web

Formulár na nezáväzný dopyt + prehľad dopytov pre administrátora.

- `/` – zákazník vyplní dopyt (uloží sa do Supabase tabuľky `inquiries`)
- `/admin` – prehľad dopytov, zmena stavu a interná poznámka (prihlásenie odkazom na e-mail)

Stack: Next.js (Vercel) + Supabase (projekt `hozex`). Prístup k dopytom majú len používatelia v tabuľke `public.admins`.

Lokálne: `vercel env pull .env.local` a `npm run dev`.
