import axios from 'axios';

const API_URL = "http://localhost:5050";

// Función para iniciar sesión
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const token = response.data.token; // Asumimos que el token viene en la propiedad 'token' de la respuesta
    localStorage.setItem('token', token); // Almacenar el token en localStorage
    return token;
  } catch (error) {
    console.error('Error al hacer login:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error en la autenticación');
  }
};

// Función para obtener información del usuario
export const getUserInfo = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data; // Devuelve los datos obtenidos de la API
  } catch (error) {
    console.error('Error fetching user info:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al obtener la información del usuario');
  }
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem('token'); // Eliminar el token del localStorage
};