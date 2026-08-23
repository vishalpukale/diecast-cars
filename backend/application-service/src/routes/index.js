const express = require('express');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const adminAuth = require('../middleware/adminAuth.middleware');
const { upload, MAX_IMAGES } = require('../middleware/upload.middleware');
const productController = require('../controllers/product.controller');
const orderController = require('../controllers/order.controller');
const catalogController = require('../controllers/catalog.controller');
const uploadController = require('../controllers/upload.controller');
const HttpException = require('../utils/HttpException.utils');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    type: 'success',
    status: 200,
    message: 'application-service healthy',
    data: { service: 'application-service', time: new Date().toISOString() },
  });
});

router.get('/products', awaitHandlerFactory(productController.listProducts));
router.get('/products/:slug', awaitHandlerFactory(productController.getProduct));
router.get('/brands', awaitHandlerFactory(productController.listBrands));
router.get('/categories', awaitHandlerFactory(productController.listCategories));

router.post('/checkout', awaitHandlerFactory(orderController.checkout));

// Admin — products
router.get(
  '/admin/products',
  adminAuth,
  awaitHandlerFactory(productController.adminListProducts)
);
router.get(
  '/admin/products/:id',
  adminAuth,
  awaitHandlerFactory(productController.adminGetProduct)
);
router.post(
  '/admin/uploads',
  adminAuth,
  (req, res, next) => {
    upload.array('images', MAX_IMAGES)(req, res, (err) => {
      if (err) {
        return next(new HttpException(400, err.message || 'Upload failed'));
      }
      return next();
    });
  },
  awaitHandlerFactory(uploadController.uploadProductImages)
);
router.post(
  '/admin/products',
  adminAuth,
  awaitHandlerFactory(productController.adminCreateProduct)
);
router.patch(
  '/admin/products/:id',
  adminAuth,
  awaitHandlerFactory(productController.adminUpdateProduct)
);
router.delete(
  '/admin/products/:id',
  adminAuth,
  awaitHandlerFactory(productController.adminDeleteProduct)
);

// Admin — brands
router.get(
  '/admin/brands',
  adminAuth,
  awaitHandlerFactory(catalogController.adminListBrands)
);
router.post(
  '/admin/brands',
  adminAuth,
  awaitHandlerFactory(catalogController.adminCreateBrand)
);
router.patch(
  '/admin/brands/:id',
  adminAuth,
  awaitHandlerFactory(catalogController.adminUpdateBrand)
);
router.delete(
  '/admin/brands/:id',
  adminAuth,
  awaitHandlerFactory(catalogController.adminDeleteBrand)
);

// Admin — categories
router.get(
  '/admin/categories',
  adminAuth,
  awaitHandlerFactory(catalogController.adminListCategories)
);
router.post(
  '/admin/categories',
  adminAuth,
  awaitHandlerFactory(catalogController.adminCreateCategory)
);
router.patch(
  '/admin/categories/:id',
  adminAuth,
  awaitHandlerFactory(catalogController.adminUpdateCategory)
);
router.delete(
  '/admin/categories/:id',
  adminAuth,
  awaitHandlerFactory(catalogController.adminDeleteCategory)
);

// Admin — orders
router.get(
  '/admin/orders',
  adminAuth,
  awaitHandlerFactory(orderController.listOrders)
);
router.get(
  '/admin/orders/statuses',
  adminAuth,
  awaitHandlerFactory(orderController.listOrderStatuses)
);
router.get(
  '/admin/orders/:orderNumber',
  adminAuth,
  awaitHandlerFactory(orderController.getOrder)
);
router.patch(
  '/admin/orders/:orderNumber/status',
  adminAuth,
  awaitHandlerFactory(orderController.updateOrderStatus)
);

module.exports = router;
