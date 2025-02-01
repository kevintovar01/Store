import axios from 'axios';

export const login = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:8080/login', { email, password });
    const token = response.data.token; // Asumimos que el token viene en la propiedad 'token' de la respuesta
    return token;
  } catch (error) {
    console.error('Error al hacer login:', error);
    throw new Error('Error en la autenticación');
  }
};

export const getUserInfo = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      return response.data; // Devuelve los datos obtenidos de la API
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  };
  