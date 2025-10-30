import { create } from 'zustand';

export const useAppStore = create((set) => ({
  decisions: [],
  loading: false,
  error: null,

  // Decisions
  setDecisions: (decisions) => set({ decisions }),
  addDecision: (decision) =>
    set((state) => ({
      decisions: [decision, ...state.decisions],
    })),

  // State management
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
