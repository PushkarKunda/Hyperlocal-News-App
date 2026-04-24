export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
  };
  category: {
    id: string;
    name: string;
    color?: string;
  };
  createdAt: string; // ISO format
  expiresAt?: string; // ISO format
  hasVoted?: boolean;
  selectedOptionId?: string;
}
