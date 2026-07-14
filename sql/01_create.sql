-- =============================================================
-- Vite & Gourmand — schéma PostgreSQL
-- Script de création : exécutable sur une base vide.
--   psql -U vg -d vite_gourmand -f sql/01_create.sql
-- =============================================================

BEGIN;

-- ---------- Types ----------

CREATE TYPE user_role AS ENUM ('client', 'employee', 'admin');

-- 'submitted' : déposée par le client, modifiable/annulable tant que non acceptée.
-- Ensuite progression imposée par le sujet ; 'cancelled' possible selon les règles métier.
CREATE TYPE order_status AS ENUM (
  'submitted',
  'accepted',
  'in_preparation',
  'in_delivery',
  'delivered',
  'awaiting_equipment_return',
  'completed',
  'cancelled'
);

CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- ---------- Utilisateurs & sessions ----------

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  address       VARCHAR(255),
  postal_code   VARCHAR(10),
  city          VARCHAR(100),
  role          user_role    NOT NULL DEFAULT 'client',
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ---------- Référentiels catalogue ----------

CREATE TABLE themes (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE diets (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE allergens (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- ---------- Plats ----------

CREATE TABLE dishes (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT
);

CREATE TABLE dish_allergens (
  dish_id     INTEGER NOT NULL REFERENCES dishes(id)    ON DELETE CASCADE,
  allergen_id INTEGER NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  PRIMARY KEY (dish_id, allergen_id)
);

-- ---------- Menus ----------

CREATE TABLE menus (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(150)  NOT NULL,
  description TEXT          NOT NULL,
  theme_id    INTEGER       NOT NULL REFERENCES themes(id),
  diet_id     INTEGER       NOT NULL REFERENCES diets(id),
  min_people  INTEGER       NOT NULL CHECK (min_people > 0),
  price_per_person NUMERIC(8,2) NOT NULL CHECK (price_per_person >= 0),
  conditions  TEXT,
  stock       INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX idx_menus_theme ON menus(theme_id);
CREATE INDEX idx_menus_diet  ON menus(diet_id);

-- Un plat peut appartenir à plusieurs menus (exigence du sujet).
CREATE TABLE menu_dishes (
  menu_id INTEGER NOT NULL REFERENCES menus(id)  ON DELETE CASCADE,
  dish_id INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_id, dish_id)
);

CREATE TABLE menu_images (
  id       SERIAL PRIMARY KEY,
  menu_id  INTEGER      NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  url      VARCHAR(500) NOT NULL,
  alt      VARCHAR(255) NOT NULL,
  position INTEGER      NOT NULL DEFAULT 0
);
CREATE INDEX idx_menu_images_menu ON menu_images(menu_id);

-- ---------- Commandes ----------

CREATE TABLE orders (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER      NOT NULL REFERENCES users(id),
  menu_id         INTEGER      NOT NULL REFERENCES menus(id),
  people_count    INTEGER      NOT NULL CHECK (people_count > 0),
  event_date      DATE         NOT NULL,
  event_time      TIME         NOT NULL,
  event_address   VARCHAR(255) NOT NULL,
  event_postal_code VARCHAR(10) NOT NULL,
  event_city      VARCHAR(100) NOT NULL,
  phone           VARCHAR(20)  NOT NULL,
  distance_km     NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (distance_km >= 0),
  -- Détail du prix, figé à la commande (justifiable devant le client)
  unit_price      NUMERIC(8,2) NOT NULL,
  base_price      NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee    NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price     NUMERIC(10,2) NOT NULL,
  current_status  order_status NOT NULL DEFAULT 'submitted',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user   ON orders(user_id);
CREATE INDEX idx_orders_menu   ON orders(menu_id);
CREATE INDEX idx_orders_status ON orders(current_status);

-- Historique horodaté des statuts (exigence : suivi horodaté).
-- Toute annulation/modification par un employé porte le mode de contact et le motif.
CREATE TABLE order_status_history (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER      NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status       order_status NOT NULL,
  changed_by   INTEGER      REFERENCES users(id),
  contact_mode VARCHAR(50),
  reason       TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_osh_order ON order_status_history(order_id);

-- ---------- Avis ----------

CREATE TABLE reviews (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER       NOT NULL UNIQUE REFERENCES orders(id),
  user_id      INTEGER       NOT NULL REFERENCES users(id),
  rating       INTEGER       NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT          NOT NULL,
  status       review_status NOT NULL DEFAULT 'pending',
  moderated_by INTEGER       REFERENCES users(id),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_status ON reviews(status);

-- ---------- Horaires ----------

CREATE TABLE opening_hours (
  id          SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = lundi
  open_time   TIME,
  close_time  TIME,
  is_closed   BOOLEAN NOT NULL DEFAULT FALSE
);

COMMIT;
