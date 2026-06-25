export interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: string;
  mediaUrl: string;
  seller: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  likes: number;
  commentsCount: number;
  viewsCount?: number;
}

export const dummyStoreBoxPost = {
  id: 'box_store_1',
  box: {
    id: 'box_store_1',
    title: 'The Sneaker Exchange',
    description: 'Buy and sell rare sneakers and streetwear.',
    coverImageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80',
  },
  stats: {
    activeListings: 24,
    likes: 420,
    comments: 56,
    shares: 12
  },
  creator: {
    id: '1',
    name: 'Josh',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
  },
  items: [
    {
      id: 'store_item_1',
      title: 'Sony Alpha a7 III Mirrorless Camera',
      description: 'Used for about a year. Excellent condition. Comes with original box and accessories.',
      price: '$1200',
      mediaUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
      seller: {
        id: '1',
        name: 'Josh',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      },
      likes: 120,
      commentsCount: 24,
      viewsCount: 1540
    },
    {
      id: 'store_item_2',
      title: 'Nike Dunk Low SP Syracuse',
      description: 'Deadstock, never worn. Original receipt included.',
      price: '$450',
      mediaUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
      seller: {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'SneakerHead99',
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80',
      },
      likes: 85,
      commentsCount: 12,
      viewsCount: 890
    },
    {
      id: 'store_item_3',
      title: 'Apple MacBook Pro M2 (2023)',
      description: 'Mint condition. 16GB RAM, 512GB SSD. Space Gray.',
      price: '$1800',
      mediaUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
      seller: {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'TechGeek',
        avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&q=80',
      },
      likes: 310,
      commentsCount: 45,
      viewsCount: 3200
    },
    {
      id: 'store_item_4',
      title: 'Vintage Leather Jacket',
      description: 'Genuine leather from the 80s. Minor wear but looks great. Size Medium.',
      price: '$80',
      mediaUrl: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?w=600&q=80',
      seller: {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'RetroFinds',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
      },
      likes: 42,
      commentsCount: 8,
      viewsCount: 450
    },
    {
      id: 'store_item_5',
      title: 'PlayStation 5 Console',
      description: 'Disc edition. Includes one controller and all cables. Works perfectly.',
      price: '$400',
      mediaUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80',
      seller: {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'GamerDude',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
      },
      likes: 215,
      commentsCount: 30,
      viewsCount: 2100
    }
  ] as StoreItem[]
};
