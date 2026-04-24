import { Event } from '@/types';

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Tech Meetup 2026',
    description: 'Join us for the annual tech meetup to discuss AI and quantum computing. Network with local developers and industry leaders.',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    time: '18:00',
    location: {
      name: 'T-Hub',
      address: 'Knowledge City, Madhapur, Hyderabad, Telangana 500081',
      coordinates: {
        latitude: 17.4367,
        longitude: 78.3812,
      },
    },
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    organizer: {
      id: 'o1',
      name: 'Hyderabad Techies',
      isVerified: true,
    },
    category: {
      id: 'c1',
      name: 'Technology',
      color: '#8B5CF6',
    },
    attendeesCount: 156,
    isAttending: true,
    isBookmarked: false,
  },
  {
    id: 'e2',
    title: 'Local Food Festival',
    description: 'Experience the best street food and local delicacies. Over 50 vendors participating.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00',
    location: {
      name: 'Hitex Exhibition Center',
      address: 'Izzathnagar, Kothaguda, Hyderabad, Telangana 500084',
    },
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    organizer: {
      id: 'o2',
      name: 'City Events Board',
      isVerified: true,
    },
    category: {
      id: 'c2',
      name: 'Food & Drink',
      color: '#F59E0B',
    },
    attendeesCount: 843,
    isAttending: false,
    isBookmarked: true,
  },
  {
    id: 'e3',
    title: 'Charity Run 5K',
    description: 'Run for a cause! All proceeds go to local animal shelters. Register now and get a free t-shirt.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    time: '06:00',
    location: {
      name: 'KBR Park',
      address: 'Jubilee Hills, Hyderabad, Telangana 500033',
    },
    imageUrl: 'https://images.unsplash.com/photo-1552674605-15c2145efa38?w=800',
    organizer: {
      id: 'o3',
      name: 'Runners Club',
      isVerified: false,
    },
    category: {
      id: 'c3',
      name: 'Sports',
      color: '#10B981',
    },
    attendeesCount: 320,
    isAttending: false,
    isBookmarked: false,
  },
];
