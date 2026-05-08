import { apiClient } from './client';

export const employeeApi = {
    // Tasks
    async getTasks(employeeId: string): Promise<any[]> {
        return apiClient.get(`/employee/tasks/${employeeId}`);
    },
    async createTask(data: any): Promise<any> {
        return apiClient.post('/employee/tasks', data);
    },
    async updateTaskStatus(taskId: string, status: string): Promise<any> {
        return apiClient.put(`/employee/tasks/${taskId}/status`, { status });
    },

    // Leaves
    async getLeaves(employeeId: string): Promise<any[]> {
        return apiClient.get(`/employee/leaves/${employeeId}`);
    },
    async applyLeave(data: any): Promise<any> {
        return apiClient.post('/employee/leaves', data);
    },
    async updateLeaveStatus(leaveId: string, status: string, approvedBy?: string): Promise<any> {
        return apiClient.put(`/employee/leaves/${leaveId}/status`, { status, approved_by: approvedBy });
    },

    // Attendance
    async getAttendance(employeeId: string): Promise<any[]> {
        return apiClient.get(`/employee/attendance/${employeeId}`);
    },
    async clockIn(data: { employee_id: string, date: string, clock_in: string, status: string }): Promise<any> {
        return apiClient.post('/employee/attendance/clock-in', data);
    },
    async clockOut(recordId: string, clockOut: string, hoursWorked: number): Promise<any> {
        return apiClient.put(`/employee/attendance/${recordId}/clock-out`, { clock_out: clockOut, hours_worked: hoursWorked });
    }
};
