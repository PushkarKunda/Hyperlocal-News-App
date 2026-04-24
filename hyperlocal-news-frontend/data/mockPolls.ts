import { Poll } from '@/types';

export const MOCK_POLLS: Poll[] = [
  {
    id: 'p1',
    question: 'Should the city council approve the new metro line extension?',
    options: [
      { id: 'o1', text: 'Yes, we need better transit', votes: 1250 },
      { id: 'o2', text: 'No, it will cause too much disruption', votes: 430 },
      { id: 'o3', text: 'Undecided', votes: 120 },
    ],
    totalVotes: 1800,
    author: {
      id: 'a1',
      name: 'City Planning Dept',
      isVerified: true,
    },
    category: {
      id: 'c4',
      name: 'Infrastructure',
      color: '#3B82F6',
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    hasVoted: false,
  },
  {
    id: 'p2',
    question: 'What is your favorite local street food spot?',
    options: [
      { id: 'o4', text: 'Ramas Dosa', votes: 540 },
      { id: 'o5', text: 'Gokul Chat', votes: 890 },
      { id: 'o6', text: 'DLF Street', votes: 1100 },
      { id: 'o7', text: 'Sindhi Colony', votes: 320 },
    ],
    totalVotes: 2850,
    author: {
      id: 'a2',
      name: 'Foodies of Hyderabad',
      isVerified: false,
    },
    category: {
      id: 'c2',
      name: 'Food & Drink',
      color: '#F59E0B',
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    hasVoted: false,
  },
];
