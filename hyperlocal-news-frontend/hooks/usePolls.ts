import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Poll } from '@/types';
import { API_CONFIG, pollsApi } from '@/services/api';

// ─── API Simulation Layer ───────────────────────────────────────────────────
// These functions are where you would later add Supabase or REST API calls.
// No UI changes will be needed once these are updated with real fetch/post logic.

// ─── Hooks ──────────────────────────────────────────────────────────────────

/** Fetch all community polls */
export const usePolls = () => {
  const pollsFromStore = useStore((state) => state.polls);

  return useQuery({
    queryKey: ['polls', API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: async () => {
      if (API_CONFIG.useMocks) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return pollsFromStore;
      }

      return pollsApi.list();
    },
    placeholderData: pollsFromStore,
  });
};

/** Cast a vote in a poll */
export const useVotePoll = () => {
  const queryClient = useQueryClient();
  const votePollStore = useStore((state) => state.votePoll);

  return useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) =>
      API_CONFIG.useMocks ? Promise.resolve(undefined) : pollsApi.vote(pollId, optionId),
    // Optimistic Update: Update the UI immediately
    onMutate: async ({ pollId, optionId }) => {
      // Cancel refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['polls'] });

      if (API_CONFIG.useMocks) {
        // Update the local state (store) immediately
        votePollStore(pollId, optionId);
      }
      
      return { pollId, optionId };
    },
    onSettled: () => {
      // Refresh to ensure sync with "server"
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
};

/** Undo a previously cast vote */
export const useUndoVotePoll = () => {
  const queryClient = useQueryClient();
  const undoVotePollStore = useStore((state) => state.undoVotePoll);

  return useMutation({
    mutationFn: (pollId: string) =>
      API_CONFIG.useMocks ? Promise.resolve(undefined) : pollsApi.undoVote(pollId),
    // Optimistic Update
    onMutate: async (pollId) => {
      await queryClient.cancelQueries({ queryKey: ['polls'] });
      if (API_CONFIG.useMocks) {
        undoVotePollStore(pollId);
      }
      return { pollId };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
};
