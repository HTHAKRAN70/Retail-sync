import { createSlice } from '@reduxjs/toolkit';

const initialState = {    
    vendorData: {},  // Stores customers, vendors, and their added products
};

const userSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addProductToVendor: (state, action) => {
            const { customer, vendor, product } = action.payload;

            // Initialize the customer if not present
            if (!state.vendorData[customer]) {
                state.vendorData[customer] = {}; // Initialize an empty object for vendors
            }

            // Initialize the vendor for the customer if not present
            if (!state.vendorData[customer][vendor]) {
                state.vendorData[customer][vendor] = { products: [] }; // Initialize empty products array
            }

            const customerVendorData = state.vendorData[customer][vendor].products;

            // Check if the product already exists in the vendor's products array for this customer
            const productIndex = customerVendorData.findIndex(p => p.product_id === product.product_id);

            if (productIndex === -1) {
                // If product does not exist, add it to the array
                customerVendorData.push(product); 
            } else {
                // If the product exists, increase the quantity and update the totalAmount
                const existingProduct = customerVendorData[productIndex];
                existingProduct.quantity += product.quantity; // Increase quantity
                existingProduct.totalAmount = (existingProduct.discountedPrice * existingProduct.quantity).toFixed(2); // Recalculate total amount
            }
        },

        removeProductFromVendor: (state, action) => {
            const { customer, vendor, product } = action.payload;

            if (state.vendorData[customer] && state.vendorData[customer][vendor]) {
                const customerVendorData = state.vendorData[customer][vendor].products;
                const productIndex = customerVendorData.findIndex(p => p.product_id === product.product_id);

                if (productIndex !== -1) {
                    const existingProduct = customerVendorData[productIndex];

                    if (existingProduct.quantity > 1) {
                        // Decrease quantity by 1
                        existingProduct.quantity -= 1;
                        existingProduct.totalAmount = (existingProduct.discountedPrice * existingProduct.quantity).toFixed(2);
                    } else {
                        // Remove product if quantity is 0
                        state.vendorData[customer][vendor].products = customerVendorData.filter(
                            p => p.product_id !== product.product_id
                        );
                    }

                    // If no products remain for this vendor, remove the vendor from the customer
                    if (state.vendorData[customer][vendor].products.length === 0) {
                        delete state.vendorData[customer][vendor];
                    }

                    // If the customer has no vendors left, remove the customer from vendorData
                    if (Object.keys(state.vendorData[customer]).length === 0) {
                        delete state.vendorData[customer];
                    }
                }
            }
        },

        updateProductQuantity: (state, action) => {
            const { customer, vendor, productId, quantity } = action.payload;

            if (state.vendorData[customer] && state.vendorData[customer][vendor]) {
                const customerVendorData = state.vendorData[customer][vendor].products;
                const productIndex = customerVendorData.findIndex(p => p.product_id === productId);

                if (productIndex !== -1) {
                    const product = { ...customerVendorData[productIndex] };
                    product.quantity = quantity;
                    product.totalAmount = (product.discountedPrice * quantity).toFixed(2); // Update total amount based on quantity
                    customerVendorData[productIndex] = product; // Update the product in the array
                }
            }
        },
    },
});

export const { addProductToVendor, removeProductFromVendor, updateProductQuantity } = userSlice.actions;
export default userSlice.reducer;
