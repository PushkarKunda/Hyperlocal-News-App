export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format or formatted string
  time: string;
  location: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  imageUrl: string;
  organizer: {
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
  attendeesCount: number;
  isAttending?: boolean;
  isBookmarked?: boolean;
}
