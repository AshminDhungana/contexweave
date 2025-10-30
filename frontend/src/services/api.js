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

  // Decisions
  async createDecision(title, description) {
    const response = await api.post('/api/decisions', {
      title,
      description,
    });
    return response.data;
  },

  async getDecisions() {
    const response = await api.get('/api/decisions');
    return response.data;
  },

  async getDecision(id) {
    const response = await api.get(`/api/decisions/${id}`);
    return response.data;
  },

  // Events
  async createEvent(eventType, source, data) {
    const response = await api.post('/api/events', {
      event_type: eventType,
      source,
      data,
    });
    return response.data;
  },

  async getEvents() {
    const response = await api.get('/api/events');
    return response.data;
  },
};

export default api;
