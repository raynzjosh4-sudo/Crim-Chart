export interface VotingItem {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  score: number;
  addedBy: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  commentsCount: number;
}

export const dummyVotingBoxPost = {
  id: 'box_vote_1',
  creator: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'HypeBeast_Daily',
    avatarUrl: 'https://images.unsplash.com/photo-1523316325870-681b498fcc7b?w=100&q=80',
  },
  box: {
    title: 'Best Streetwear Fit 2026 👑',
    description: 'Post your best streetwear fit. The community decides who takes the crown. The winner gets 50,000 Coins!',
    coverImageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80',
    type: 'voting',
  },
  stats: {
    totalVotes: 12450,
    participants: 128,
  },
  items: [
    {
      id: 'item_1',
      title: 'Neon Tokyo Nights',
      mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
      mediaType: 'image',
      score: 4520,
      addedBy: {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'CyberNinja',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      },
      commentsCount: 342,
    },
    {
      id: 'item_2',
      title: 'Vintage Techwear',
      mediaUrl: 'https://images.unsplash.com/photo-1550614000-4b95d4ed798b?w=600&q=80',
      mediaType: 'image',
      score: 4100,
      addedBy: {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'RetroGamer',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      },
      commentsCount: 215,
    },
    {
      id: 'item_3',
      title: 'Minimalist Drip',
      mediaUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
      mediaType: 'image',
      score: 2890,
      addedBy: {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Simplicity',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      },
      commentsCount: 189,
    },
    {
      id: 'item_4',
      title: 'Y2K Revival',
      mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80',
      mediaType: 'image',
      score: 1250,
      addedBy: {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Y2K_Queen',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      },
      commentsCount: 88,
    },
  ] as VotingItem[],
  createdAt: new Date().toISOString(),
};
