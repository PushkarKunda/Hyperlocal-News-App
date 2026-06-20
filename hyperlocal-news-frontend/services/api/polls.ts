// services/api/polls.ts
import { request } from './client';
import { API_ROUTES } from './routes';

// ─── Types (matching API JSON) ────────────────────────────────────────────────

export interface PollOption {
  index: number;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  poll_uid: string;
  question: string;
  options: string[];
  votes: number[];
  expires_at: string | null;
  created_at: string;
  total_votes?: number;
  user_voted_index?: number | null;
}

export interface PollDetail extends Poll {
  poll_uid: string;
}

export interface CreatePollPayload {
  question: string;
  options: string[];
  expires_at?: string | null;
}

export interface VotePollPayload {
  poll_uid: string;
  option_index: number;
  user_uid: string;
}

// ─── Polls API ────────────────────────────────────────────────────────────────

export const pollsApi = {
  // GET /content/polls/active - Public
  getActivePolls: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ items: Poll[]; total: number }> => {
    return await request({
      url: API_ROUTES.content.activePolls,
      method: 'GET',
      params: {
        limit: params?.limit ?? 20,
        offset: params?.offset ?? 0,
      },
    });
  },

  // GET /content/polls/{poll_uid} - Public
  getPollById: async (pollUid: string): Promise<PollDetail> => {
    return await request({
      url: API_ROUTES.content.pollById(pollUid),
      method: 'GET',
    });
  },

  // POST /content/polls - Authenticated (Publisher+)
  createPoll: async (payload: CreatePollPayload): Promise<Poll> => {
    return await request({
      url: '/content/polls',
      method: 'POST',
      data: payload,
    });
  },

  // PUT /content/polls/vote - Authenticated
  votePoll: async (payload: VotePollPayload): Promise<void> => {
    return await request({
      url: API_ROUTES.content.pollVote,
      method: 'PUT',
      data: payload,
    });
  },

  // DELETE /content/admin/polls/{poll_id} - Moderator/Admin only
  deletePoll: async (pollId: number): Promise<void> => {
    return await request({
      url: `/content/admin/polls/${pollId}`,
      method: 'DELETE',
    });
  },
};