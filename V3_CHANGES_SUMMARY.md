# Améliorations v3 — Récap

## Fichiers modifiés / ajoutés

### Ajoutés
- `components/Logo.tsx` — Composant `<Logo />` réutilisable qui sert le logo officiel Manga Paradise (WebP 10 KB / JPG fallback automatique via `next/image`).
- `app/icon.jpg` — Copie du logo officiel pour la convention Next.js (favicon/touch-icon auto-généré).

### Modifiés
- `app/layout.tsx` — `metadata.icons` pointent sur le logo officiel (webp + jpg apple).
- `app/page.tsx` (landing) — Bannière horizontale en TOP (Image priority, ratio préservé), hero utilise `<Logo />` au lieu du torii SVG dans le cercle blanc.
- `app/congrats/page.tsx` — Logo officiel dans le disque blanc géant au lieu du torii SVG.
- `app/onboarding/page.tsx` — Textes entièrement réécrits selon spec (liste 1-5 de la section "Comment ça marche", section "Épreuve finale" avec les 10 rôles, astuces mises à jour, récompenses = figurine TSUME).
- `components/TreasureTrail.tsx` —
  - Retiré `backdrop-blur-md` sur les 2 headers sticky → `bg-white/95`.
  - Retiré la transition `transition-[padding]` du header (évite les repaints au scroll).
  - Retiré les 5 `<Sakura animate-float-slow>` de la décoration de fond (remplacé par pattern SVG statique via `.map-bg`).
  - `animate-pulse-ring` sur stand actif : conditionné à `md:block` (desktop uniquement, et `motion-safe:`).
  - Retiré `motion-safe:animate-pulse` sur le trophée du footer.
  - Intégré `<Logo />` dans le header sticky (à gauche du titre, taille réactive selon `compact`).
  - **Barre de progression segmentée cliquable** : chaque segment `done`/`active` est un vrai `<button>` qui navigue vers `/map/[standId]` ; segment `locked` est `disabled` / `cursor-not-allowed`. Segment `active` a un `ring-2 ring-mp-red`.
  - Tooltip natif via `title="Étape X — terminée/en cours/verrouillée"`.
- `app/map/MapView.tsx` — Classe `.map-bg` appliquée au `<main>` (wallpaper sakura subtil + fond bleuté).
- `app/globals.css` — Ajout de la classe `.map-bg` avec pattern SVG inline (3 fleurs sakura par tuile de 180 px, opacity 0.14), `background-attachment: local` pour ne PAS casser le scroll iOS.
- `components/EnigmaModal.tsx` —
  - Nouveau type `ModalMode = "active" | "review"`, inféré depuis `stand.already` ou forcé via prop `mode`.
  - **Mode review** : affiche badge "Déjà trouvé" + personnage (Barlow italic) + anime + stand, masque le formulaire, bouton "Retour à la carte".
  - **Navigation indices** : composant `<HintTabs>` avec onglets "Indice 1" / "Indice 2" + dots centraux, navigation libre dans les deux sens.
  - Indice 2 reste verrouillé (cursor-not-allowed, tab disabled) tant que l'utilisateur n'a pas raté une fois ; en mode review, il est toujours déverrouillé.
  - Champ input renommé "Nom du personnage (prénom + nom complet)".
  - **Message spécifique "prénom + nom complet"** : affiché en complément de l'erreur standard quand l'API renvoie `hint_full_name: true`.
  - Petit logo Manga Paradise ajouté en haut de la modale.
- `app/api/stand/[id]/route.ts` — Retourne `character_name` et `anime_name` uniquement si `already === true` (pour le mode review, sans fuite anti-triche sur les stands non validés).
- `app/api/validate/route.ts` — Sur réponse incorrecte, détecte si l'utilisateur a saisi < 2 mots alors que le nom attendu en contient ≥ 2, renvoie `hint_full_name: true`.

## Récap chantiers

| # | Chantier | Status | Note |
|---|----------|--------|------|
| 1 | Logo Manga Paradise partout | ✅ Fait | `<Logo />` utilisé dans landing hero, congrats, header map, modale. Favicon via `app/icon.jpg` + `metadata.icons`. ToriiIcon gardé comme décoration secondaire. |
| 2 | Bannière horizontale en TOP de la landing | ✅ Fait | `<Image>` webp, priority, `className="w-full h-auto"`, ratio 4249×1080 préservé. |
| 3 | Onboarding textes réécrits | ✅ Fait | Tous les textes remplacés à l'identique des specs (bullets 1-5, épreuve finale + 10 rôles, astuces, récompenses TSUME). |
| 4 | Map : fix perf scroll | ✅ Fait | `backdrop-blur-md` → `bg-white/95`, suppression transition padding, suppression sakura animées, pulse/pulse-ring conditionnés. |
| 5 | Map : background subtil | ✅ Fait | `.map-bg` = SVG sakura inline (data URI), `background-attachment: local` pour perf iOS. |
| 6 | Barre de progression cliquable | ✅ Fait | Chaque segment est un `<button>` avec aria-disabled pour locked, ring mp-red sur active, tooltip title. Click → `/map/[standId]` → ouvre EnigmaModal (mode review auto pour done, active sinon). |
| 7 | EnigmaModal mode review + nav indices | ✅ Fait | `ReviewContent` + `HintTabs` (2 onglets + dots). API stand étendue pour renvoyer `character_name`/`anime_name` si déjà validé. |
| 8 | Message "prénom + nom complet" sur erreur | ✅ Fait | Détection côté API (`hint_full_name`), affichage côté front dans un bloc warn sous l'input. |

## Statut

**PRÊT POUR DÉPLOIEMENT.**

Aucun paquet npm ajouté. Pas de lancement de serveur. Pas de commit.

### Points d'attention pour le déploiement
- `app/icon.jpg` repose sur la convention Next.js App Router (auto-détection). Si ça clashe avec `metadata.icons` explicite, enlever l'un des deux. Laissé tel quel par défaut — les deux devraient cohabiter sans souci (l'`icon.jpg` génère le favicon de base, `metadata.icons` ajoute les variantes webp + apple-touch-icon).
- Le pattern SVG `.map-bg` est lisible et léger (~1.5 KB, purement CSS, aucun asset raster).
- Les endpoints API `/api/stand/[id]` et `/api/validate` voient leur payload étendu (nouveaux champs optionnels), rétro-compatibles avec tout client existant.
- Pas de tests automatisés exécutés (node_modules non présent dans la sandbox ; pas d'install autorisée).
