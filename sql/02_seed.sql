-- =============================================================
-- Vite & Gourmand — données de démonstration
-- À exécuter après 01_create.sql :
--   psql -U vg -d vite_gourmand -f sql/02_seed.sql
--
-- Comptes de démonstration (mots de passe hachés bcrypt, coût 12) :
--   client@demo.vite-gourmand.fr   / ClientDemo2026!
--   employe@demo.vite-gourmand.fr  / EmployeDemo2026!
--   admin@demo.vite-gourmand.fr    / AdminDemo2026!
-- Identifiants dédiés à la démo — aucune donnée réelle.
-- =============================================================

BEGIN;

-- ---------- Utilisateurs ----------

INSERT INTO users (email, password_hash, first_name, last_name, phone, address, postal_code, city, role) VALUES
  ('client@demo.vite-gourmand.fr',  '$2b$12$0HtF20sydWEkVB65gaEYVulAX/.NM8VViBIx1xhSsbuxC0/SYoP5q', 'Camille', 'Client',   '0611223344', '12 rue Sainte-Catherine', '33000', 'Bordeaux', 'client'),
  ('employe@demo.vite-gourmand.fr', '$2b$12$zQ05/8XcurBKzKfFpNIagOgQsuNGoiPaQRY2tw3F9KMbVELv.xjhS', 'Élodie',  'Employée', '0622334455', '5 cours de l''Intendance', '33000', 'Bordeaux', 'employee'),
  ('admin@demo.vite-gourmand.fr',   '$2b$12$jQcSFwS4AVhFOEI2CrLrh.tDXVguxZuxtEHVnCjMrpDcc.wvxc3SO', 'Antoine', 'Admin',    '0633445566', '1 place de la Bourse', '33000', 'Bordeaux', 'admin');

-- ---------- Référentiels ----------

INSERT INTO themes (name) VALUES
  ('Mariage'), ('Anniversaire'), ('Entreprise'), ('Cocktail'), ('Fêtes de fin d''année');

INSERT INTO diets (name) VALUES
  ('Classique'), ('Végétarien'), ('Végan'), ('Sans gluten');

INSERT INTO allergens (name) VALUES
  ('Gluten'), ('Crustacés'), ('Œufs'), ('Poisson'), ('Arachides'),
  ('Soja'), ('Lait'), ('Fruits à coque'), ('Céleri'), ('Moutarde'),
  ('Sésame'), ('Sulfites'), ('Lupin'), ('Mollusques');

-- ---------- Plats ----------

INSERT INTO dishes (name, description) VALUES
  ('Velouté de potimarron aux éclats de châtaigne', 'Entrée chaude de saison'),                -- 1
  ('Foie gras mi-cuit, chutney de figues',          'Entrée signature, pain brioché toasté'),  -- 2
  ('Ceviche de daurade, agrumes et coriandre',      'Entrée fraîche, marinade citron vert'),   -- 3
  ('Magret de canard, sauce aux cèpes',             'Plat signature du Sud-Ouest'),            -- 4
  ('Suprême de volaille fermière, jus corsé',       'Plat principal, cuisson basse température'), -- 5
  ('Risotto crémeux aux champignons des bois',      'Plat végétarien, parmesan affiné'),       -- 6
  ('Curry de légumes au lait de coco',              'Plat végan, riz basmati'),                -- 7
  ('Pavé de saumon, beurre blanc à l''oseille',     'Poisson selon arrivage'),                 -- 8
  ('Canelé bordelais et sa crème anglaise',         'Dessert emblématique de Bordeaux'),       -- 9
  ('Assiette de fromages régionaux affinés',        'Sélection du fromager, pain aux noix'),   -- 10
  ('Pavlova aux fruits rouges',                     'Dessert léger, meringue croustillante'),  -- 11
  ('Salade de fruits frais de saison',              'Dessert végan, menthe fraîche'),          -- 12
  ('Mini-burgers apéritifs',                        'Pièce cocktail chaude'),                  -- 13
  ('Verrines avocat-crevette',                      'Pièce cocktail fraîche'),                 -- 14
  ('Brochettes de légumes grillés',                 'Pièce cocktail végane');                  -- 15

INSERT INTO dish_allergens (dish_id, allergen_id) VALUES
  (1, 8), (2, 1), (3, 4), (4, 12), (5, 9),
  (6, 7), (8, 4), (8, 7), (9, 1), (9, 3), (9, 7),
  (10, 7), (10, 8), (11, 3), (13, 1), (13, 7), (14, 2), (14, 3);

-- ---------- Menus ----------

INSERT INTO menus (title, description, theme_id, diet_id, min_people, price_per_person, conditions, stock) VALUES
  ('Menu Prestige Mariage',
   'Un repas gastronomique complet pour le plus beau jour : entrée signature, plat du Sud-Ouest et dessert bordelais, service à l''assiette.',
   1, 1, 30, 65.00, 'Commande au moins 21 jours avant l''événement. Vaisselle et nappage fournis (voir CGV pour la restitution du matériel).', 8),
  ('Menu Anniversaire Gourmand',
   'Un menu convivial et généreux pour fêter un anniversaire : entrée fraîche, volaille fermière et pavlova aux fruits rouges.',
   2, 1, 10, 38.00, 'Commande au moins 7 jours avant l''événement.', 15),
  ('Buffet Cocktail Entreprise',
   'Un assortiment de pièces cocktail chaudes et froides pour vos événements professionnels, service debout.',
   3, 1, 20, 24.00, 'Commande au moins 5 jours ouvrés avant l''événement. Personnel de service en option.', 20),
  ('Menu Végétarien de Saison',
   'Une cuisine végétarienne raffinée : velouté de saison, risotto aux champignons des bois et assiette de fromages.',
   2, 2, 8, 32.00, 'Commande au moins 5 jours avant l''événement.', 12),
  ('Menu Végan Découverte',
   'Un menu 100 % végétal : brochettes de légumes grillés, curry au lait de coco et salade de fruits frais.',
   4, 3, 8, 29.00, 'Commande au moins 5 jours avant l''événement.', 10),
  ('Réveillon Fêtes de Fin d''Année',
   'Le grand menu des fêtes : foie gras mi-cuit, magret de canard sauce aux cèpes et canelé bordelais revisité.',
   5, 1, 12, 55.00, 'Commande au moins 15 jours avant l''événement. Disponible de novembre à janvier.', 6);

INSERT INTO menu_dishes (menu_id, dish_id) VALUES
  (1, 2), (1, 4), (1, 9),
  (2, 3), (2, 5), (2, 11),
  (3, 13), (3, 14), (3, 15),
  (4, 1), (4, 6), (4, 10),
  (5, 15), (5, 7), (5, 12),
  (6, 2), (6, 4), (6, 9);

-- Le plat 2 (foie gras), 4 (magret) et 9 (canelé) appartiennent à plusieurs menus,
-- ce qui matérialise la relation N-N exigée par le sujet.

INSERT INTO menu_images (menu_id, url, alt, position) VALUES
  (1, '/images/menus/prestige-mariage-1.svg', 'Table de mariage dressée avec le menu Prestige', 0),
  (1, '/images/menus/prestige-mariage-2.svg', 'Magret de canard sauce aux cèpes du menu Prestige', 1),
  (2, '/images/menus/anniversaire-1.svg', 'Buffet d''anniversaire avec pavlova aux fruits rouges', 0),
  (3, '/images/menus/cocktail-entreprise-1.svg', 'Plateau de pièces cocktail pour événement d''entreprise', 0),
  (3, '/images/menus/cocktail-entreprise-2.svg', 'Verrines avocat-crevette en gros plan', 1),
  (4, '/images/menus/vegetarien-1.svg', 'Risotto crémeux aux champignons des bois', 0),
  (5, '/images/menus/vegan-1.svg', 'Curry de légumes au lait de coco et riz basmati', 0),
  (6, '/images/menus/reveillon-1.svg', 'Table de réveillon avec foie gras et canelés', 0);

-- ---------- Horaires (0 = lundi) ----------

INSERT INTO opening_hours (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '09:00', '18:00', FALSE),
  (1, '09:00', '18:00', FALSE),
  (2, '09:00', '18:00', FALSE),
  (3, '09:00', '18:00', FALSE),
  (4, '09:00', '19:00', FALSE),
  (5, '10:00', '16:00', FALSE),
  (6, NULL, NULL, TRUE);

-- ---------- Commandes de démonstration ----------

-- Commande terminée (permet de démontrer le dépôt d'avis)
INSERT INTO orders (user_id, menu_id, people_count, event_date, event_time, event_address, event_postal_code, event_city, phone, distance_km, unit_price, base_price, discount_amount, delivery_fee, total_price, current_status, created_at)
VALUES
  (1, 2, 16, '2026-06-20', '19:00', '12 rue Sainte-Catherine', '33000', 'Bordeaux', '0611223344', 0, 38.00, 608.00, 60.80, 0, 547.20, 'completed', '2026-06-01T10:00:00+02'),
  (1, 3, 20, '2026-08-10', '12:00', '4 avenue de la Libération', '33110', 'Le Bouscat', '0611223344', 4.5, 24.00, 480.00, 0, 7.66, 487.66, 'submitted', '2026-07-10T09:30:00+02');

-- Historique horodaté de la commande terminée
INSERT INTO order_status_history (order_id, status, changed_by, created_at) VALUES
  (1, 'submitted',                 1, '2026-06-01T10:00:00+02'),
  (1, 'accepted',                  2, '2026-06-02T09:15:00+02'),
  (1, 'in_preparation',            2, '2026-06-19T08:00:00+02'),
  (1, 'in_delivery',               2, '2026-06-20T17:30:00+02'),
  (1, 'delivered',                 2, '2026-06-20T18:45:00+02'),
  (1, 'awaiting_equipment_return', 2, '2026-06-21T10:00:00+02'),
  (1, 'completed',                 2, '2026-06-23T14:00:00+02');

INSERT INTO order_status_history (order_id, status, changed_by, created_at) VALUES
  (2, 'submitted', 1, '2026-07-10T09:30:00+02');

-- ---------- Avis ----------

INSERT INTO reviews (order_id, user_id, rating, comment, status, moderated_by, created_at) VALUES
  (1, 1, 5, 'Anniversaire parfait : plats délicieux, équipe ponctuelle et très professionnelle. La pavlova a fait l''unanimité !', 'approved', 2, '2026-06-24T11:00:00+02');

COMMIT;
