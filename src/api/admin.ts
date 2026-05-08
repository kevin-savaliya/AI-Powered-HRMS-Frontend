import { apiClient } from './client';

export const adminApi = {
    async getUsers(): Promise<any[]> {
        return apiClient.get('/admin/users');
    },

    async createUser(data: {
        name: string;
        email: string;
        password: string;
        role: string;
        department?: string;
    }): Promise<any> {
        return apiClient.post('/admin/users', data);
    },

    async deleteUser(id: string): Promise<void> {
        return apiClient.delete(`/admin/users/${id}`);
    },

    async getDepartments(): Promise<any[]> {
        return apiClient.get('/admin/departments');
    },

    async createDepartment(data: {
        name: string;
        parentId?: string;
        description?: string;
    }): Promise<any> {
        return apiClient.post('/admin/departments', data);
    },

    async getAnalytics(): Promise<{
        totalEmployees: number;
        totalHR: number;
        pendingLeaves: number;
        activeTasks: number;
    }> {
        return apiClient.get('/admin/analytics');
    },
};
