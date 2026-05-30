import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Poll } from '@/types';

// ─── API Simulation Layer ───────────────────────────────────────────────────
// These functions are where you would later add Supabase or REST API calls.
// No UI changes will be needed once these are updated with real fetch/post logic.

const api = {
  fetchPolls: async (allPolls: Poll[]): Promise<Poll[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return allPolls;
  },
  
  vote: async (pollId: string, optionId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    // In a real app, this would be: await supabase.from('votes').insert(...)
  },

  undoVote: async (pollId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    // In a real app, this would be: await supabase.from('votes').delete(...)
  }
};

// ─── Hooks ──────────────────────────────────────────────────────────────────

/** Fetch all community polls */
export const usePolls = () => {
  const pollsFromStore = useStore((state) => state.polls);

  return useQuery({
    queryKey: ['polls'],
    queryFn: () => api.fetchPolls(pollsFromStore),
    // Keep data fresh if store changes
    placeholderData: pollsFromStore,
  });
};

/** Cast a vote in a poll */
export const useVotePoll = () => {
  const queryClient = useQueryClient();
  const votePollStore = useStore((state) => state.votePoll);

  return useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) => 
      api.vote(pollId, optionId),
    // Optimistic Update: Update the UI immediately
    onMutate: async ({ pollId, optionId }) => {
      // Cancel refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['polls'] });
      
      // Update the local state (store) immediately
      votePollStore(pollId, optionId);
      
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
    mutationFn: (pollId: string) => api.undoVote(pollId),
    // Optimistic Update
    onMutate: async (pollId) => {
      await queryClient.cancelQueries({ queryKey: ['polls'] });
      undoVotePollStore(pollId);
      return { pollId };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
};
