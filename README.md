# InesPNJ

Site d'InesPNJ : home (liens, live Twitch, stats, FAQ, événements passés) et
boutique `/shop` (catalogue, commandes, admin).

**Stack** : Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
(Postgres) · Vercel.

---

## 1. Créer le projet Supabase

1. Va sur https://supabase.com → **New project**
2. Note depuis *Settings → API* :
   - **Project URL** → `https://xxxxxxxxxxxx.supabase.co`
   - **Secret key** (`sb_secret_...`) → côté serveur uniquement, **jamais** dans le code

Les migrations SQL sont dans [`supabase/migrations/`](supabase/migrations/).

---

## 2. Lancer en local

```bash
npm install
cp .env.example .env.local
# édite .env.local avec tes 2 valeurs Supabase
npm run dev
```

- http://localhost:3000 → page publique
- http://localhost:3000/shop → boutique

---

## 3. Déployer sur Vercel

1. Pousse ce repo sur GitHub (déjà fait)
2. Vercel → **Add New… → Project** → importe `mindyourbiz9000/ines-makeawish`
3. Dans **Environment Variables**, ajoute **les 2 seules variables nécessaires** :

   | Variable              | Valeur                                         |
   |-----------------------|------------------------------------------------|
   | `SUPABASE_URL`        | URL du projet Supabase                         |
   | `SUPABASE_SECRET_KEY` | Clé **secret** Supabase (`sb_secret_...`)      |

4. Clique sur **Deploy**.

### ⚠️ Sécurité

- `SUPABASE_SECRET_KEY` est une clé **serveur uniquement**. Ne la préfixe
  jamais avec `NEXT_PUBLIC_` et ne la mets jamais dans le code source.
- Si une clé secrète a fuité → Supabase *Settings → API* → **révoque** et
  régénère la clé, puis mets à jour Vercel.
