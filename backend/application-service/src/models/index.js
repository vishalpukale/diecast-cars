/**
 * DieCast Cars — Drizzle schema
 * Lean v1 tables with room to grow (variants, users, payments, inventory logs).
 */

const {
  pgTable,
  bigserial,
  bigint,
  integer,
  varchar,
  text,
  boolean,
  numeric,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} = require('drizzle-orm/pg-core');
const tstz = (name, opts = {}) =>
  timestamp(name, { withTimezone: true, ...opts });

const brandsTable = pgTable(
  'brands',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    logoUrl: text('logo_url'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    isDeleted: boolean('is_deleted').notNull().default(false),
    meta: jsonb('meta').$type().default({}),
    createdAt: tstz('created_at').defaultNow().notNull(),
    updatedAt: tstz('updated_at').defaultNow().notNull(),
    deletedAt: tstz('deleted_at'),
  },
  (t) => ({
    slugUq: uniqueIndex('brands_slug_uq').on(t.slug),
    activeIdx: index('brands_active_idx').on(t.isActive, t.isDeleted),
  })
);

const categoriesTable = pgTable(
  'categories',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    description: text('description'),
    parentId: bigint('parent_id', { mode: 'number' }),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    isDeleted: boolean('is_deleted').notNull().default(false),
    meta: jsonb('meta').$type().default({}),
    createdAt: tstz('created_at').defaultNow().notNull(),
    updatedAt: tstz('updated_at').defaultNow().notNull(),
    deletedAt: tstz('deleted_at'),
  },
  (t) => ({
    slugUq: uniqueIndex('categories_slug_uq').on(t.slug),
    parentIdx: index('categories_parent_idx').on(t.parentId),
  })
);

const productsTable = pgTable(
  'products',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    brandId: bigint('brand_id', { mode: 'number' })
      .notNull()
      .references(() => brandsTable.id),
    categoryId: bigint('category_id', { mode: 'number' })
      .notNull()
      .references(() => categoriesTable.id),
    sku: varchar('sku', { length: 64 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).notNull(),
    description: text('description'),
    shortDescription: varchar('short_description', { length: 500 }),
    price: numeric('price', { precision: 12, scale: 2 }).notNull(),
    compareAtPrice: numeric('compare_at_price', { precision: 12, scale: 2 }),
    currency: varchar('currency', { length: 8 }).notNull().default('INR'),
    stock: integer('stock').notNull().default(0),
    scale: varchar('scale', { length: 32 }),
    thumbnailUrl: text('thumbnail_url'),
    images: jsonb('images').$type().default([]),
    isFeatured: boolean('is_featured').notNull().default(false),
    isJustArrived: boolean('is_just_arrived').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    isDeleted: boolean('is_deleted').notNull().default(false),
    meta: jsonb('meta').$type().default({}),
    createdAt: tstz('created_at').defaultNow().notNull(),
    updatedAt: tstz('updated_at').defaultNow().notNull(),
    deletedAt: tstz('deleted_at'),
  },
  (t) => ({
    skuUq: uniqueIndex('products_sku_uq').on(t.sku),
    slugUq: uniqueIndex('products_slug_uq').on(t.slug),
    brandIdx: index('products_brand_idx').on(t.brandId),
    categoryIdx: index('products_category_idx').on(t.categoryId),
    listingIdx: index('products_listing_idx').on(
      t.isActive,
      t.isDeleted,
      t.isFeatured,
      t.isJustArrived
    ),
  })
);

const ordersTable = pgTable(
  'orders',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    orderNumber: varchar('order_number', { length: 32 }).notNull(),
    status: varchar('status', { length: 40 }).notNull().default('pending_whatsapp'),
    customerName: varchar('customer_name', { length: 160 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 20 }).notNull(),
    addressLine: text('address_line').notNull(),
    city: varchar('city', { length: 120 }).notNull(),
    pincode: varchar('pincode', { length: 12 }).notNull(),
    notes: text('notes'),
    subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
    total: numeric('total', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 8 }).notNull().default('INR'),
    whatsappMessage: text('whatsapp_message'),
    meta: jsonb('meta').$type().default({}),
    createdAt: tstz('created_at').defaultNow().notNull(),
    updatedAt: tstz('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    orderNumberUq: uniqueIndex('orders_order_number_uq').on(t.orderNumber),
    statusIdx: index('orders_status_idx').on(t.status),
    phoneIdx: index('orders_phone_idx').on(t.customerPhone),
  })
);

const orderItemsTable = pgTable(
  'order_items',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    orderId: bigint('order_id', { mode: 'number' })
      .notNull()
      .references(() => ordersTable.id),
    productId: bigint('product_id', { mode: 'number' }).references(
      () => productsTable.id
    ),
    productName: varchar('product_name', { length: 255 }).notNull(),
    productSku: varchar('product_sku', { length: 64 }).notNull(),
    unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull(),
    lineTotal: numeric('line_total', { precision: 12, scale: 2 }).notNull(),
    productSnapshot: jsonb('product_snapshot').$type().default({}),
    createdAt: tstz('created_at').defaultNow().notNull(),
  },
  (t) => ({
    orderIdx: index('order_items_order_idx').on(t.orderId),
  })
);

module.exports = {
  brandsTable,
  categoriesTable,
  productsTable,
  ordersTable,
  orderItemsTable,
};
