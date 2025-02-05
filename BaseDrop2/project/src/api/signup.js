const API_URL = "http://localhost:5050";

async function signUp(email, password) {
    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
        throw new Error(`Error en signup: ${response.statusText}`);
    }
    
    return response.json();
}

async function signUpBusiness(email, password, companyName, companyId) {
    const response = await fetch(`${API_URL}/signupBusiness`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, company_name: companyName, company_id: companyId })
    });
    
    if (!response.ok) {
        throw new Error(`Error en signupBusiness: ${response.statusText}`);
    }
    
    return response.json();
}

export { signUp, signUpBusiness };