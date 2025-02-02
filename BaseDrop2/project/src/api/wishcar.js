import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Cambia esto por la URL de tu API si es diferente

// Crear un carrito de compras
export const createWishCar = async (token) => {
    try {
        const response = await axios.post(`${API_URL}/createCar`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error creando el carrito:', error);
        throw error;
    }
};

// Obtener el carrito de compras por usuario
export const getWishCarById = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/wishcar`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo el carrito:', error);
        throw error;
    }
};

// Agregar un producto al carrito
export const addItemToCar = async (carId, quantity, token) => {
    try {
        const response = await axios.post(`${API_URL}/addItem/${carId}`, { quantity }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error agregando ítem al carrito:', error);
        throw error;
    }
};

// Listar ítems en el carrito
export const listItemsInCar = async (carId, token) => {
    try {
        const response = await axios.get(`${API_URL}/wishcar/${carId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error listando ítems del carrito:', error);
        throw error;
    }
};

// Remover un ítem del carrito
export const removeItemFromCar = async (itemId, token) => {
    try {
        const response = await axios.delete(`${API_URL}/wishcar/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error removiendo ítem del carrito:', error);
        throw error;
    }
};
