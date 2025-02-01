import axios from "axios";

const API_URL = "http://localhost:5050"; 

export default async function signup(username, email, password) {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      username,
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

