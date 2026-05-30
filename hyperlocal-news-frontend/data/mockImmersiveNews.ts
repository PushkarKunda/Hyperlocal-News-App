export interface ImmersiveArticle {
  id: string;
  category: string;
  categoryColor: string;
  headline: string;
  points: string[];
  readTime: string;
  image: any;
  bulletIcon: any;
}

export const IMMERSIVE_NEWS: ImmersiveArticle[] = [
  {
    id: 'immersive-1',
    category: 'TECH',
    categoryColor: '#4648D4',
    headline: 'The Future of Generative UI',
    points: [
      'Real-time adaptive interfaces based on user intent, utilizing advanced machine learning models to predict user needs before they interact.',
      'Seamless integration of AI-driven dynamic layouts that restructure themselves to prioritize the most relevant information for the specific context.'
    ],
    readTime: '5 min read',
    image: require('@/assets/immersive_feed/2c3d1deb3b82a50641bc673e72c89d3b04b5dc95.png'),
    bulletIcon: require('@/assets/immersive_feed/3af47802d4a90ecfd2d304dda76e03500da288fe.svg')
  },
  {
    id: 'immersive-2',
    category: 'DESIGN',
    categoryColor: '#006A61',
    headline: 'Minimalism in 2024',
    points: [
      'Shift from decorative to functional minimalism, where every element must serve a purpose or improve the user\'s cognitive load significantly.',
      'Focus on high-quality typography and fluid motion, replacing heavy graphics with elegant type scales and meaningful animations.'
    ],
    readTime: '8 min read',
    image: require('@/assets/immersive_feed/2cb9d6a46b92c20afb66ea498e5b8c73ca41a900.png'),
    bulletIcon: require('@/assets/immersive_feed/73a8e753f983bd1eb864fbf9b66280e4005b2e91.svg')
  },
  {
    id: 'immersive-3',
    category: 'SCIENCE',
    categoryColor: '#B90538',
    headline: 'The Green Tech Boom',
    points: [
      'New carbon capture tech deployed at scale, capable of pulling megatons of CO2 directly from the atmosphere and storing it safely beneath the seabed.',
      'Global shift towards decentralized energy grids, empowering local communities to manage solar and wind resources through smart micro-grids.'
    ],
    readTime: '6 min read',
    image: require('@/assets/immersive_feed/b068627cb60eee0d6d77a2545218f82f337320d9.png'),
    bulletIcon: require('@/assets/immersive_feed/74fb8252a40d7398a546ce03667651ed73b2350b.svg')
  }
];
