import { apiClient } from './client';

export const authApi = {
    async login(email: string, password: string): Promise<{ user: any, token: string }> {
        return apiClient.post('/auth/login', { email, password });
    }
};
