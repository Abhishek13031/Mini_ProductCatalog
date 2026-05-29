import { createSlice } from '@reduxjs/toolkit';

const getSku = (item) => String(item.id || item.SKU || item.ID || item.__rowId || item.name || item.Title || item.title || '');

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart: (state, action) => {
      const incoming = action.payload || {};
      const incomingSku = getSku(incoming);
      const existingItem = state.items.find((item) => getSku(item) === incomingSku);

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
        return;
      }

      state.items.push({
        ...incoming,
        quantity: 1,
      });
    },
    increaseQuantity: (state, action) => {
      const targetSku = String(action.payload || '');
      const item = state.items.find((entry) => getSku(entry) === targetSku);
      if (item) {
        item.quantity = (item.quantity || 1) + 1;
      }
    },
    decreaseQuantity: (state, action) => {
      const targetSku = String(action.payload || '');
      const item = state.items.find((entry) => getSku(entry) === targetSku);
      if (item && (item.quantity || 1) > 1) {
        item.quantity -= 1;
      }
    },
    removeFromCart: (state, action) => {
      const targetSku = String(action.payload || '');
      state.items = state.items.filter((item) => getSku(item) !== targetSku);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
