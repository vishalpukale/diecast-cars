const { and, eq, asc } = require('drizzle-orm');
const { db } = require('../config/database');
const { brandsTable, categoriesTable } = require('../models');
const HttpException = require('../utils/HttpException.utils');
const { slugify } = require('../utils/slugify.utils');

const mapBrand = (r) => ({
  id: Number(r.id),
  name: r.name,
  slug: r.slug,
  logoUrl: r.logoUrl,
  sortOrder: r.sortOrder,
  isActive: r.isActive,
  isDeleted: r.isDeleted,
});

const mapCategory = (r) => ({
  id: Number(r.id),
  name: r.name,
  slug: r.slug,
  description: r.description,
  sortOrder: r.sortOrder,
  isActive: r.isActive,
  isDeleted: r.isDeleted,
});

const adminListBrands = async () => {
  const rows = await db
    .select()
    .from(brandsTable)
    .where(eq(brandsTable.isDeleted, false))
    .orderBy(asc(brandsTable.sortOrder), asc(brandsTable.name));
  return rows.map(mapBrand);
};

const createBrand = async (payload) => {
  const name = String(payload.name || '').trim();
  if (!name) throw new HttpException(400, 'Brand name is required');
  const slug = payload.slug ? slugify(payload.slug) : slugify(name);

  const [row] = await db
    .insert(brandsTable)
    .values({
      name,
      slug,
      logoUrl: payload.logoUrl || null,
      sortOrder: Number(payload.sortOrder) || 0,
      isActive: payload.isActive !== false,
      updatedAt: new Date(),
    })
    .returning();

  return mapBrand(row);
};

const updateBrand = async (id, payload) => {
  const [existing] = await db
    .select()
    .from(brandsTable)
    .where(and(eq(brandsTable.id, Number(id)), eq(brandsTable.isDeleted, false)))
    .limit(1);

  if (!existing) throw new HttpException(404, 'Brand not found');

  const patch = { updatedAt: new Date() };
  if (payload.name !== undefined) patch.name = String(payload.name).trim();
  if (payload.slug !== undefined) patch.slug = slugify(payload.slug);
  if (payload.logoUrl !== undefined) patch.logoUrl = payload.logoUrl;
  if (payload.sortOrder !== undefined) patch.sortOrder = Number(payload.sortOrder) || 0;
  if (payload.isActive !== undefined) patch.isActive = !!payload.isActive;

  const [row] = await db
    .update(brandsTable)
    .set(patch)
    .where(eq(brandsTable.id, existing.id))
    .returning();

  return mapBrand(row);
};

const softDeleteBrand = async (id) => {
  const [existing] = await db
    .select()
    .from(brandsTable)
    .where(and(eq(brandsTable.id, Number(id)), eq(brandsTable.isDeleted, false)))
    .limit(1);

  if (!existing) throw new HttpException(404, 'Brand not found');

  await db
    .update(brandsTable)
    .set({
      isDeleted: true,
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(brandsTable.id, existing.id));

  return { id: Number(existing.id), deleted: true };
};

const adminListCategories = async () => {
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.isDeleted, false))
    .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
  return rows.map(mapCategory);
};

const createCategory = async (payload) => {
  const name = String(payload.name || '').trim();
  if (!name) throw new HttpException(400, 'Category name is required');
  const slug = payload.slug ? slugify(payload.slug) : slugify(name);

  const [row] = await db
    .insert(categoriesTable)
    .values({
      name,
      slug,
      description: payload.description || null,
      sortOrder: Number(payload.sortOrder) || 0,
      isActive: payload.isActive !== false,
      updatedAt: new Date(),
    })
    .returning();

  return mapCategory(row);
};

const updateCategory = async (id, payload) => {
  const [existing] = await db
    .select()
    .from(categoriesTable)
    .where(and(eq(categoriesTable.id, Number(id)), eq(categoriesTable.isDeleted, false)))
    .limit(1);

  if (!existing) throw new HttpException(404, 'Category not found');

  const patch = { updatedAt: new Date() };
  if (payload.name !== undefined) patch.name = String(payload.name).trim();
  if (payload.slug !== undefined) patch.slug = slugify(payload.slug);
  if (payload.description !== undefined) patch.description = payload.description;
  if (payload.sortOrder !== undefined) patch.sortOrder = Number(payload.sortOrder) || 0;
  if (payload.isActive !== undefined) patch.isActive = !!payload.isActive;

  const [row] = await db
    .update(categoriesTable)
    .set(patch)
    .where(eq(categoriesTable.id, existing.id))
    .returning();

  return mapCategory(row);
};

const softDeleteCategory = async (id) => {
  const [existing] = await db
    .select()
    .from(categoriesTable)
    .where(and(eq(categoriesTable.id, Number(id)), eq(categoriesTable.isDeleted, false)))
    .limit(1);

  if (!existing) throw new HttpException(404, 'Category not found');

  await db
    .update(categoriesTable)
    .set({
      isDeleted: true,
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(categoriesTable.id, existing.id));

  return { id: Number(existing.id), deleted: true };
};

module.exports = {
  adminListBrands,
  createBrand,
  updateBrand,
  softDeleteBrand,
  adminListCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
};
