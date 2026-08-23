import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3330/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const getProducts = (params = {}) =>
  api.get('/products', { params }).then((r) => r.data.data);

export const getProduct = (slug) =>
  api.get(`/products/${slug}`).then((r) => r.data.data);

export const getBrands = () => api.get('/brands').then((r) => r.data.data);

export const getCategories = () =>
  api.get('/categories').then((r) => r.data.data);

export const checkoutOrder = (payload) =>
  api.post('/checkout', payload).then((r) => r.data.data);

export const adminGetProducts = (params = {}) =>
  api
    .get('/admin/products', {
      params,
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminCreateProduct = (payload) =>
  api
    .post('/admin/products', payload, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminUpdateProduct = (id, payload) =>
  api
    .patch(`/admin/products/${id}`, payload, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminDeleteProduct = (id) =>
  api
    .delete(`/admin/products/${id}`, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminGetProduct = (id) =>
  api
    .get(`/admin/products/${id}`, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminGetBrands = () =>
  api
    .get('/admin/brands', {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminCreateBrand = (payload) =>
  api
    .post('/admin/brands', payload, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminUpdateBrand = (id, payload) =>
  api
    .patch(`/admin/brands/${id}`, payload, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminDeleteBrand = (id) =>
  api
    .delete(`/admin/brands/${id}`, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminGetCategories = () =>
  api
    .get('/admin/categories', {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminCreateCategory = (payload) =>
  api
    .post('/admin/categories', payload, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminUpdateCategory = (id, payload) =>
  api
    .patch(`/admin/categories/${id}`, payload, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminDeleteCategory = (id) =>
  api
    .delete(`/admin/categories/${id}`, {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminGetOrders = () =>
  api
    .get('/admin/orders', {
      headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY },
    })
    .then((r) => r.data.data);

export const adminUpdateOrderStatus = (orderNumber, status) =>
  api
    .patch(
      `/admin/orders/${orderNumber}/status`,
      { status },
      { headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY } }
    )
    .then((r) => r.data.data);

export const adminUploadImages = (files) => {
  const formData = new FormData();
  Array.from(files)
    .slice(0, 5)
    .forEach((file) => formData.append('images', file));

  return api
    .post('/admin/uploads', formData, {
      headers: {
        'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY,
      },
    })
    .then((r) => r.data.data);
};

export default api;
