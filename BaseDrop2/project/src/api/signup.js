import axios from "axios";

const API_URL = "http://localhost:5050";

// Función para registrar un usuario regular
export async function signup(email, password) {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      email,
      password,
    });

    console.log("Registro exitoso:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error en el registro:", error.response?.data || error.message);
    throw error.response?.data || new Error("Error en el registro");
  }
}

// Función para registrar un 'Businessman'
export async function signupBusiness(email, password, companyName, companyId) {
  try {
    const response = await axios.post(`${API_URL}/signupBusiness`, {
      email,
      password,
      companyName,
      companyId,
    });

    console.log("Registro de negocio exitoso:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error en el registro de negocio:", error.response?.data || error.message);
    throw error.response?.data || new Error("Error en el registro de negocio");
  }
}
