import { apiClient } from './client';

export const hrApi = {
    // Campaigns
    async getCampaigns(): Promise<any[]> {
        return apiClient.get('/hr/campaigns');
    },
    async createCampaign(data: any): Promise<any> {
        return apiClient.post('/hr/campaigns', data);
    },

    // Leads
    async getLeads(): Promise<any[]> {
        return apiClient.get('/hr/leads');
    },
    async createLead(data: any): Promise<any> {
        return apiClient.post('/hr/leads', data);
    },
    async updateLeadStage(id: string, stage: string): Promise<any> {
        return apiClient.put(`/hr/leads/${id}/stage`, { stage });
    }
};
