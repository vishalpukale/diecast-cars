CREATE TABLE IF NOT EXISTS "brands" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(120) NOT NULL,
  "slug" varchar(140) NOT NULL,
  "logo_url" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "is_deleted" boolean DEFAULT false NOT NULL,
  "meta" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "deleted_at" timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS "brands_slug_uq" ON "brands" ("slug");
CREATE INDEX IF NOT EXISTS "brands_active_idx" ON "brands" ("is_active", "is_deleted");

CREATE TABLE IF NOT EXISTS "categories" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(120) NOT NULL,
  "slug" varchar(140) NOT NULL,
  "description" text,
  "parent_id" bigint,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "is_deleted" boolean DEFAULT false NOT NULL,
  "meta" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "deleted_at" timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_uq" ON "categories" ("slug");
CREATE INDEX IF NOT EXISTS "categories_parent_idx" ON "categories" ("parent_id");

CREATE TABLE IF NOT EXISTS "products" (
  "id" bigserial PRIMARY KEY,
  "brand_id" bigint NOT NULL REFERENCES "brands"("id"),
  "category_id" bigint NOT NULL REFERENCES "categories"("id"),
  "sku" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "slug" varchar(280) NOT NULL,
  "description" text,
  "short_description" varchar(500),
  "price" numeric(12, 2) NOT NULL,
  "compare_at_price" numeric(12, 2),
  "currency" varchar(8) DEFAULT 'INR' NOT NULL,
  "stock" integer DEFAULT 0 NOT NULL,
  "scale" varchar(32),
  "thumbnail_url" text,
  "images" jsonb DEFAULT '[]'::jsonb,
  "is_featured" boolean DEFAULT false NOT NULL,
  "is_just_arrived" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "is_deleted" boolean DEFAULT false NOT NULL,
  "meta" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "deleted_at" timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_uq" ON "products" ("sku");
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_uq" ON "products" ("slug");
CREATE INDEX IF NOT EXISTS "products_brand_idx" ON "products" ("brand_id");
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products" ("category_id");
CREATE INDEX IF NOT EXISTS "products_listing_idx" ON "products" ("is_active", "is_deleted", "is_featured", "is_just_arrived");

CREATE TABLE IF NOT EXISTS "orders" (
  "id" bigserial PRIMARY KEY,
  "order_number" varchar(32) NOT NULL,
  "status" varchar(40) DEFAULT 'pending_whatsapp' NOT NULL,
  "customer_name" varchar(160) NOT NULL,
  "customer_phone" varchar(20) NOT NULL,
  "address_line" text NOT NULL,
  "city" varchar(120) NOT NULL,
  "pincode" varchar(12) NOT NULL,
  "notes" text,
  "subtotal" numeric(12, 2) NOT NULL,
  "total" numeric(12, 2) NOT NULL,
  "currency" varchar(8) DEFAULT 'INR' NOT NULL,
  "whatsapp_message" text,
  "meta" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "orders_order_number_uq" ON "orders" ("order_number");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "orders_phone_idx" ON "orders" ("customer_phone");

CREATE TABLE IF NOT EXISTS "order_items" (
  "id" bigserial PRIMARY KEY,
  "order_id" bigint NOT NULL REFERENCES "orders"("id"),
  "product_id" bigint REFERENCES "products"("id"),
  "product_name" varchar(255) NOT NULL,
  "product_sku" varchar(64) NOT NULL,
  "unit_price" numeric(12, 2) NOT NULL,
  "quantity" integer NOT NULL,
  "line_total" numeric(12, 2) NOT NULL,
  "product_snapshot" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "order_items_order_idx" ON "order_items" ("order_id");
