import { Poll } from '@/types';
import { API_ROUTES } from './routes';
import { request } from './client';

export const pollsApi = {
  list: async () => {
    const response = await request<Poll[]>({ url: API_ROUTES.polls, method: 'GET' });
    return response.data;
  },

  vote: async (pollId: string, optionId: string) => {
    const response = await request<void>({
      url: API_ROUTES.pollVote,
      method: 'POST',
      data: { optionId },
    });
    return response.data;
  },

  undoVote: async (pollId: string) => {
    const response = await request<void>({
      url: API_ROUTES.pollUndoVote,
      method: 'DELETE',
    });
    return response.data;
  },
};
