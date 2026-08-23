const catalogService = require('../services/catalog.service');
const { success } = require('../utils/response.utils');

const adminListBrands = async (req, res) => {
  const data = await catalogService.adminListBrands();
  return success(res, data, 'Brands fetched');
};

const adminCreateBrand = async (req, res) => {
  const data = await catalogService.createBrand(req.body);
  return success(res, data, 'Brand created', 201);
};

const adminUpdateBrand = async (req, res) => {
  const data = await catalogService.updateBrand(req.params.id, req.body);
  return success(res, data, 'Brand updated');
};

const adminDeleteBrand = async (req, res) => {
  const data = await catalogService.softDeleteBrand(req.params.id);
  return success(res, data, 'Brand deleted');
};

const adminListCategories = async (req, res) => {
  const data = await catalogService.adminListCategories();
  return success(res, data, 'Categories fetched');
};

const adminCreateCategory = async (req, res) => {
  const data = await catalogService.createCategory(req.body);
  return success(res, data, 'Category created', 201);
};

const adminUpdateCategory = async (req, res) => {
  const data = await catalogService.updateCategory(req.params.id, req.body);
  return success(res, data, 'Category updated');
};

const adminDeleteCategory = async (req, res) => {
  const data = await catalogService.softDeleteCategory(req.params.id);
  return success(res, data, 'Category deleted');
};

module.exports = {
  adminListBrands,
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand,
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
};
