// API Client to interact with FastAPI Backend

const BASE_URL = 'http://localhost:8000/api';

export const apiClient = {
    async get(endpoint: string) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                // Add Authorization header here later when JWT is fully implemented
            },
        });
        if (!response.ok) throw new Error(`API GET Error: ${response.statusText}`);
        return response.json();
    },

    async post(endpoint: string, body: any) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`API POST Error: ${response.statusText}`);
        return response.json();
    },

    async put(endpoint: string, body: any) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`API PUT Error: ${response.statusText}`);
        return response.json();
    },

    async delete(endpoint: string) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`API DELETE Error: ${response.statusText}`);
        return response.json();
    }
};
