// hooks/usePolls.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pollsApi, CreatePollPayload, VotePollPayload } from '@/services/api/polls';
import { useAuthStore } from '@/store/authStore';
import { getApiError } from '@/services/api/client';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const POLL_KEYS = {
  all: ['polls'] as const,
  active: () => [...POLL_KEYS.all, 'active'] as const,
  detail: (uid: string) => [...POLL_KEYS.all, 'detail', uid] as const,
};

// ─── Get Active Polls ─────────────────────────────────────────────────────────
export const useActivePolls = (params?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: POLL_KEYS.active(),
    queryFn: () => pollsApi.getActivePolls(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ─── Get Single Poll ──────────────────────────────────────────────────────────
export const usePollDetail = (pollUid: string) => {
  return useQuery({
    queryKey: POLL_KEYS.detail(pollUid),
    queryFn: () => pollsApi.getPollById(pollUid),
    enabled: !!pollUid,
  });
};

// ─── Create Poll ──────────────────────────────────────────────────────────────
export const useCreatePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePollPayload) => pollsApi.createPoll(payload),
    onSuccess: () => {
      // Refresh active polls list
      queryClient.invalidateQueries({ queryKey: POLL_KEYS.active() });
    },
    onError: (error) => {
      console.error('Create poll failed:', getApiError(error));
    },
  });
};

// ─── Vote Poll ────────────────────────────────────────────────────────────────
export const useVotePoll = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (params: { pollUid: string; optionIndex: number }) => {
      if (!user?.user_uid) throw new Error('Must be logged in to vote');

      const payload: VotePollPayload = {
        poll_uid: params.pollUid,
        option_index: params.optionIndex,
        user_uid: user.user_uid,
      };
      return pollsApi.votePoll(payload);
    },
    onSuccess: (_, variables) => {
      // Refresh the specific poll
      queryClient.invalidateQueries({
        queryKey: POLL_KEYS.detail(variables.pollUid),
      });
      queryClient.invalidateQueries({ queryKey: POLL_KEYS.active() });
    },
    onError: (error) => {
      console.error('Vote failed:', getApiError(error));
    },
  });
};

// ─── Delete Poll ──────────────────────────────────────────────────────────────
export const useDeletePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pollId: number) => pollsApi.deletePoll(pollId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLL_KEYS.active() });
    },
  });
};