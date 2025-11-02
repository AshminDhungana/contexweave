import api from './api';

export const graphApiService = {
  /**
   * Get graph statistics
   * @returns {Promise} Graph stats with node/relationship counts
   */
  async getGraphStats() {
    const response = await api.get(`/api/graph/stats`);
    return response.data;
  },

  /**
   * Get temporal timeline for a decision
   * @param {number} decision_id - Decision ID
   * @returns {Promise} Timeline with all events in chronological order
   */
  async getDecisionTimeline(decision_id) {
    const response = await api.get(`/api/graph/timeline/${decision_id}`);
    return response.data;
  },

  /**
   * Get related decisions through the graph
   * @param {number} decision_id - Decision ID
   * @returns {Promise} Related decisions
   */
  async getRelatedDecisions(decision_id) {
    const response = await api.get(`/api/graph/related/${decision_id}`);
    return response.data;
  },

  /**
   * Get causality chain for an event
   * @param {number} event_id - Event ID
   * @returns {Promise} Causality chain
   */
  async getEventCausality(event_id) {
    const response = await api.get(`/api/graph/causality/${event_id}`);
    return response.data;
  },
};

export default graphApiService;
