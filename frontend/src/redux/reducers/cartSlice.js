import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const qty = Math.max(1, Number(product.quantity) || 1);
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + qty,
          product.stock ?? existing.stock ?? 99
        );
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: product.price,
          thumbnailUrl: product.thumbnailUrl,
          stock: product.stock,
          scale: product.scale,
          brandName: product.brand?.name,
          quantity: Math.min(qty, product.stock ?? 99),
        });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((entry) => entry.id === id);
      if (!item) return;
      const next = Math.max(1, Number(quantity) || 1);
      item.quantity = Math.min(next, item.stock ?? 99);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default cartSlice.reducer;
