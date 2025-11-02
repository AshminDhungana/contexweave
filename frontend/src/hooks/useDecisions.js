import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'

// ==================== QUERIES (Read) ====================

/**
 * Fetch all decisions with pagination
 * @param {number} skip - Records to skip
 * @param {number} limit - Max records to return
 */
export function useDecisions(skip = 0, limit = 10) {
  return useQuery({
    queryKey: ['decisions', skip, limit],
    queryFn: () => apiService.getDecisions(skip, limit),
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  })
}

/**
 * Fetch a single decision by ID
 * @param {number} id - Decision ID
 */
export function useDecision(id) {
  return useQuery({
    queryKey: ['decision', id],
    queryFn: () => apiService.getDecision(id),
    enabled: !!id, // Only run if id is provided
  })
}

// ==================== MUTATIONS (Create/Update/Delete) ====================

/**
 * Create a new decision
 * Usage: const createMutation = useCreateDecision()
 *        createMutation.mutate({ title, description, context })
 */
export function useCreateDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => apiService.createDecision(
      data.title,
      data.description,
      data.context
    ),
    onSuccess: () => {
      // After creating, refetch the list
      queryClient.invalidateQueries({ queryKey: ['decisions'] })
    },
    onError: (error) => {
      console.error('Failed to create decision:', error)
    },
  })
}

/**
 * Update an existing decision
 */
export function useUpdateDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => apiService.updateDecision(id, data),
    onSuccess: (data) => {
      // Update the single decision cache
      queryClient.setQueryData(['decision', data.id], data)
      // Refetch the list
      queryClient.invalidateQueries({ queryKey: ['decisions'] })
    },
  })
}

/**
 * Delete a decision (soft delete)
 */
export function useDeleteDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => apiService.deleteDecision(id),
    onSuccess: () => {
      // Refetch list after delete
      queryClient.invalidateQueries({ queryKey: ['decisions'] })
    },
  })
}

// ==================== EVENT HOOKS ====================

/**
 * Fetch all events
 */
export function useEvents(skip = 0, limit = 10) {
  return useQuery({
    queryKey: ['events', skip, limit],
    queryFn: () => apiService.getEvents(skip, limit),
  })
}

/**
 * Create a new event for a decision
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => apiService.createEvent(
      data.decision_id,  // ✨ NEW: Link to decision
      data.event_type,
      data.source,
      data.description
    ),
    onSuccess: (newEvent) => {
      // Refetch events for this decision
      queryClient.invalidateQueries({ queryKey: ['events', newEvent.decision_id] })
      // Also refetch all events
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

/**
 * Fetch all events for a specific decision (temporal timeline)
 */
export function useDecisionEvents(decision_id, skip = 0, limit = 50) {
  return useQuery({
    queryKey: ['decisionEvents', decision_id, skip, limit],
    queryFn: () => apiService.getDecisionEvents(decision_id, skip, limit),
    enabled: !!decision_id, // Only run if decision_id is provided
  })
}


/**
 * Delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => apiService.deleteEvent(id),
    onSuccess: () => {
      // Refetch all events and decisions
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['decisionEvents'] })
    },
  })
}
