const productService = require('../services/product.service');
const { success } = require('../utils/response.utils');

const listProducts = async (req, res) => {
  const data = await productService.listProducts(req.query);
  return success(res, data, 'Products fetched');
};

const getProduct = async (req, res) => {
  const data = await productService.getProductBySlug(req.params.slug);
  return success(res, data, 'Product fetched');
};

const listBrands = async (req, res) => {
  const data = await productService.listBrands();
  return success(res, data, 'Brands fetched');
};

const listCategories = async (req, res) => {
  const data = await productService.listCategories();
  return success(res, data, 'Categories fetched');
};

const adminListProducts = async (req, res) => {
  const data = await productService.adminListProducts(req.query);
  return success(res, data, 'Admin products fetched');
};

const adminGetProduct = async (req, res) => {
  const data = await productService.getAdminProductById(req.params.id);
  return success(res, data, 'Product fetched');
};

const adminCreateProduct = async (req, res) => {
  const data = await productService.createProduct(req.body);
  return success(res, data, 'Product created', 201);
};

const adminUpdateProduct = async (req, res) => {
  const data = await productService.updateProduct(req.params.id, req.body);
  return success(res, data, 'Product updated');
};

const adminDeleteProduct = async (req, res) => {
  const data = await productService.softDeleteProduct(req.params.id);
  return success(res, data, 'Product deleted');
};

module.exports = {
  listProducts,
  getProduct,
  listBrands,
  listCategories,
  adminListProducts,
  adminGetProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
};
