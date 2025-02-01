import axios from 'axios';

const API_URL = 'http://localhost:8080/products';

export const createProduct = async (productData, token) => {
    try {
      const response = await axios.post(`${API_URL}`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error.response?.data || error.message);
      throw error;
    }
  };

// Obtener un producto por ID
export const getProductById = async (productId) => {
    try {
        const response = await axios.get(`${API_URL}/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

// Actualizar un producto
export const updateProduct = async (productId, productData, token) => {
    try {
        const response = await axios.put(`${API_URL}/${productId}`, productData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

// Eliminar un producto
export const deleteProduct = async (productId, token) => {
    try {
        const response = await axios.delete(`${API_URL}/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

// Subir imagen y vincularla a un producto
export const uploadProductImage = async (productId, imageFile, token) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await axios.post(`${API_URL}/${productId}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

// Listar productos con paginación opcional
export const listProducts = async (page = 0) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error.message);
      throw error;
    }
  };