# Supabase — PAF 2K26

Ce dossier contient la migration et le seed pour initialiser la base Supabase.

## Option 1 — SQL Editor (le plus simple)

1. Ouvre ton projet Supabase → **SQL Editor** → **New query**.
2. Copie-colle `migrations/20260419_init.sql`, clique **Run**.
3. Nouvelle query : copie-colle `seed.sql`, clique **Run**.

## Option 2 — CLI Supabase

```bash
# depuis la racine du projet Next.js
supabase link --project-ref <ref>
supabase db push              # applique la migration
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

## Générer le hash admin

Le seed insère `admin_password_hash = '<PLACEHOLDER_BCRYPT_HASH>'`. Tu dois le
remplacer par un vrai hash bcrypt du mot de passe (voir SPEC).

```bash
npm run hash-admin -- 'ton-mot-de-passe'
```

Copie la valeur retournée dans :

- `ADMIN_PASSWORD_HASH` dans Vercel / `.env.local` (priorité), **ou**
- `config.admin_password_hash` via le SQL editor :
  ```sql
  update public.config set value = '$2a$10$...'
   where key = 'admin_password_hash';
  ```

## RLS

Toutes les tables ont **RLS activée** avec uniquement une policy `service_role`.
Les API routes Next utilisent `SUPABASE_SERVICE_ROLE_KEY` pour lire/écrire ; le
client anon n'a aucun accès direct.
