export interface SportsHighlight {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: string;
  likes: number;
  commentsCount: number;
  addedBy: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}

export const dummySportsBoxPost = {
  id: 'box_sports_1',
  creator: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'HoopsCentral',
    avatarUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&q=80',
  },
  box: {
    title: 'NBA Finals: Lakers vs Celtics (Game 7)',
    description: 'The ultimate rivalry. Post your live reactions, favorite dunks, and hot takes right here.',
    coverImageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80',
    type: 'sports',
  },
  matchStats: {
    homeTeam: {
      name: 'LAL',
      score: 112,
      logoColor: '#FDB927',
    },
    awayTeam: {
      name: 'BOS',
      score: 108,
      logoColor: '#007A33',
    },
    period: 'Q4',
    timeRemaining: '02:14',
    isLive: true,
  },
  stats: {
    likes: 34500,
    comments: 4200,
    shares: 890,
  },
  highlights: [
    {
      id: 'highlight_1',
      title: 'LeBron massive chasedown block! 👑🤯',
      mediaUrl: 'https://images.unsplash.com/photo-1519861531473-920026076fb6?w=600&q=80',
      mediaType: 'video',
      timestamp: 'Q4 02:45',
      likes: 12400,
      commentsCount: 1540,
      addedBy: {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'BronFanatic23',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      },
    },
    {
      id: 'highlight_2',
      title: 'Tatum deep 3 to tie the game!',
      mediaUrl: 'https://images.unsplash.com/photo-1542652694-40abf526446e?w=600&q=80',
      mediaType: 'video',
      timestamp: 'Q4 05:12',
      likes: 8900,
      commentsCount: 940,
      addedBy: {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'CelticsPride',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      },
    },
    {
      id: 'highlight_3',
      title: 'AD posterizes two defenders!!',
      mediaUrl: 'https://images.unsplash.com/photo-1627627256672-027a4613d028?w=600&q=80',
      mediaType: 'image',
      timestamp: 'Q3 11:00',
      likes: 5600,
      commentsCount: 312,
      addedBy: {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'ShowtimeLA',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      },
    },
  ] as SportsHighlight[],
  createdAt: new Date().toISOString(),
};
