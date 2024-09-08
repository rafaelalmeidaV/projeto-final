// common.js

// Função para obter o token do localStorage
function getToken() {
    return localStorage.getItem('auth_token');
}

// Função para fazer uma requisição autenticada
function authenticatedFetch(url, options) {
    const token = getToken();
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    return fetch(url, {
        ...options,
        headers
    });
}
