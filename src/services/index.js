import apiService from './apiService.js';
import { API_ENDPOINTS } from '../config/endpoints.js';

// Servicio de autenticación
export const authService = {
    async login(email, password) {
        try {
            const response = await apiService.post(API_ENDPOINTS.auth.login, {
                email,
                password
            });
            
            if (response.success && response.data.token) {
                apiService.setToken(response.data.token);
                if (response.data.refreshToken) {
                    apiService.setRefreshToken(response.data.refreshToken);
                }

        if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    },

    async register(userData) {
        return await apiService.post(API_ENDPOINTS.auth.register, userData);
    },

    async logout() {
        try {
            await apiService.post(API_ENDPOINTS.auth.logout);
        } catch (error) {
            console.warn('Logout error:', error);
        } finally {
            apiService.clearTokens();
        }
    },

    async forgotPassword(email) {
        return await apiService.post(API_ENDPOINTS.auth.forgotPassword, { email });
    },

    async resetPassword(token, newPassword) {
        return await apiService.post(API_ENDPOINTS.auth.resetPassword, {
            token,
            password: newPassword
        });
    }
};

// Servicio de operarios
export const operatorService = {
    async getAll() {
        return await apiService.get(API_ENDPOINTS.operators.list);
    },

    async getById(id) {
        return await apiService.get(API_ENDPOINTS.operators.getById(id));
    },

    async create(operatorData) {
        return await apiService.post(API_ENDPOINTS.operators.create, operatorData);
    },

    async update(id, operatorData) {
        return await apiService.put(API_ENDPOINTS.operators.update(id), operatorData);
    },

    async delete(id) {
        return await apiService.delete(API_ENDPOINTS.operators.delete(id));
    },

    async getActive() {
        return await apiService.get(API_ENDPOINTS.operators.active);
    },

    async search(query) {
        return await apiService.get(`${API_ENDPOINTS.operators.search}?q=${encodeURIComponent(query)}`);
    }
};

// Servicio de producción
export const productionService = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_ENDPOINTS.production.list}?${queryString}` : API_ENDPOINTS.production.list;
        return await apiService.get(endpoint);
    },

    async getById(id) {
        return await apiService.get(API_ENDPOINTS.production.getById(id));
    },

    async create(productionData) {
        return await apiService.post(API_ENDPOINTS.production.create, productionData);
    },

    async update(id, productionData) {
        return await apiService.put(API_ENDPOINTS.production.update(id), productionData);
    },

    async delete(id) {
        return await apiService.delete(API_ENDPOINTS.production.delete(id));
    },

    async getReports(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_ENDPOINTS.production.reports}?${queryString}` : API_ENDPOINTS.production.reports;
        return await apiService.get(endpoint);
    },

    async getStats(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_ENDPOINTS.production.stats}?${queryString}` : API_ENDPOINTS.production.stats;
        return await apiService.get(endpoint);
    },

    async getByDate(startDate, endDate) {
        return await apiService.get(`${API_ENDPOINTS.production.byDate}?start=${startDate}&end=${endDate}`);
    },

    async getByOperator(operatorId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_ENDPOINTS.production.byOperator}/${operatorId}?${queryString}` : `${API_ENDPOINTS.production.byOperator}/${operatorId}`;
        return await apiService.get(endpoint);
    }
};

// Servicio de máquinas
export const machineService = {
    async getAll() {
        return await apiService.get(API_ENDPOINTS.machines.list);
    },

    async getById(id) {
        return await apiService.get(API_ENDPOINTS.machines.getById(id));
    },

    async create(machineData) {
        return await apiService.post(API_ENDPOINTS.machines.create, machineData);
    },

    async update(id, machineData) {
        return await apiService.put(API_ENDPOINTS.machines.update(id), machineData);
    },

    async delete(id) {
        return await apiService.delete(API_ENDPOINTS.machines.delete(id));
    },

    async getStatus() {
        return await apiService.get(API_ENDPOINTS.machines.status);
    },

    async getMaintenance() {
        return await apiService.get(API_ENDPOINTS.machines.maintenance);
    }
};

// Servicio de áreas
export const areaService = {
    async getAll() {
        return await apiService.get(API_ENDPOINTS.areas.list);
    },

    async getById(id) {
        return await apiService.get(API_ENDPOINTS.areas.getById(id));
    },

    async create(areaData) {
        return await apiService.post(API_ENDPOINTS.areas.create, areaData);
    },

    async update(id, areaData) {
        return await apiService.put(API_ENDPOINTS.areas.update(id), areaData);
    },

    async delete(id) {
        return await apiService.delete(API_ENDPOINTS.areas.delete(id));
    }
};

// Servicio de procesos
export const processService = {
    async getAll() {
        return await apiService.get(API_ENDPOINTS.processes.list);
    },

    async getById(id) {
        return await apiService.get(API_ENDPOINTS.processes.getById(id));
    },

    async create(processData) {
        return await apiService.post(API_ENDPOINTS.processes.create, processData);
    },

    async update(id, processData) {
        return await apiService.put(API_ENDPOINTS.processes.update(id), processData);
    },

    async delete(id) {
        return await apiService.delete(API_ENDPOINTS.processes.delete(id));
    }
};

// Servicio de insumos
export const supplyService = {
    async getAll() {
        return await apiService.get(API_ENDPOINTS.supplies.list);
    },

    async getById(id) {
        return await apiService.get(API_ENDPOINTS.supplies.getById(id));
    },

    async create(supplyData) {
        return await apiService.post(API_ENDPOINTS.supplies.create, supplyData);
    },

    async update(id, supplyData) {
        return await apiService.put(API_ENDPOINTS.supplies.update(id), supplyData);
    },

    async delete(id) {
        return await apiService.delete(API_ENDPOINTS.supplies.delete(id));
    },

    async getStock() {
        return await apiService.get(API_ENDPOINTS.supplies.stock);
    },

    async getLowStock() {
        return await apiService.get(API_ENDPOINTS.supplies.lowStock);
    }
};

// Servicio de jornadas
export const workShiftService = {
    async getAll() {
        return await apiService.get(API_ENDPOINTS.workShifts.list);
    },

    async getById(id) {
        return await apiService.get(API_ENDPOINTS.workShifts.getById(id));
    },

    async create(shiftData) {
        return await apiService.post(API_ENDPOINTS.workShifts.create, shiftData);
    },

    async update(id, shiftData) {
        return await apiService.put(API_ENDPOINTS.workShifts.update(id), shiftData);
    },

    async delete(id) {
        return await apiService.delete(API_ENDPOINTS.workShifts.delete(id));
    },

    async getCurrent() {
        return await apiService.get(API_ENDPOINTS.workShifts.current);
    },

    async getByOperator(operatorId) {
        return await apiService.get(API_ENDPOINTS.workShifts.byOperator(operatorId));
    }
};

// Servicio de dashboard
export const dashboardService = {
    async getStats() {
        return await apiService.get(API_ENDPOINTS.dashboard.stats);
    },

    async getCharts() {
        return await apiService.get(API_ENDPOINTS.dashboard.charts);
    },

    async getRecent() {
        return await apiService.get(API_ENDPOINTS.dashboard.recent);
    },

    async getSummary() {
        return await apiService.get(API_ENDPOINTS.dashboard.summary);
    }
};

// Servicio de usuarios
export const userService = {
    async getAll() {
        return await apiService.get(API_ENDPOINTS.users.list);
    },

    async getById(id) {
        return await apiService.get(API_ENDPOINTS.users.getById(id));
    },

    async create(userData) {
        return await apiService.post(API_ENDPOINTS.users.create, userData);
    },

    async update(id, userData) {
        return await apiService.put(API_ENDPOINTS.users.update(id), userData);
    },

    async delete(id) {
        return await apiService.delete(API_ENDPOINTS.users.delete(id));
    },

    async getProfile() {
        return await apiService.get(API_ENDPOINTS.users.profile);
    },

    async changePassword(currentPassword, newPassword) {
        return await apiService.put(API_ENDPOINTS.users.changePassword, {
            currentPassword,
            newPassword
        });
    }
};

// Servicio de búsqueda
export const searchService = {
    async globalSearch(query) {
        return await apiService.get(`${API_ENDPOINTS.search.global}?q=${encodeURIComponent(query)}`);
    },

    async searchOperators(query) {
        return await apiService.get(`${API_ENDPOINTS.search.operators}?q=${encodeURIComponent(query)}`);
    },

    async searchProduction(query) {
        return await apiService.get(`${API_ENDPOINTS.search.production}?q=${encodeURIComponent(query)}`);
    },

    async searchMachines(query) {
        return await apiService.get(`${API_ENDPOINTS.search.machines}?q=${encodeURIComponent(query)}`);
    }
};

// Servicio de health check
export const healthService = {
    async getStatus() {
        return await apiService.get(API_ENDPOINTS.health.status);
    },

    async ping() {
        return await apiService.ping();
    },

    async getVersion() {
        return await apiService.get(API_ENDPOINTS.health.version);
    },

    async checkReady() {
        return await apiService.get(API_ENDPOINTS.health.ready);
    }
};

// Exportar todos los servicios
export {
    apiService as default,
    authService as auth,
    operatorService as operators,
    productionService as production,
    machineService as machines,
    areaService as areas,
    processService as processes,
    supplyService as supplies,
    workShiftService as workShifts,
    dashboardService as dashboard,
    userService as users,
    searchService as search,
    healthService as health
};
