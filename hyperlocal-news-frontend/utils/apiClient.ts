import axios from 'axios';
import { ApiResponse, State, District, City, Language, Interest, NewsArticle, Category, ShortVideo, ImmersiveArticle, Notification, Poll } from '@/types';

// Simulating database storage for runtime modifications (like creating articles or events)
export const API_DATABASE = {
  states: [
    { id: 'ts', name: 'Telangana', code: 'TS' },
    { id: 'ap', name: 'Andhra Pradesh', code: 'AP' },
    { id: 'ka', name: 'Karnataka', code: 'KA' },
    { id: 'tn', name: 'Tamil Nadu', code: 'TN' },
    { id: 'mh', name: 'Maharashtra', code: 'MH' },
    { id: 'dl', name: 'Delhi', code: 'DL' },
    { id: 'jk', name: 'Jammu & Kashmir', code: 'JK' },
    { id: 'la', name: 'Ladakh', code: 'LA' },
    { id: 'py', name: 'Puducherry', code: 'PY' },
    { id: 'ar', name: 'Arunachal Pradesh', code: 'AR' },
    { id: 'as', name: 'Assam', code: 'AS' },
    { id: 'br', name: 'Bihar', code: 'BR' },
    { id: 'cg', name: 'Chhattisgarh', code: 'CG' },
    { id: 'ga', name: 'Goa', code: 'GA' },
    { id: 'gj', name: 'Gujarat', code: 'GJ' },
    { id: 'hr', name: 'Haryana', code: 'HR' },
    { id: 'hp', name: 'Himachal Pradesh', code: 'HP' },
    { id: 'jh', name: 'Jharkhand', code: 'JH' },
    { id: 'kl', name: 'Kerala', code: 'KL' },
    { id: 'mp', name: 'Madhya Pradesh', code: 'MP' },
    { id: 'mn', name: 'Manipur', code: 'MN' },
    { id: 'ml', name: 'Meghalaya', code: 'ML' },
    { id: 'mz', name: 'Mizoram', code: 'MZ' },
    { id: 'nl', name: 'Nagaland', code: 'NL' },
    { id: 'or', name: 'Odisha', code: 'OR' },
    { id: 'pb', name: 'Punjab', code: 'PB' },
    { id: 'rj', name: 'Rajasthan', code: 'RJ' },
    { id: 'sk', name: 'Sikkim', code: 'SK' },
    { id: 'tr', name: 'Tripura', code: 'TR' },
    { id: 'up', name: 'Uttar Pradesh', code: 'UP' },
    { id: 'uk', name: 'Uttarakhand', code: 'UK' },
    { id: 'wb', name: 'West Bengal', code: 'WB' },
  ] as State[],

  languages: [
    { id: 'en', name: 'English', glyph: 'Aa' },
    { id: 'hi', name: 'Hindi', glyph: 'अ' },
    { id: 'te', name: 'Telugu', glyph: 'అ' },
    { id: 'ta', name: 'Tamil', glyph: 'అ' },
    { id: 'es', name: 'Spanish', glyph: 'Es' },
    { id: 'fr', name: 'French', glyph: 'Fr' },
  ] as Language[],

  districts: {
    ts: [
      { id: 'hyderabad', name: 'Hyderabad', code: 'HYD' },
      { id: 'medchal_malkajgiri', name: 'Medchal-Malkajgiri', code: 'MM' },
      { id: 'rangareddy', name: 'Rangareddy', code: 'RR' },
      { id: 'sangareddy', name: 'Sangareddy', code: 'SR' },
      { id: 'warangal', name: 'Warangal', code: 'WGL' },
      { id: 'karimnagar', name: 'Karimnagar', code: 'KMR' },
      { id: 'nizamabad', name: 'Nizamabad', code: 'NZB' },
      { id: 'khammam', name: 'Khammam', code: 'KMM' },
      { id: 'nalgonda', name: 'Nalgonda', code: 'NLG' },
      { id: 'mahabubnagar', name: 'Mahabubnagar', code: 'MBN' },
      { id: 'medak', name: 'Medak', code: 'MDK' },
      { id: 'adilabad', name: 'Adilabad', code: 'ADB' },
      { id: 'bhadradri_kothagudem', name: 'Bhadradri Kothagudem', code: 'BK' },
      { id: 'hanamkonda', name: 'Hanamkonda', code: 'HNK' },
      { id: 'jagtial', name: 'Jagtial', code: 'JGL' },
      { id: 'jangaon', name: 'Jangaon', code: 'JGN' },
      { id: 'jayashankar_bhupalpally', name: 'Jayashankar Bhupalpally', code: 'JB' },
      { id: 'jogulamba_gadwal', name: 'Jogulamba Gadwal', code: 'JG' },
      { id: 'kamareddy', name: 'Kamareddy', code: 'KMR' },
      { id: 'kumuram_bheem_asifabad', name: 'Kumuram Bheem Asifabad', code: 'KB' },
      { id: 'mahabubabad', name: 'Mahabubabad', code: 'MBB' },
      { id: 'mancherial', name: 'Mancherial', code: 'MCL' },
      { id: 'mulugu', name: 'Mulugu', code: 'MLG' },
      { id: 'nagarkurnool', name: 'Nagarkurnool', code: 'NKL' },
      { id: 'narayanpet', name: 'Narayanpet', code: 'NRP' },
      { id: 'nirmal', name: 'Nirmal', code: 'NML' },
      { id: 'peddapalli', name: 'Peddapalli', code: 'PDP' },
      { id: 'rajanna_sircilla', name: 'Rajanna Sircilla', code: 'RS' },
      { id: 'siddipet', name: 'Siddipet', code: 'SDP' },
      { id: 'suryapet', name: 'Suryapet', code: 'SYP' },
      { id: 'vikarabad', name: 'Vikarabad', code: 'VKB' },
      { id: 'wanaparthy', name: 'Wanaparthy', code: 'WNP' },
      { id: 'yadadri_bhuvanagiri', name: 'Yadadri Bhuvanagiri', code: 'YB' },
    ],
    ap: [
      { id: 'visakhapatnam', name: 'Visakhapatnam', code: 'VSP' },
      { id: 'ntr_vijayawada', name: 'NTR (Vijayawada)', code: 'NTR' },
      { id: 'guntur', name: 'Guntur', code: 'GTR' },
      { id: 'nellore_spsr', name: 'Nellore (SPSR)', code: 'NLR' },
      { id: 'kurnool', name: 'Kurnool', code: 'KNL' },
      { id: 'tirupati', name: 'Tirupati', code: 'TPT' },
      { id: 'kakinada', name: 'Kakinada', code: 'KKD' },
      { id: 'kadapa_ysr', name: 'Kadapa (YSR)', code: 'KDP' },
      { id: 'anantapur', name: 'Anantapur', code: 'ATP' },
      { id: 'vizianagaram', name: 'Vizianagaram', code: 'VZM' },
      { id: 'srikakulam', name: 'Srikakulam', code: 'SKL' },
      { id: 'east_godavari', name: 'East Godavari', code: 'EG' },
      { id: 'west_godavari', name: 'West Godavari', code: 'WG' },
      { id: 'chittoor', name: 'Chittoor', code: 'CTR' },
      { id: 'prakasam', name: 'Prakasam', code: 'PKM' },
      { id: 'anamayya', name: 'Anamayya', code: 'AMY' },
      { id: 'bapatla', name: 'Bapatla', code: 'BPT' },
      { id: 'eluru', name: 'Eluru', code: 'ELR' },
      { id: 'konaseema', name: 'Dr. B.R. Ambedkar Konaseema', code: 'KSM' },
      { id: 'manyam_parvathipuram', name: 'Parvathipuram Manyam', code: 'MYM' },
      { id: 'nandyal', name: 'Nandyal', code: 'NDY' },
      { id: 'palnadu', name: 'Palnadu', code: 'PLD' },
      { id: 'sri_satya_sai', name: 'Sri Satya Sai', code: 'SSS' },
      { id: 'alluri_sitharama_raju', name: 'Alluri Sitharama Raju', code: 'ASR' },
      { id: 'anakapalli', name: 'Anakapalli', code: 'AKP' },
    ]
  } as Record<string, Omit<District, 'stateId'>[]>,

  interests: [
    { id: 'tech', name: 'Tech', slug: 'tech', emoji: '💻', description: 'Tech & innovation' },
    { id: 'design', name: 'Design', slug: 'design', emoji: '🎨', description: 'Design & creativity' },
    { id: 'sports', name: 'Sports', slug: 'sports', emoji: '⚽', description: 'Games & athletics' },
    { id: 'music', name: 'Music', slug: 'music', emoji: '🎵', description: 'Songs & artists' },
    { id: 'art', name: 'Art', slug: 'art', emoji: '🖌️', description: 'Visual & fine arts' },
    { id: 'travel', name: 'Travel', slug: 'travel', emoji: '🧭', description: 'Journeys & nature' },
    { id: 'food', name: 'Food', slug: 'food', emoji: '🥪', description: 'Culinary & cooking' },
    { id: 'gaming', name: 'Gaming', slug: 'gaming', emoji: '🎮', description: 'E-sports & updates' },
    { id: 'wellness', name: 'Health & Wellness', slug: 'wellness', emoji: '🏥', description: 'Mindfulness and healthy living' },
  ] as Interest[],

  categories: [
    { id: '1', name: 'For You', slug: 'for-you', icon: 'auto-awesome', color: '#4648D4' },
    { id: '2', name: 'Local', slug: 'local', icon: 'location-on', color: '#10B981' },
    { id: '3', name: 'Politics', slug: 'politics', icon: 'account-balance', color: '#EF4444' },
    { id: '4', name: 'Sports', slug: 'sports', icon: 'sports-soccer', color: '#F59E0B' },
    { id: '5', name: 'Business', slug: 'business', icon: 'business', color: '#3B82F6' },
    { id: '6', name: 'Technology', slug: 'technology', icon: 'computer', color: '#8B5CF6' },
    { id: '7', name: 'Entertainment', slug: 'entertainment', icon: 'movie', color: '#EC4899' },
    { id: '8', name: 'Health', slug: 'health', icon: 'health-and-safety', color: '#14B8A6' },
    { id: '9', name: 'Education', slug: 'education', icon: 'school', color: '#6366F1' },
    { id: '10', name: 'Crime', slug: 'crime', icon: 'gavel', color: '#64748B' },
    { id: '11', name: 'Science', slug: 'science', icon: 'science', color: '#0EA5E9' },
    { id: '12', name: 'Environment', slug: 'environment', icon: 'eco', color: '#22C55E' },
    { id: '13', name: 'World News', slug: 'world-news', icon: 'public', color: '#06B6D4' },
  ] as Category[],

  news: [
    {
      id: '1',
      headline: 'Major Advancement in Local Quantum Infrastructure Projects',
      summary: 'The city council has officially approved a landmark budget for sustainable high-tech transit systems. This initiative aims to reduce carbon emissions by 40% and traffic congestion by 30% over the next decade.',
      content: 'Local municipal engineers in partnership with regional technical universities have laid down an elaborate implementation blueprint for quantum transit sensors. The framework relies on high-speed low-latency quantum-secure nodes scattered strategically across primary business zones like Hitech City and Gachibowli. Initial budget allocations hover near $120 million, expected to scale as execution milestones are met.',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      category: { id: '6', name: 'Technology', slug: 'technology', color: '#8B5CF6' },
      source: { id: '1', name: 'NewsWire Global', isVerified: true },
      author: { id: '1', name: 'John Smith', isVerified: true },
      location: { state: 'Telangana', district: 'Hyderabad', city: 'Hitech City' },
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      readTime: '4 min read',
      url: 'https://example.com/article/1',
      isBreaking: false,
      isBookmarked: false,
      stats: { views: 12500, likes: 1200, shares: 450, comments: 89, bookmarks: 234 },
      tags: ['technology', 'infrastructure', 'quantum'],
    },
    {
      id: '2',
      headline: 'Local Startups Secure Record $500M in Series B Funding',
      summary: 'In a historic week for the local ecosystem, three homegrown tech startups have announced massive funding rounds totaling half a billion dollars.',
      content: 'Kukatpally and Madhapur based fintech and supply chain logistics platforms have stunned industry observers by closing consecutive multi-million dollar venture capital infusions. Homegrown retail-enabler ShopEase led the charts with a massive $230M raise, followed closely by health-tech disruptor CareFlow at $180M. Investors cite favorable state regulations and a deep engineering talent pool in Telangana as primary factors for the confidence surge.',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
      category: { id: '5', name: 'Business', slug: 'business', color: '#3B82F6' },
      source: { id: '2', name: 'City Business Journal', isVerified: true },
      location: { state: 'Telangana', district: 'Hyderabad', city: 'Gachibowli' },
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      readTime: '5 min read',
      url: 'https://example.com/article/2',
      isBreaking: false,
      isBookmarked: false,
      stats: { views: 8900, likes: 890, shares: 234, comments: 56, bookmarks: 178 },
      tags: ['business', 'startups', 'funding'],
    },
    {
      id: '3',
      headline: 'Historic Downtown District Gets Major Facelift with New Public Spaces',
      summary: 'The mayor unveiled plans for a comprehensive renovation of the historic downtown area, including new pedestrian zones and green spaces.',
      content: 'A series of public hearings concluded with the city municipality finalizing a green revitalization masterplan for traditional marketplace lanes. The redevelopment involves converting dusty motorways into fully-pedestrianized cobblestone paths flanked by shade-providing local flora. Water rejuvenation experts have also been contracted to clean and scale the medieval public stepwells, returning them to functional local landmarks.',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      category: { id: '2', name: 'Local', slug: 'local', color: '#10B981' },
      source: { id: '3', name: 'Metro Daily', isVerified: true },
      location: { state: 'Telangana', district: 'Hyderabad', city: 'Secunderabad' },
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      readTime: '3 min read',
      url: 'https://example.com/article/3',
      isBreaking: false,
      isBookmarked: true,
      stats: { views: 15600, likes: 2100, shares: 678, comments: 145, bookmarks: 456 },
      tags: ['local', 'development', 'downtown'],
    },
    {
      id: '4',
      headline: 'City Team Clinches Championship Title After Thrilling Final Match',
      summary: 'In a nail-biting finish that kept fans on the edge of their seats, our local team emerged victorious in the championship final.',
      content: 'An electric crowd of 40,000 spectators witnessed a tactical masterclass as our home club fought back from a two-goal deficit to capture the domestic cup in a thrilling penalty shootout. Striker Vivek Anand scored the critical equalizer in the 89th minute, sending the arena into absolute ecstasy. The team dedicated the silverware to the neighborhood community during a victory parade this morning.',
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
      category: { id: '4', name: 'Sports', slug: 'sports', color: '#F59E0B' },
      source: { id: '4', name: 'Sports Central', isVerified: true },
      location: { state: 'Telangana', district: 'Hyderabad' },
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      readTime: '4 min read',
      url: 'https://example.com/article/4',
      isBreaking: false,
      isBookmarked: false,
      stats: { views: 45000, likes: 5400, shares: 1200, comments: 567, bookmarks: 890 },
      tags: ['sports', 'championship', 'football'],
    },
    {
      id: '5',
      headline: 'New Community Health Center Opens with State-of-the-Art Facilities',
      summary: 'The newly inaugurated health center features advanced diagnostic equipment and telemedicine capabilities.',
      content: 'Serving over 80,000 residents in surrounding divisions, the fully-digitized primary care clinic provides round-the-clock emergency support, modern pediatric care, and state of the art preventative diagnostics. Doctors can consult leading super-specialists in real-time through high-definition remote screening hubs. All consulting services will be subsidized for local families through government welfare programs.',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
      category: { id: '8', name: 'Health', slug: 'health', color: '#14B8A6' },
      source: { id: '5', name: 'Health Today', isVerified: true },
      location: { state: 'Telangana', district: 'Hyderabad', city: 'Kukatpally' },
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      readTime: '3 min read',
      url: 'https://example.com/article/5',
      isBreaking: false,
      isBookmarked: false,
      stats: { views: 6700, likes: 780, shares: 156, comments: 45, bookmarks: 123 },
      tags: ['health', 'community', 'healthcare'],
    },
    {
      id: '6',
      headline: 'Key Municipal Election Dates Announced for upcoming City Council Seats',
      summary: 'State officials have finalized the timeline for the highly anticipated municipal elections. Residents will cast votes across 15 wards early next month.',
      content: 'The Election Commission has announced the schedule for the local body polls. Electronic voting machines will be deployed across all registered booths with high-end safety verifications. Candidates have already initiated campaigning, prioritizing road infrastructure, green parks, and community healthcare initiatives.',
      imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800',
      category: { id: '3', name: 'Politics', slug: 'politics', color: '#EF4444' },
      source: { id: '1', name: 'NewsWire Global', isVerified: true },
      author: { id: '2', name: 'Jane Miller', isVerified: true },
      location: { state: 'Telangana', district: 'Hyderabad', city: 'Madhapur' },
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      readTime: '3 min read',
      url: 'https://example.com/article/6',
      isBreaking: false,
      isBookmarked: false,
      stats: { views: 18500, likes: 2300, shares: 780, comments: 342, bookmarks: 412 },
      tags: ['politics', 'election', 'local-gov'],
    },
    {
      id: '7',
      headline: 'Annual Film Festival Showcases Independent Local Directors and Creators',
      summary: 'The city cultural center kicked off the film festival, presenting over 40 original screenings and documentaries from homegrown talent.',
      content: 'Independent cinema enthusiasts have gathered at the central plaza for the grand opening. The three-day event will feature panel debates, director masterclasses, and hands-on screenwriting workshops. Prominent actor-producers from the regional industry are attending as jury members to recognize outstanding cinematic contributions.',
      imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
      category: { id: '7', name: 'Entertainment', slug: 'entertainment', color: '#EC4899' },
      source: { id: '3', name: 'Metro Daily', isVerified: true },
      author: { id: '3', name: 'Sarah Jenkins', isVerified: false },
      location: { state: 'Telangana', district: 'Hyderabad', city: 'Jubilee Hills' },
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      readTime: '4 min read',
      url: 'https://example.com/article/7',
      isBreaking: false,
      isBookmarked: false,
      stats: { views: 9200, likes: 980, shares: 320, comments: 75, bookmarks: 140 },
      tags: ['entertainment', 'cinema', 'festival'],
    },
    {
      id: '8',
      headline: 'State University Launches New Tech Incubation Hub for Local Students',
      summary: 'A state-of-the-art incubation facility has been inaugurated to empower student entrepreneurs with mentoring, seed capital, and resources.',
      content: 'To foster local innovation, the university has collaborated with top technology firms to establish a modern product development lab. Selected student startups will receive up to $25k in equity-free grant funding, alongside weekly mentorship from experienced silicon valley product builders and engineers.',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      category: { id: '9', name: 'Education', slug: 'education', color: '#6366F1' },
      source: { id: '2', name: 'City Business Journal', isVerified: true },
      author: { id: '4', name: 'Dr. Ramesh Rao', isVerified: true },
      location: { state: 'Telangana', district: 'Hyderabad', city: 'Kukatpally' },
      publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      readTime: '4 min read',
      url: 'https://example.com/article/8',
      isBreaking: false,
      isBookmarked: false,
      stats: { views: 5400, likes: 620, shares: 145, comments: 28, bookmarks: 88 },
      tags: ['education', 'university', 'startups'],
    },
    {
      id: '9',
      headline: 'Local Research Institute Reveals Breakthrough in Biodegradable Materials',
      summary: 'Scientists have engineered a seaweed-based alternative to single-use plastics that dissolves harmlessly in water within weeks.',
      content: 'The breakthrough material performs exactly like traditional low-density polyethylene, maintaining structural integrity under high temperatures while remaining fully compostable. The research team plans to partner with regional packaging manufacturers to scale industrial production for grocery and retail bags.',
      imageUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800',
      category: { id: '11', name: 'Science', slug: 'science', color: '#0EA5E9' },
      source: { id: '1', name: 'NewsWire Global', isVerified: true },
      author: { id: '5', name: 'Alice Wong', isVerified: true },
      location: { state: 'Telangana', district: 'Hyderabad' },
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      readTime: '5 min read',
      url: 'https://example.com/article/9',
      isBreaking: false,
      isBookmarked: false,
      stats: { views: 24000, likes: 3100, shares: 980, comments: 240, bookmarks: 870 },
      tags: ['science', 'innovation', 'environment'],
    },
    {
      id: '10',
      headline: 'City Green Corridor Project Expands to Add 10,000 Native Trees',
      summary: 'A massive citizen-led plantation drive was launched today to create natural shade corridors along the major bypass highways.',
      content: 'Over 2,000 volunteers, including school children and corporate employees, participated in planting indigenous saplings like Neem, Banyan, and Gulmohar. The municipality has installed automated drip irrigation lines to guarantee a high survival rate during the summer months.',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      category: { id: '12', name: 'Environment', slug: 'environment', color: '#22C55E' },
      source: { id: '3', name: 'Metro Daily', isVerified: true },
      author: { id: '6', name: 'Robert Green', isVerified: false },
      location: { state: 'Telangana', district: 'Hyderabad', city: 'Secunderabad' },
      publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      readTime: '3 min read',
      url: 'https://example.com/article/10',
      isBreaking: false,
      isBookmarked: false,
      stats: { views: 11000, likes: 1400, shares: 540, comments: 65, bookmarks: 320 },
      tags: ['environment', 'nature', 'community'],
    },
    {
      id: '11',
      headline: 'Global Climate Accord Reaches Critical Implementation Milestones',
      summary: 'Over 120 nations have finalized the compliance frameworks for global carbon pricing mechanisms during the international summit.',
      content: 'The summit concluded with a historic agreement establishing binding caps on industrial emissions alongside a $100 billion annual fund to assist developing nations in transitioning to renewable grids. Leaders hailed the framework as the most concrete operational milestone since the Paris Agreement.',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      category: { id: '13', name: 'World News', slug: 'world-news', color: '#06B6D4' },
      source: { id: '1', name: 'NewsWire Global', isVerified: true },
      author: { id: '7', name: 'David Carter', isVerified: true },
      location: { state: 'Delhi' },
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      readTime: '4 min read',
      url: 'https://example.com/article/11',
      isBreaking: false,
      isBookmarked: false,
      stats: { views: 35000, likes: 4200, shares: 1500, comments: 412, bookmarks: 980 },
      tags: ['world', 'climate', 'global-accord'],
    },
  ] as NewsArticle[],

  breakingNews: [
    {
      id: 'breaking-1',
      headline: 'Breaking: Major Policy Announcement Expected Today',
      summary: 'Government officials to address the nation regarding new economic measures.',
      imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800',
      category: { id: '3', name: 'Politics', slug: 'politics', color: '#EF4444' },
      source: { id: '1', name: 'NewsWire Global', isVerified: true },
      location: { state: 'Delhi' },
      publishedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      readTime: '2 min read',
      url: 'https://example.com/breaking/1',
      isBreaking: true,
      isBookmarked: false,
      stats: { views: 25000, likes: 3400, shares: 890, comments: 234, bookmarks: 567 },
    }
  ] as NewsArticle[],

  shorts: [
    {
      id: '1',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      title: 'Street Food Festival Kicks Off Downtown!',
      description: 'Over 50 local vendors have gathered at the main square. Expect crowds and amazing aromas until...',
      author: { handle: '@CityGazette', name: 'City Gazette', avatarInitial: 'C' },
      stats: { likes: '1.2k', comments: '45' },
      hashtags: ['#LocalEvents', '#Foodie', '#Downtown'],
      isLive: true,
    },
    {
      id: '2',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      title: 'New Metro Line Testing Phase',
      description: 'The highly anticipated blue line extension is finally undergoing rigorous testing before the public opening next month.',
      author: { handle: '@TransitNews', name: 'Transit News', avatarInitial: 'T' },
      stats: { likes: '8.4k', comments: '342' },
      hashtags: ['#Transit', '#CityUpdates', '#Metro'],
      isLive: false,
    },
    {
      id: '3',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      title: 'Weekend Farmers Market',
      description: 'Fresh organic produce and artisan crafts right in your neighborhood. Support local businesses!',
      author: { handle: '@LocalEats', name: 'Local Eats', avatarInitial: 'L' },
      stats: { likes: '450', comments: '12' },
      hashtags: ['#FarmersMarket', '#Organic', '#ShopLocal'],
      isLive: false,
    },
  ] as ShortVideo[],

  events: [
    {
      id: '1',
      category: 'Music Festival',
      title: 'Downtown Jazz Festival',
      description: 'Experience over 50 unique stalls featuring live jazz performances, artisanal crafts, and international street food...',
      distance: '0.5 km away',
      schedule: 'Sat, May 25 • 6:00 PM - 10:00 PM',
      locationName: 'Downtown Amphitheater',
      imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600',
      dateMonth: 'MAY',
      dateDay: '25',
    },
    {
      id: '2',
      category: 'Sports & Charity',
      title: 'Annual Kukatpally Charity Run',
      description: 'Join the neighborhood charity marathon starting from JNTU Ground to raise funds for the local children hospital...',
      distance: '2.5 km away',
      schedule: 'Sun, May 26 • 7:00 AM',
      locationName: 'JNTU Ground Kukatpally',
      imageUrl: 'https://images.unsplash.com/photo-1502224562085-639556652f33?w=600',
      dateMonth: 'MAY',
      dateDay: '26',
    },
    {
      id: '3',
      category: 'Community Meetup',
      title: 'Artisanal Crafts & Farmers Market',
      description: 'Browse fresh organic produce, locally hand-crafted goods, pottery, and enjoy home-grown acoustic live performances...',
      distance: '1.2 km away',
      schedule: 'Wed, May 29 • 10:00 AM - 4:00 PM',
      locationName: 'Forum Mall Ground',
      imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600',
      dateMonth: 'MAY',
      dateDay: '29',
    },
  ],

  trending: [
    { id: '1', title: '#LocalElection', count: '4.2k stories this morning', icon: 'trending-up' },
    { id: '2', title: '#MetroUpdate', count: '1.8k stories', icon: 'trending-up' },
    { id: '3', title: '#WeatherAlert', count: '900 stories', icon: 'cloud' }
  ],

  sources: [
    { id: '1', name: 'Times' },
    { id: '2', name: 'Daily' },
    { id: '3', name: 'Watch' },
    { id: '4', name: 'Metro' },
    { id: '5', name: 'Bulletin' }
  ],

  localities: [
    { id: '1', name: 'Gachibowli', count: '12 new stories' },
    { id: '2', name: 'Madhapur', count: '8 new stories' },
    { id: '3', name: 'Jubilee Hills', count: '15 new stories' }
  ],

  immersiveNews: [
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
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
      bulletIcon: 'ellipse'
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
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
      bulletIcon: 'ellipse'
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
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
      bulletIcon: 'ellipse'
    }
  ],

  notifications: [
    {
      id: 'n1',
      type: 'alert',
      title: 'Heavy Rain Alert',
      message: 'Heavy rainfall expected in your area for the next 4 hours. Stay safe.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
    },
    {
      id: 'n2',
      type: 'event',
      title: 'Upcoming Event',
      message: 'Tech Meetup 2026 is happening tomorrow! Check your tickets.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false,
      actionUrl: 'event/e1',
    },
    {
      id: 'n3',
      type: 'poll',
      title: 'New Community Poll',
      message: 'A new poll about the metro extension needs your vote.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
      actionUrl: 'poll/p1',
    },
    {
      id: 'n4',
      type: 'news',
      title: 'Breaking News',
      message: 'Local Startups Secure Record $500M in Series B Funding.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      isRead: true,
      actionUrl: 'article/2',
    },
  ] as Notification[],

  polls: [
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
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
  ] as Poll[]
};

// Axios Client instance (pointing to a configurable API Base URL)
// Easily configured in production to talk to the real backend server!
export const apiInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.hyperlocalnews.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Axios response delay simulation helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ApiService = {
  // 1. News Articles
  getNews: async (): Promise<ApiResponse<NewsArticle[]>> => {
    try {
      // Simulate real Axios request pipeline
      await delay(600);
      
      // Fallback/Simulated Response acting as real Axios fetch
      return {
        success: true,
        data: API_DATABASE.news,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: error.message || 'Failed to fetch news feed' }
      };
    }
  },

  getArticleById: async (id: string): Promise<ApiResponse<NewsArticle | undefined>> => {
    try {
      await delay(400);
      const article = API_DATABASE.news.find(n => n.id === id) || API_DATABASE.breakingNews.find(n => n.id === id);
      return {
        success: true,
        data: article,
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch article details' }
      };
    }
  },

  // 2. Categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      await delay(300);
      return {
        success: true,
        data: API_DATABASE.categories,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch categories' }
      };
    }
  },

  getLanguages: async (): Promise<ApiResponse<Language[]>> => {
    try {
      await delay(200);
      return {
        success: true,
        data: API_DATABASE.languages,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch languages' }
      };
    }
  },

  // 3. States & Locations
  getStates: async (): Promise<ApiResponse<State[]>> => {
    try {
      await delay(400);
      return {
        success: true,
        data: API_DATABASE.states,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch states' }
      };
    }
  },

  getDistrictsByState: async (stateId: string): Promise<ApiResponse<District[]>> => {
    try {
      await delay(300);
      const list = API_DATABASE.districts[stateId.toLowerCase()] || [];
      const districtList: District[] = list.map(d => ({
        ...d,
        stateId
      }));
      return {
        success: true,
        data: districtList,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch districts' }
      };
    }
  },

  // 4. Interests / Onboarding Topics
  getInterests: async (): Promise<ApiResponse<Interest[]>> => {
    try {
      await delay(400);
      return {
        success: true,
        data: API_DATABASE.interests,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch interests' }
      };
    }
  },

  // 5. Shorts Videos
  getShorts: async (): Promise<ApiResponse<ShortVideo[]>> => {
    try {
      await delay(500);
      return {
        success: true,
        data: API_DATABASE.shorts,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch shorts feed' }
      };
    }
  },

  // 6. Events
  getEvents: async (): Promise<ApiResponse<any[]>> => {
    try {
      await delay(500);
      return {
        success: true,
        data: API_DATABASE.events,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch local events' }
      };
    }
  },

  // 7. Discover Feed components
  getTrending: async (): Promise<ApiResponse<any[]>> => {
    try {
      await delay(300);
      return {
        success: true,
        data: API_DATABASE.trending,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch trending stories' }
      };
    }
  },

  getSources: async (): Promise<ApiResponse<any[]>> => {
    try {
      await delay(200);
      return {
        success: true,
        data: API_DATABASE.sources,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch news sources' }
      };
    }
  },

  getLocalities: async (): Promise<ApiResponse<any[]>> => {
    try {
      await delay(250);
      return {
        success: true,
        data: API_DATABASE.localities,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch localities' }
      };
    }
  },

  // Immersive news stories
  getImmersiveNews: async (): Promise<ApiResponse<ImmersiveArticle[]>> => {
    try {
      await delay(400);
      return {
        success: true,
        data: API_DATABASE.immersiveNews as any[],
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch immersive news' }
      };
    }
  },

  // 8. Simulated Authentication
  sendOtp: async (phoneNumber: string): Promise<ApiResponse<boolean>> => {
    try {
      await delay(600);
      return { success: true, data: true };
    } catch (error: any) {
      return {
        success: false,
        data: false,
        error: { code: 'AUTH_ERROR', message: 'Failed to send OTP' }
      };
    }
  },

  verifyOtp: async (phoneNumber: string, otp: string): Promise<ApiResponse<any>> => {
    try {
      await delay(600);
      return {
        success: true,
        data: {
          id: Math.random().toString(36).substr(2, 9),
          phoneNumber,
          isGuest: false,
        }
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: { code: 'AUTH_ERROR', message: 'Failed to verify OTP' }
      };
    }
  },

  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    try {
      await delay(300);
      return {
        success: true,
        data: API_DATABASE.notifications,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch notifications' }
      };
    }
  },

  getPolls: async (): Promise<ApiResponse<Poll[]>> => {
    try {
      await delay(300);
      return {
        success: true,
        data: API_DATABASE.polls,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch polls' }
      };
    }
  }
};
