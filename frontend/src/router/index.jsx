import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import StoreLayout from '../components/StoreLayout';
import HomePage from '../modules/home/HomePage';
import CatalogPage from '../modules/catalog/CatalogPage';
import ProductPage from '../modules/product/ProductPage';
import CartPage from '../modules/cart/CartPage';
import CheckoutPage from '../modules/checkout/CheckoutPage';
import OrderSuccessPage from '../modules/checkout/OrderSuccessPage';
import AdminPage from '../modules/admin/AdminPage';

export default function Routing() {
  return (
    <BrowserRouter>
      <StoreLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StoreLayout>
    </BrowserRouter>
  );
}
