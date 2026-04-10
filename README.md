# Ines - Make-A-Wish · Donation goals

Page web des donation goals pour le stream caritatif Make-A-Wish d'Ines.
Les viewers voient les paliers en direct, et la page `/admin` (protégée par
mot de passe) permet de cocher les paliers au fur et à mesure.

**Stack** : Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
(Postgres + Realtime) · Vercel.

## Ce que ça fait

- `/` : page publique qui affiche tous les paliers de don avec leur statut (fait / pas fait)
- `/admin` : page protégée par mot de passe, avec les mêmes paliers + des checkboxes
- Les changements sont **temps réel** : quand tu coches un palier sur `/admin`,
  les viewers de `/` voient la mise à jour instantanément (via Supabase Realtime).

---

## 1. Créer le projet Supabase

1. Va sur https://supabase.com → **New project**
2. Choisis une région proche (Frankfurt / Paris)
3. Note le **Project URL** et les clés dans *Settings → API* :
   - `anon public` (utilisée côté navigateur)
   - `secret` (clé `sb_secret_...`, **jamais** côté navigateur)

### Créer la table + seed

1. Supabase → **SQL Editor** → **New query**
2. Copie/colle le contenu de [`supabase/migrations/0001_donation_goals.sql`](supabase/migrations/0001_donation_goals.sql)
3. Clique sur **Run**

Ça crée la table `donation_goals`, active Row Level Security (lecture publique,
écriture interdite côté client) et insère les 11 paliers.

---

## 2. Lancer en local

```bash
# 1. Installer les dépendances
npm install

# 2. Créer ton fichier .env.local (ne pas le committer)
cp .env.example .env.local
# puis édite .env.local avec tes valeurs Supabase + un ADMIN_PASSWORD

# 3. Démarrer le dev server
npm run dev
```

Ouvre http://localhost:3000 pour la page publique, et
http://localhost:3000/admin pour la page d'administration.

---

## 3. Déployer sur Vercel

1. Pousse ce repo sur GitHub (déjà fait si tu lis ce README depuis GitHub)
2. Va sur https://vercel.com → **Add New… → Project**
3. Importe le repo `mindyourbiz9000/ines-makeawish`
4. Dans l'écran **Environment Variables**, ajoute :

   | Variable                        | Valeur                                        |
   |---------------------------------|-----------------------------------------------|
   | `NEXT_PUBLIC_SUPABASE_URL`      | URL du projet Supabase                        |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé **anon public** Supabase                  |
   | `SUPABASE_SECRET_KEY`           | Clé **secret** Supabase (`sb_secret_...`)     |
   | `ADMIN_PASSWORD`                | Un mot de passe fort de ton choix             |

5. Clique sur **Deploy**.

### ⚠️ Sécurité

- `SUPABASE_SECRET_KEY` est une clé **serveur uniquement**. Ne la préfixe
  jamais avec `NEXT_PUBLIC_` et ne la mets jamais dans le code source.
- Si tu penses qu'une clé secrète a fuité (envoyée par chat, email, commitée,
  etc.) → va dans Supabase *Settings → API* et **régénère** la clé immédiatement.

---

## 4. Utilisation pendant le stream

1. Ouvre `https://<ton-site>.vercel.app/admin` dans un onglet
2. Connecte-toi avec `ADMIN_PASSWORD`
3. Quand un palier est atteint, coche la case → tous les viewers voient le
   changement en direct sur la page publique

---

## Modifier les paliers

Les paliers vivent dans la DB Supabase. Pour en ajouter ou en modifier :

- **Option rapide** : Supabase → **Table Editor** → `donation_goals`, édite en direct.
- **Option propre** : édite [`supabase/migrations/0001_donation_goals.sql`](supabase/migrations/0001_donation_goals.sql)
  (et [`lib/goals.ts`](lib/goals.ts) pour rester cohérent), puis réexécute la
  migration dans le SQL Editor.

---

## Structure

```
app/
  page.tsx              # Page publique /
  admin/page.tsx        # Page /admin (protégée)
  admin/LoginForm.tsx   # Formulaire de login
  api/admin/login/route.ts  # POST /api/admin/login → set cookie
  api/goals/route.ts    # PATCH /api/goals → toggle un palier
  globals.css
  layout.tsx
components/
  GoalList.tsx          # Liste des paliers + checkboxes + Realtime
lib/
  goals.ts              # Liste statique (source pour le seed)
  supabase/
    client.ts           # Client navigateur (anon key)
    server.ts           # Client serveur (secret key)
    types.ts            # Types TS pour la DB
supabase/
  migrations/0001_donation_goals.sql
```
