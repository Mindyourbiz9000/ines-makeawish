# Ines - Make-A-Wish · Donation goals

Page web des donation goals pour le stream caritatif Make-A-Wish d'Ines.
Les viewers voient les paliers en direct, et la page `/admin` permet de cocher
les paliers au fur et à mesure.

**Stack** : Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
(Postgres) · Vercel.

## Ce que ça fait

- `/` : page publique qui affiche tous les paliers avec leur statut (fait / pas fait)
- `/admin` : mêmes paliers mais avec des checkboxes éditables
- Les deux pages **rafraîchissent automatiquement toutes les 3 secondes** :
  quand tu coches un palier sur `/admin`, les viewers sur `/` voient la mise
  à jour en quelques secondes.

> ⚠️ **Pas d'authentification** : la page `/admin` est ouverte à qui connaît
> l'URL. Ne partage pas ce lien publiquement pendant le stream — garde-le pour
> toi. C'est la contrepartie d'une config minimale.

---

## 1. Créer le projet Supabase

1. Va sur https://supabase.com → **New project**
2. Note depuis *Settings → API* :
   - **Project URL** → `https://xxxxxxxxxxxx.supabase.co`
   - **Secret key** (`sb_secret_...`) → côté serveur uniquement, **jamais** dans le code

### Créer la table + seed

1. Supabase → **SQL Editor** → **New query**
2. Copie/colle le contenu de [`supabase/migrations/0001_donation_goals.sql`](supabase/migrations/0001_donation_goals.sql)
3. Clique sur **Run**

Ça crée la table `donation_goals` et insère les 11 paliers.

---

## 2. Lancer en local

```bash
npm install
cp .env.example .env.local
# édite .env.local avec tes 2 valeurs Supabase
npm run dev
```

- http://localhost:3000 → page publique
- http://localhost:3000/admin → page d'administration

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

---

## 4. Utilisation pendant le stream

1. Ouvre `https://<ton-site>.vercel.app/admin` dans un onglet
2. Quand un palier est atteint, coche la case → les viewers voient le
   changement sous 3 secondes sur la page publique

---

## Modifier les paliers

- **Rapide** : Supabase → **Table Editor** → `donation_goals`, édite en direct.
- **Propre** : édite [`supabase/migrations/0001_donation_goals.sql`](supabase/migrations/0001_donation_goals.sql)
  et [`lib/goals.ts`](lib/goals.ts), puis relance la migration dans le SQL Editor.

---

## Structure

```
app/
  page.tsx              # Page publique /
  admin/page.tsx        # Page /admin (éditable, pas d'auth)
  api/goals/route.ts    # GET (polling) + PATCH (toggle)
  globals.css
  layout.tsx
components/
  GoalList.tsx          # Liste + checkboxes + polling 3s
lib/
  goals.ts              # Liste statique (source pour le seed)
  supabase/
    server.ts           # Client Supabase serveur (secret key)
    types.ts            # Types TS pour la DB
supabase/
  migrations/0001_donation_goals.sql
```
