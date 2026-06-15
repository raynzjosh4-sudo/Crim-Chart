export interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: 'Brand New' | 'Like New' | 'Used' | 'Refurbished';
  mediaUrl: string;
  seller: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  likes: number;
  commentsCount: number;
}

export const dummyStoreBoxPost = {
  id: 'box_store_1',
  creator: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'SneakerHeadz',
    avatarUrl: 'https://images.unsplash.com/photo-1523316325870-681b498fcc7b?w=100&q=80',
  },
  box: {
    id: 'box_store_1',
    title: 'Vintage Sneaker Market 👟',
    description: 'Buy, sell, and trade the rarest vintage sneakers in the community. No fakes allowed.',
    coverImageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80',
    type: 'store',
  },
  stats: {
    activeListings: 45,
    itemsSold: 128,
    likes: 1240,
    comments: 89,
    shares: 24,
  },
  items: [
    {
      id: 'store_item_1',
      title: 'Jordan 1 Retro High Chicago (1985)',
      description: 'Original 1985 release. Good condition considering the age. Replacement box.',
      price: 2500,
      currency: '$',
      condition: 'Used',
      mediaUrl: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&q=80',
      seller: {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'RetroKicks',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      },
      likes: 245,
      commentsCount: 32,
    },
    {
      id: 'store_item_2',
      title: 'Nike Dunk Low SP Syracuse',
      description: 'Deadstock, never worn. Original receipt included.',
      price: 450,
      currency: '$',
      condition: 'Brand New',
      mediaUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
      seller: {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'HypeSeller_99',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      },
      likes: 890,
      commentsCount: 145,
    },
    {
      id: 'store_item_3',
      title: 'Yeezy Boost 700 Wave Runner',
      description: 'Worn twice indoors. Perfect condition, comes with original box and tags.',
      price: 320,
      currency: '$',
      condition: 'Like New',
      mediaUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
      seller: {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Ye_Fanatic',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      },
      likes: 543,
      commentsCount: 88,
    },
    {
      id: 'store_item_4',
      title: 'New Balance 990v3 Joe Freshgoods',
      description: 'Slightly yellowed on the sole, otherwise great shape.',
      price: 180,
      currency: '$',
      condition: 'Used',
      mediaUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
      seller: {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'NB_Collector',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      },
      likes: 120,
      commentsCount: 15,
    },
    {
      id: 'store_item_5',
      title: 'Travis Scott x Air Jordan 4 Cactus Jack',
      description: 'Deadstock. Still factory laced.',
      price: 950,
      currency: '$',
      condition: 'Brand New',
      mediaUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',
      seller: {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'CactusJackBoys',
        avatarUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=100&q=80',
      },
      likes: 2100,
      commentsCount: 430,
    },
  ] as StoreItem[],
  createdAt: new Date().toISOString(),
};
