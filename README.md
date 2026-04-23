# Chasse au Trésor PAF 2K26 — Manga Paradise

Web app **Next.js 14** + **Supabase** pour animer une chasse au trésor de 10
étapes au Play Azur Festival 2026 à Nice. Chaque stand propose une énigme ;
à la clé, une figurine officielle à gagner au tirage au sort.

## Stack

- **Next.js 14** (App Router, TypeScript strict)
- **Tailwind CSS** + composants UI custom (pas de shadcn/ui pour rester léger)
- **Framer Motion** pour les animations (carte, modale, toasts)
- **Supabase** (PostgreSQL + RLS) — accès serveur via `service_role`
- **next-pwa** — manifest + service worker
- **fastest-levenshtein** pour le fuzzy matching
- **jose** (JWT) — sessions participant & admin signées HS256 dans des cookies
  httpOnly
- **qrcode** pour générer l'affiche QR des stands
- **bcryptjs** pour le hash du mot de passe admin
- **canvas-confetti** pour l'écran de victoire

## Démarrage local (VS Code)

```bash
# 1. Copie le template d'env et remplis les valeurs (voir plus bas)
cp .env.example .env.local

# 2. Installe les dépendances
npm install

# 3. Lance le serveur de dev
npm run dev
# → http://localhost:3000
```

### Variables d'environnement (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon (pas critique, RLS bloque tout) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** — utilisé côté serveur uniquement |
| `ADMIN_PASSWORD_HASH` | bcrypt hash du mot de passe admin |
| `SESSION_SECRET` | HMAC ≥ 32 chars pour les cookies participants |
| `ADMIN_SESSION_SECRET` | HMAC ≥ 32 chars pour les cookies admin |
| `NEXT_PUBLIC_SITE_URL` | URL publique (utilisée par le QR code) |

### Générer le hash admin

```bash
npm run hash-admin -- 'W2y0YP6F1iVP9eA5fBSN'
# copie la sortie dans ADMIN_PASSWORD_HASH
```

## Base de données Supabase

1. Créer le projet Supabase.
2. **SQL Editor** → exécuter `supabase/migrations/20260419_init.sql` (tables + RLS).
3. **SQL Editor** → exécuter `supabase/seed.sql` (10 stands + config).
4. Mettre à jour le hash admin soit via `ADMIN_PASSWORD_HASH` (recommandé),
   soit directement dans la table `config`.

Plus de détails dans [`supabase/README.md`](./supabase/README.md).

## Déploiement Vercel

1. Importer le repo dans Vercel (framework détecté : Next.js).
2. Dans **Settings → Environment Variables**, ajouter toutes les variables
   listées ci-dessus (y compris pour les envs Preview).
3. Configurer le domaine et redéfinir `NEXT_PUBLIC_SITE_URL` en conséquence.
4. Vérifier que **RLS est bien activée** côté Supabase (elle l'est par la
   migration) et que la `service_role` est toujours privée.

## Parcours utilisateur

1. QR code imprimé → Landing `/`
2. `/inscription` : formulaire → POST `/api/register` → cookie `mp_session` posé
3. `/map` : carte au trésor + 10 croix (vertes = validées / pulsantes =
   actives / grisées = verrouillées)
4. Clic sur la croix active → `/map/[standId]` : modale avec 2 indices +
   champ réponse
5. Submit → POST `/api/validate` : fuzzy match sur le nom du personnage,
   enregistre dans `progress`
6. 10/10 validés → `/final` : devine l'anime caché (ANGEL BEATS)
7. Victoire → `/congrats` : confettis + partage + éligible au tirage

## Modifier le contenu

- **Changer un stand, un indice, une réponse** : modifier `supabase/seed.sql`
  et re-jouer l'insert (les `ON CONFLICT` mettent à jour).
- **Changer le code secret final** :
  ```sql
  update public.config set value = 'MON NOUVEAU CODE' where key = 'final_anime';
  ```
- **Changer le mot de passe admin** : régénérer le hash (`npm run hash-admin`)
  et mettre à jour `ADMIN_PASSWORD_HASH` sur Vercel.
- **Ajuster les coordonnées des croix** : colonnes `map_x` / `map_y` (0-100,
  en pourcentages).

## Export participants

1. Accès `/admin/login` → saisir le mot de passe.
2. Le dashboard affiche les stats, la progression par étape, la table des
   participants.
3. Bouton **Exporter CSV** : télécharge tous les inscrits (UTF-8 BOM, Excel-friendly).
4. Bouton **QR code** : affiche et télécharge le QR code vers le site public.

## Architecture

```
app/
├─ app/
│  ├─ api/                  # Route handlers (Node runtime)
│  │  ├─ register/          # Inscription + cookie session
│  │  ├─ me/                # Profil + progression
│  │  ├─ stand/[id]/        # Récupère les infos d'un stand (sans spoiler)
│  │  ├─ validate/          # Valide une réponse (fuzzy + rate limit)
│  │  ├─ final/             # Valide le code anime + marque éligible
│  │  └─ admin/             # Stats, participants, export CSV, QR, login/logout
│  ├─ admin/                # Dashboard organisateur + login
│  ├─ map/                  # Carte au trésor + route imbriquée [standId]
│  ├─ final/                # Écran final avec les 10 personnages
│  ├─ congrats/             # Écran de victoire (confettis, partage)
│  ├─ inscription/          # Formulaire d'inscription
│  ├─ layout.tsx            # Fonts (Cinzel + Inter), ToastProvider
│  └─ globals.css           # Design system (parchemin, or, rouge)
├─ components/
│  ├─ TreasureMap.tsx       # SVG overlay + 10 croix animées
│  ├─ EnigmaModal.tsx       # Modale Framer Motion 2 indices + réponse
│  ├─ Toast.tsx             # Provider + hook useToast
│  ├─ ProgressBar.tsx       # Barre X/10 dorée
│  ├─ Confetti.tsx          # Wrapper canvas-confetti (dynamic import)
│  ├─ ShareButtons.tsx      # Web Share API + fallbacks
│  └─ ui/                   # Button, Input, Card, Dialog primitifs
├─ lib/
│  ├─ supabase.ts           # Clients anon + admin (service_role)
│  ├─ session.ts            # JWT participant + admin (jose)
│  ├─ edgeAuth.ts           # Verif admin pour le middleware Edge
│  ├─ fuzzyMatch.ts         # Normalisation + Levenshtein adaptatif
│  ├─ rateLimit.ts          # 20 req/min/IP best-effort
│  ├─ stands.ts             # Helpers serveur (nextStand, attempts…)
│  └─ types.ts              # Types partagés
├─ middleware.ts            # Protège /admin/*
├─ supabase/
│  ├─ migrations/20260419_init.sql
│  ├─ seed.sql
│  └─ README.md
├─ public/
│  ├─ manifest.json         # Manga Paradise, couleur #c0392b
│  ├─ map/treasure-map-bg.svg
│  ├─ logos/manga-paradise.svg
│  └─ icons/                # icon-192, icon-512, favicon, apple-touch
├─ scripts/
│  └─ hash-password.mjs     # npm run hash-admin -- '<pwd>'
└─ next.config.mjs          # next-pwa
```

## Sécurité

- **RLS activée** sur toutes les tables Supabase ; aucun accès direct depuis
  le navigateur.
- **service_role_key** jamais exposée : importée uniquement dans les routes
  API (import `"server-only"` dans `lib/stands.ts`, `lib/session.ts`).
- **Sessions signées** : HS256 via `jose`, cookies `httpOnly`, `secure` en
  prod, `SameSite=Lax`, TTL 7j (participant) / 8h (admin).
- **Anti-triche** : `/api/validate` vérifie que le `standId` demandé est bien
  la prochaine étape du participant ; le nom du personnage n'est jamais envoyé
  au client avant validation.
- **Rate limit** : 20 validations/minute/IP (in-memory, best-effort).
- **Double inscription** : même email → renvoie la session existante, pas
  d'erreur.

## Accessibilité

- Contrastes AA (parchemin `#f5e6c8` + ink `#3a2818`).
- `aria-label` sur chaque croix (statut + instruction).
- Navigation clavier : Tab entre croix, Enter pour ouvrir.
- `focus-visible` doré sur tous les éléments interactifs.
- `aria-live` sur les toasts.

## PWA

Le manifest et le service worker (via next-pwa) sont générés automatiquement
au build. Désactivés en dev. La couleur de thème est `#c0392b`.

## Licence

Usage interne Manga Paradise.
