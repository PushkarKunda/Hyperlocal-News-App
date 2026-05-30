export interface ShortVideo {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  author: {
    handle: string;
    name: string;
    avatarInitial: string;
  };
  stats: {
    likes: string;
    comments: string;
  };
  hashtags: string[];
  isLive: boolean;
}

export const MOCK_SHORTS: ShortVideo[] = [
  {
    id: '1',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Street Food Festival Kicks Off Downtown!',
    description: 'Over 50 local vendors have gathered at the main square. Expect crowds and amazing aromas until...',
    author: {
      handle: '@CityGazette',
      name: 'City Gazette',
      avatarInitial: 'C',
    },
    stats: {
      likes: '1.2k',
      comments: '45',
    },
    hashtags: ['#LocalEvents', '#Foodie', '#Downtown'],
    isLive: true,
  },
  {
    id: '2',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    title: 'New Metro Line Testing Phase',
    description: 'The highly anticipated blue line extension is finally undergoing rigorous testing before the public opening next month.',
    author: {
      handle: '@TransitNews',
      name: 'Transit News',
      avatarInitial: 'T',
    },
    stats: {
      likes: '8.4k',
      comments: '342',
    },
    hashtags: ['#Transit', '#CityUpdates', '#Metro'],
    isLive: false,
  },
  {
    id: '3',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    title: 'Weekend Farmers Market',
    description: 'Fresh organic produce and artisan crafts right in your neighborhood. Support local businesses!',
    author: {
      handle: '@LocalEats',
      name: 'Local Eats',
      avatarInitial: 'L',
    },
    stats: {
      likes: '450',
      comments: '12',
    },
    hashtags: ['#FarmersMarket', '#Organic', '#ShopLocal'],
    isLive: false,
  },
];
