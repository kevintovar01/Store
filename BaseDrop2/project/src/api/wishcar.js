const API_URL = "http://localhost:5050";

// Crear un carrito de deseos
async function createWishCar() {
    const response = await fetch(`${API_URL}/createCar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    return response.json();
}

// Agregar un producto al carrito de deseos
async function addItemToWishCar(productId) {
    const response = await fetch(`${API_URL}/addItem/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    return response.json();
}

// Obtener el carrito de deseos por usuario
async function getWishCar() {
    const response = await fetch(`${API_URL}/wishcar`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    return response.json();
}

// Listar los productos dentro de un carrito de deseos específico
async function listItemsInWishCar(carId) {
    const response = await fetch(`${API_URL}/wishcar/${carId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    return response.json();
}

// Eliminar un producto del carrito de deseos
async function removeItemFromWishCar(productId) {
    const response = await fetch(`${API_URL}/wishcar/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
    return response.json();
}

export { createWishCar, addItemToWishCar, getWishCar, listItemsInWishCar, removeItemFromWishCar };
