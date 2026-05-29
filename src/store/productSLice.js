import { createSlice } from "@reduxjs/toolkit";

// 1. Rename this function so it doesn't conflict with the browser API
const loadStoredProducts = () => {
    try {
        const storedProducts = window.localStorage.getItem('products');
        return storedProducts ? JSON.parse(storedProducts) : [];
    } catch (error) {
        console.error('Error loading products from localStorage:', error);
        return [];
    }
};

const initialState = {
    products: loadStoredProducts(), // Call the renamed function here
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        // 2. Added bulk set reducer for your CSV/JSON import functionality
        setProducts: (state, action) => {
            state.products = action.payload; // action.payload is an array of products
            window.localStorage.setItem('products', JSON.stringify(state.products));
        },
        addProduct: (state, action) => {
            state.products.push(action.payload);
            window.localStorage.setItem('products', JSON.stringify(state.products));
        },
        removeProduct: (state, action) => {
            state.products = state.products.filter(product => product.id !== action.payload);
            window.localStorage.setItem('products', JSON.stringify(state.products));
        },
        editProduct: (state, action) => {
            const { id, updatedProduct } = action.payload;
            const index = state.products.findIndex(product => product.id === id);
            if (index !== -1) {
                state.products[index] = { ...state.products[index], ...updatedProduct };
                window.localStorage.setItem('products', JSON.stringify(state.products));
            }
        },
    },
});

// Make sure to export the new setProducts action as well
export const { setProducts, addProduct, removeProduct, editProduct } = productSlice.actions;
export default productSlice.reducer;