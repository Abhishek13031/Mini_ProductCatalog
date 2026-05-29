import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import productReducer from './productSLice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
  },
});
