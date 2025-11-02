import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Health check
  async getHealth() {
    const response = await api.get('/health');
    return response.data;
  },

  // Decisions - CRUD Operations
  async createDecision(title, description = null, context = null) {
    const response = await api.post('/api/decisions', {
      title,
      description,
      context,
    });
    return response.data;
  },

  async getDecisions(skip = 0, limit = 10) {
    const response = await api.get('/api/decisions', {
      params: { skip, limit }
    });
    return response.data;
  },

  async getDecision(id) {
    const response = await api.get(`/api/decisions/${id}`);
    return response.data;
  },

  async updateDecision(id, data) {
    const response = await api.put(`/api/decisions/${id}`, data);
    return response.data;
  },

  async deleteDecision(id) {
    const response = await api.delete(`/api/decisions/${id}`);
    return response.data;
  },

  // Events
  async createEvent(event_type, source = null, description = null) {
    const response = await api.post('/api/events', {
      event_type,
      source,
      description,
    });
    return response.data;
  },

  async getEvents(skip = 0, limit = 10) {
    const response = await api.get('/api/events', {
      params: { skip, limit }
    });
    return response.data;
  },

  async getRecentEvents(limit = 10) {
    const response = await api.get('/api/events/recent', {
      params: { limit }
    });
    return response.data;
  },
};

export default api;
