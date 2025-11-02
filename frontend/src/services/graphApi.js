import api from './api';

export const graphApiService = {
  async getGraphStats() {
    const response = await api.get('/api/graph/stats');
    return response.data;
  },

  async getDecisionTimeline(decision_id) {
    const response = await api.get(`/api/graph/timeline/${decision_id}`);
    return response.data;
  },

  async getRelatedDecisions(decision_id) {
    const response = await api.get(`/api/graph/related-decisions/${decision_id}`);
    return response.data;
  },

  async getEventCausality(event_id) {
    const response = await api.get(`/api/graph/causality/${event_id}`);
    return response.data;
  },

  async getDecisionImpact(decision_id) {
    const response = await api.get(`/api/graph/impact/${decision_id}`);
    return response.data;
  },

  async searchDecisions(query) {
    const response = await api.get('/api/graph/search', {
      params: { query }
    });
    return response.data;
  },
};

export default graphApiService;
