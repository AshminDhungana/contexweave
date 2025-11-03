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
  async getDecisionSummary(decision_id) {
    const response = await api.get(`/api/llm/summarize/${decision_id}`);
    return response.data;
  },

  async analyzeDecisionRisks(decision_id) {
    const response = await api.get(`/api/llm/analyze-risks/${decision_id}`);
    return response.data;
  },

  async generateNextSteps(decision_id) {
    const response = await api.get(`/api/llm/next-steps/${decision_id}`);
    return response.data;
  },

  async evaluateDecisionQuality(decision_id) {
    const response = await api.get(`/api/llm/quality-score/${decision_id}`);
    return response.data;
  },

  async getDecisionMetrics(decision_id) {
    const response = await api.get(`/api/analytics/decision/${decision_id}`);
    return response.data;
  },

  async getAnalyticsOverview() {
    const response = await api.get('/api/analytics/overview');
    return response.data;
  },

  async getEventTypeDistribution() {
    const response = await api.get('/api/analytics/event-types');
    return response.data;
  },

  async getTimelineStats(days = 30) {
    const response = await api.get('/api/analytics/timeline', { params: { days } });
    return response.data;
  },

  async getStatusSummary() {
    const response = await api.get('/api/analytics/status-summary');
    return response.data;
  },
};

export default graphApiService;
