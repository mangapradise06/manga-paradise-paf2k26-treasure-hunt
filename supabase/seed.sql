-- =============================================================
--  PAF 2K26 — Seed v2 : 10 stands ANGEL BEATS + config.
--  Ordre physique (samedi) ≠ ordre narratif.
--  Reset complet des stands : les identités et l'order_index ont
--  changé par rapport à la v1, on fait un DELETE + INSERT.
-- =============================================================

-- ---------- STANDS ----------
-- Reset. ON DELETE CASCADE propage sur progress/attempts, ce qui est
-- volontaire : si on reseed, on repart de zéro côté joueurs aussi.
delete from public.stands;

insert into public.stands
  (id, order_index, name, code, hint_1, hint_2,
   character_name, anime_name, initial, narrative_role,
   map_x, map_y)
values
  (1, 1, 'Le Dojo', 'A1',
   'Rien qu''avec le nom, on pourrait penser aux arts martiaux. Pourtant, vous n''y trouverez aucun combattant. À part peut-être votre prochaine recrue.',
   'Envie d''un manga ou d''une figurine ? Peut-être que vous devrez vous battre pour l''obtenir… et repartir avec un futur assassin.',
   'Nagisa Shiota', 'Assassination Classroom', 'N', 'L''assassin',
   68, 32),

  (2, 2, 'Cospital', 'C2',
   'Un lieu qui soigne les costumes blessés ? Votre prochain personnage y traîne, prêt à ricaner.',
   'Rien de tel qu''un atelier médical pour recoudre un tissu. Au milieu des aiguilles, cherchez celui qui rit plus fort que les autres.',
   'Bellamy', 'One Piece', 'B', 'La hyène',
   82, 48),

  (3, 3, 'Hunter Quest', 'E5',
   'Partez en quête du chasseur qui rôde au festival. Il vous confiera une nouvelle recrue, princière.',
   'Je ne sais pas si on y trouve des fusils, des peaux de bêtes ou des trophées, mais il y aura sans doute la princesse que vous cherchez.',
   'Sonia Nevermind', 'Danganronpa', 'S', 'La princesse',
   28, 62),

  (4, 4, 'Eventasia', 'A9',
   'Vous ne pensez pas que c''est un événement de partir en Asie ? Le prochain personnage vous y attend, royal et nonchalant.',
   'Que se passe-t-il si vous utilisez un éventail en Asie ? Un fauve paresseux pourrait bien vous y accueillir.',
   'Leona Kingscholar', 'Twisted Wonderland', 'L', 'Le carnivore',
   15, 78),

  (5, 5, 'Bonsaï Center', 'X5',
   'Parfois, il ne suffit que d''un petit arbre pour se recentrer. Allez y méditer : le stratège de votre route s''y cache.',
   'Les plantes d''Asie ont ce petit quelque chose de différent. Taillées avec soin, elles inspirent autant qu''un plan de bataille.',
   'Armin Arlert', 'L''Attaque des Titans', 'A', 'Le stratège',
   15, 48),

  (6, 6, 'K-Pop Event', 'J15',
   'Quittez le Japon pour la Corée. Un nouveau personnage devrait vous y attendre, petit de taille mais grand en talent.',
   'Le rose et le noir vous guideront vers votre prochaine recrue. Elle transforme tout ce qu''elle touche… ou presque.',
   'Edward Elric', 'Fullmetal Alchemist', 'E', 'L''alchimiste',
   52, 22),

  (7, 7, 'Pokevent', 'E7',
   'C''est un événement lorsque vous les avez tous attrapés ! Voici votre prochaine étape, et son personnage flotte entre deux mondes.',
   'Ce sont de vrais stratèges lors des combats de monstres de poche ? Allez les voir : l''un d''eux fait même trembler la mort.',
   'Ectoplasma', 'Pokémon', 'E', 'La mort',
   55, 55),

  (8, 8, 'Cosplay Smart', 'Z3',
   'Faire du cosplay entre 3 portes, un volant et deux sièges, ça doit être compliqué non ? Un sensei tout vêtu de bleu saura vous guider.',
   'Je connais un lieu pour y faire du cosplay. Vous voulez le trouver ? Faites preuve d''intelligence… et fermez les yeux, comme lui.',
   'Gojo Satoru', 'Jujutsu Kaisen', 'G', 'Le sensei',
   70, 68),

  (9, 9, 'Mizi & Manga', 'J16',
   'Pitié, faites un manga Alien Stage ! J''adore cette chanteuse aux cheveux roses ! Un orphelin au cœur pur traîne justement dans le coin.',
   'Après avoir chanté ''My Clematis'', qu''est-ce qu''elle va encore nous faire ? Peut-être présenter un petit sorcier sans magie qui rêve du sommet.',
   'Asta', 'Black Clover', 'A', 'L''orphelin',
   34, 28),

  (10, 10, 'Pixie and Orcs', null,
   'Des lutins et des épaulards sont rassemblés à un stand ? Il faut le voir pour y croire. Un capitaine félin y attend ses camarades.',
   'À leur nom, on pourrait penser à des cétacés mais en vérité leur hobby : piller des villages et jouer au volley… ou presque. Cherchez-y le meneur.',
   'Tetsurou Kuroo', 'Haikyuu!!', 'T', 'Le capitaine',
   18, 38);

-- ---------- CONFIG ----------
insert into public.config (key, value) values
  ('final_anime', 'ANGEL BEATS'),
  ('narrative_order',
   '[{"role":"Le stratège","character":"Armin Arlert","letter":"A"},{"role":"L''assassin","character":"Nagisa Shiota","letter":"N"},{"role":"Le sensei","character":"Gojo Satoru","letter":"G"},{"role":"La mort","character":"Ectoplasma","letter":"E"},{"role":"Le carnivore","character":"Leona Kingscholar","letter":"L"},{"role":"La hyène","character":"Bellamy","letter":"B"},{"role":"L''alchimiste","character":"Edward Elric","letter":"E"},{"role":"L''orphelin","character":"Asta","letter":"A"},{"role":"Le capitaine","character":"Tetsurou Kuroo","letter":"T"},{"role":"La princesse","character":"Sonia Nevermind","letter":"S"}]')
on conflict (key) do update set value = excluded.value;

-- Le hash admin est préservé s'il existe déjà ; on ne le touche pas ici.
insert into public.config (key, value) values
  ('admin_password_hash', '<PLACEHOLDER_BCRYPT_HASH>')
on conflict (key) do nothing;
