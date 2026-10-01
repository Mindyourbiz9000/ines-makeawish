# InesPNJ

Site d'InesPNJ : liens, live Twitch, stats, FAQ et setup.

**Stack** : Next.js 14 (App Router) · TypeScript · Tailwind CSS · Vercel.

Aucune base de données ni variable d'environnement n'est nécessaire. Les stats
SullyGnome sont mises en cache 6h par Next.js (`unstable_cache`).

## Lancer en local

```bash
npm install
npm run dev
```

http://localhost:3000

## Déployer

Chaque push sur `main` est déployé en production par Vercel.
