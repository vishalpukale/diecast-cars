const { and, eq, ilike, or, desc, asc, sql } = require('drizzle-orm');
const { db } = require('../config/database');
const {
  brandsTable,
  categoriesTable,
  productsTable,
} = require('../models');
const HttpException = require('../utils/HttpException.utils');

const MAX_PRODUCT_IMAGES = 5;

const normalizeImages = (images = []) => {
  if (!Array.isArray(images)) return [];
  return images
    .filter((img) => img && (img.url || typeof img === 'string'))
    .slice(0, MAX_PRODUCT_IMAGES)
    .map((img, index) => {
      if (typeof img === 'string') {
        return { url: img, alt: '', sort: index };
      }
      return {
        url: img.url,
        alt: img.alt || '',
        sort: img.sort ?? index,
      };
    });
};

const publicProductFilter = and(
  eq(productsTable.isActive, true),
  eq(productsTable.isDeleted, false)
);

const mapProduct = (row) => ({
  id: Number(row.id),
  brandId: Number(row.brandId),
  categoryId: Number(row.categoryId),
  sku: row.sku,
  name: row.name,
  slug: row.slug,
  description: row.description,
  shortDescription: row.shortDescription,
  price: Number(row.price),
  compareAtPrice: row.compareAtPrice != null ? Number(row.compareAtPrice) : null,
  currency: row.currency,
  stock: row.stock,
  scale: row.scale,
  thumbnailUrl: row.thumbnailUrl,
  images: row.images || [],
  isFeatured: row.isFeatured,
  isJustArrived: row.isJustArrived,
  isActive: row.isActive,
  brand: row.brandName
    ? { id: Number(row.brandId), name: row.brandName, slug: row.brandSlug }
    : undefined,
  category: row.categoryName
    ? {
        id: Number(row.categoryId),
        name: row.categoryName,
        slug: row.categorySlug,
      }
    : undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const productSelect = {
  id: productsTable.id,
  brandId: productsTable.brandId,
  categoryId: productsTable.categoryId,
  sku: productsTable.sku,
  name: productsTable.name,
  slug: productsTable.slug,
  description: productsTable.description,
  shortDescription: productsTable.shortDescription,
  price: productsTable.price,
  compareAtPrice: productsTable.compareAtPrice,
  currency: productsTable.currency,
  stock: productsTable.stock,
  scale: productsTable.scale,
  thumbnailUrl: productsTable.thumbnailUrl,
  images: productsTable.images,
  isFeatured: productsTable.isFeatured,
  isJustArrived: productsTable.isJustArrived,
  isActive: productsTable.isActive,
  createdAt: productsTable.createdAt,
  updatedAt: productsTable.updatedAt,
  brandName: brandsTable.name,
  brandSlug: brandsTable.slug,
  categoryName: categoriesTable.name,
  categorySlug: categoriesTable.slug,
};

const listProducts = async (query = {}) => {
  const {
    brand,
    category,
    search,
    featured,
    justArrived,
    page = 1,
    limit = 24,
    sort = 'newest',
  } = query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 24));
  const offset = (pageNum - 1) * limitNum;

  const conditions = query.admin
    ? [eq(productsTable.isDeleted, false)]
    : [publicProductFilter];

  if (brand) {
    conditions.push(
      or(eq(brandsTable.slug, brand), eq(brandsTable.id, Number(brand) || -1))
    );
  }
  if (category) {
    conditions.push(
      or(
        eq(categoriesTable.slug, category),
        eq(categoriesTable.id, Number(category) || -1)
      )
    );
  }
  if (search) {
    const term = `%${String(search).trim()}%`;
    conditions.push(
      or(
        ilike(productsTable.name, term),
        ilike(productsTable.sku, term),
        ilike(productsTable.description, term)
      )
    );
  }
  if (featured === 'true' || featured === true) {
    conditions.push(eq(productsTable.isFeatured, true));
  }
  if (justArrived === 'true' || justArrived === true) {
    conditions.push(eq(productsTable.isJustArrived, true));
  }

  let orderBy = desc(productsTable.createdAt);
  if (sort === 'price_asc') orderBy = asc(productsTable.price);
  if (sort === 'price_desc') orderBy = desc(productsTable.price);
  if (sort === 'name') orderBy = asc(productsTable.name);

  const whereClause = and(...conditions);

  const [rows, countRows] = await Promise.all([
    db
      .select(productSelect)
      .from(productsTable)
      .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset),
    db
      .select({ count: sql`count(*)::int` })
      .from(productsTable)
      .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(whereClause),
  ]);

  return {
    items: rows.map(mapProduct),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: countRows[0]?.count || 0,
      totalPages: Math.ceil((countRows[0]?.count || 0) / limitNum),
    },
  };
};

const getProductBySlug = async (slug) => {
  const rows = await db
    .select(productSelect)
    .from(productsTable)
    .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(publicProductFilter, eq(productsTable.slug, slug)))
    .limit(1);

  if (!rows.length) throw new HttpException(404, 'Product not found');
  return mapProduct(rows[0]);
};

const getProductById = async (id) => {
  const rows = await db
    .select(productSelect)
    .from(productsTable)
    .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.id, Number(id)), eq(productsTable.isDeleted, false)))
    .limit(1);

  if (!rows.length) throw new HttpException(404, 'Product not found');
  return mapProduct(rows[0]);
};

const listBrands = async () => {
  const rows = await db
    .select()
    .from(brandsTable)
    .where(and(eq(brandsTable.isActive, true), eq(brandsTable.isDeleted, false)))
    .orderBy(asc(brandsTable.sortOrder), asc(brandsTable.name));

  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name,
    slug: r.slug,
    logoUrl: r.logoUrl,
  }));
};

const listCategories = async () => {
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(
      and(eq(categoriesTable.isActive, true), eq(categoriesTable.isDeleted, false))
    )
    .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));

  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name,
    slug: r.slug,
    description: r.description,
  }));
};

const createProduct = async (payload) => {
  const images = normalizeImages(payload.images);
  const thumbnailUrl = payload.thumbnailUrl || images[0]?.url || null;

  const [row] = await db
    .insert(productsTable)
    .values({
      brandId: payload.brandId,
      categoryId: payload.categoryId,
      sku: payload.sku,
      name: payload.name,
      slug: payload.slug,
      description: payload.description || null,
      shortDescription: payload.shortDescription || null,
      price: String(payload.price),
      compareAtPrice:
        payload.compareAtPrice != null ? String(payload.compareAtPrice) : null,
      currency: payload.currency || 'INR',
      stock: payload.stock ?? 0,
      scale: payload.scale || null,
      thumbnailUrl,
      images,
      isFeatured: !!payload.isFeatured,
      isJustArrived: !!payload.isJustArrived,
      isActive: payload.isActive !== false,
      meta: payload.meta || {},
      updatedAt: new Date(),
    })
    .returning();

  return getProductById(row.id);
};

const updateProduct = async (id, payload) => {
  const existing = await getProductById(id);
  const patch = {
    updatedAt: new Date(),
  };

  const fields = [
    'brandId',
    'categoryId',
    'sku',
    'name',
    'slug',
    'description',
    'shortDescription',
    'currency',
    'stock',
    'scale',
    'thumbnailUrl',
    'images',
    'isFeatured',
    'isJustArrived',
    'isActive',
    'meta',
  ];

  fields.forEach((key) => {
    if (payload[key] !== undefined) patch[key] = payload[key];
  });
  if (payload.images !== undefined) {
    patch.images = normalizeImages(payload.images);
    if (!payload.thumbnailUrl && patch.images[0]?.url) {
      patch.thumbnailUrl = patch.images[0].url;
    }
  }
  if (payload.price !== undefined) patch.price = String(payload.price);
  if (payload.compareAtPrice !== undefined) {
    patch.compareAtPrice =
      payload.compareAtPrice == null ? null : String(payload.compareAtPrice);
  }

  await db
    .update(productsTable)
    .set(patch)
    .where(eq(productsTable.id, existing.id));

  return getProductById(existing.id);
};

const softDeleteProduct = async (id) => {
  const existing = await getProductById(id);
  await db
    .update(productsTable)
    .set({
      isDeleted: true,
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(productsTable.id, existing.id));

  return { id: existing.id, deleted: true };
};

const adminListProducts = async (query = {}) => {
  return listProducts({ ...query, admin: true, limit: query.limit || 100 });
};

const getAdminProductById = async (id) => getProductById(id);

module.exports = {
  listProducts,
  adminListProducts,
  getProductBySlug,
  getProductById,
  getAdminProductById,
  listBrands,
  listCategories,
  createProduct,
  updateProduct,
  softDeleteProduct,
};
