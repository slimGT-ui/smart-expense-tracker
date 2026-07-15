// API функции для работы с backend

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('access_token');
            window.location.reload();
            return null;
        }
        
        if (response.status === 204) {
            return { success: true };
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Ошибка запроса');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// API методы
const api = {
    // Авторизация
    auth: {
        register: (data) => apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        
        login: (data) => apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        
        me: () => apiRequest('/auth/me')
    },
    
    // Категории
    categories: {
        list: () => apiRequest('/categories')
    },
    
    // Расходы
    expenses: {
        list: (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return apiRequest(`/expenses${queryString ? '?' + queryString : ''}`);
        },
        
        create: (data) => apiRequest('/expenses', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        
        delete: (id) => apiRequest(`/expenses/${id}`, {
            method: 'DELETE'
        })
    },
    
    // Аналитика
    analytics: {
        summary: (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return apiRequest(`/analytics/summary${queryString ? '?' + queryString : ''}`);
        }
    }
};
