-- =============================================================
--  PAF 2K26 — Seed : 10 stands ANGEL BEATS + config.
--  Idempotent : utilise ON CONFLICT pour pouvoir rejouer.
-- =============================================================

-- ---------- STANDS ----------
insert into public.stands
  (id, order_index, name, code, hint_1, hint_2, character_name, anime_name, initial, map_x, map_y)
values
  (1, 1, 'Evantasia', 'A9',
   'Vous ne pensez pas que c''est un événement de partir en Asie ? Le prochain personnage vous y attend.',
   'Que se passe-t-il si vous utilisez un éventail ? Faites-le en Asie pour poursuivre votre route.',
   'Armin Arlert', 'Shingeki no Kyojin', 'A', 15, 78),

  (2, 2, 'Hunter Quest', 'E5',
   'Partez en quête du chasseur qui rôde au Play Azur ? Il vous confiera un nouveau personnage.',
   'Je ne sais pas si on y trouve des fusils, des peaux de bêtes ou des trophées, mais il y aura sans doute le personnage que vous cherchez.',
   'Nagisa Shiota', 'Assassination Classroom', 'N', 28, 62),

  (3, 3, 'Sophia Tech', 'S3',
   'Je ne savais pas qu''on faisait des cours de techno en Bulgarie ? Vous devriez y jeter un œil, non ?',
   'La mère de Yuri dans l''anime Arte fait d''excellents cours. Vous ne devriez pas les rater, croyez-moi.',
   'Gojo Satoru', 'Jujutsu Kaisen', 'G', 42, 72),

  (4, 4, 'Pokevent', 'E7',
   'C''est un événement lorsque vous les avez tous attrapés ! Voici votre prochaine étape.',
   'Ce sont de vrais stratèges lors des combats de monstres de poche ? Allez les voir, ils sauront bien vous conseiller.',
   'Ectoplasma', 'Pokémon', 'E', 55, 55),

  (5, 5, 'Cosplay Smart', 'Z3',
   'Faire du cosplay entre 3 portes, un volant et deux sièges, ça doit être assez compliqué non ?',
   'Je connais un lieu pour y faire du cosplay. Vous voulez le trouver ? Faites preuve d''intelligence pour vous guider.',
   'Leona Kingscholar', 'Twisted Wonderland', 'L', 70, 68),

  (6, 6, 'Bonsai Center', 'X5',
   'Parfois, il ne suffit qu''un petit arbre pour se recentrer. Allez y méditer quelques instants.',
   'Les plantes d''Asie ont ce petit quelque chose de différent. Ne voudriez-vous pas y jeter un œil ?',
   'Bellamy', 'One Piece', 'B', 82, 48),

  (7, 7, 'Dojo', 'A1',
   'Rien qu''avec le nom, on pourrait penser aux arts martiaux. Pourtant, vous n''y trouverez aucun combattant. À part peut-être votre prochain personnage.',
   'Envie d''un manga ou d''une figurine ? Peut-être que vous devrez vous battre pour l''obtenir.',
   'Edward Elric', 'Fullmetal Alchemist', 'E', 68, 32),

  (8, 8, 'K-Pop Event Nice', 'J15',
   'Quittez le Japon pour la Corée. Un nouveau personnage devrait vous y attendre.',
   'Le rose et le noir vous guideront vers votre prochaine recrue. Saurez-vous les trouver ?',
   'Asta', 'Black Clover', 'A', 52, 22),

  (9, 9, 'Mizi & Manga', 'J16',
   'Pitié, faites un manga Alien Stage ! J''adore cette chanteuse aux cheveux roses !',
   'Après avoir chanté ''My Clematis'', qu''est-ce qu''elle va encore nous faire ? Des mangas ?',
   'Tetsurou Kuroo', 'Haikyuu', 'T', 34, 28),

  (10, 10, 'Pixie and Orcs', null,
   'Des lutins et des épaulards sont rassemblés à un stand ? Il faut le voir pour y croire.',
   'À leur nom, on pourrait penser à des cétacés mais en vérité leur hobby : piller des villages et tuer des gens. Pas cool…',
   'Sonia Nevermind', 'Danganronpa', 'S', 18, 38)
on conflict (id) do update set
  order_index = excluded.order_index,
  name        = excluded.name,
  code        = excluded.code,
  hint_1      = excluded.hint_1,
  hint_2      = excluded.hint_2,
  character_name = excluded.character_name,
  anime_name  = excluded.anime_name,
  initial     = excluded.initial,
  map_x       = excluded.map_x,
  map_y       = excluded.map_y;

-- ---------- CONFIG ----------
insert into public.config (key, value) values
  ('final_anime', 'ANGEL BEATS'),
  ('admin_password_hash', '<PLACEHOLDER_BCRYPT_HASH>')
on conflict (key) do nothing;
