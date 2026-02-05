// frontend/src/services/api.js - UPDATED
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const productAPI = {
  // Get all products
  getProducts: async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return { success: false, message: error.message };
    }
  },

  // Create product
  createProduct: async (productData) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return { success: false, message: error.message };
    }
  },

  // Update product
  updateProduct: async (id, updateData) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return { success: false, message: error.message };
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return { success: false, message: error.message };
    }
  }
};