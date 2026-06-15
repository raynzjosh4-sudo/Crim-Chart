export const dummyMovieBoxPost = {
  id: 'mb_101',
  box: {
    id: 'box_1',
    title: 'Cyberpunk Short Films Festival',
    description: 'A curated collection of the best indie cyberpunk shorts. We are watching them live together tonight! Grab your popcorn.',
    coverImageUrl: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80',
    type: 'movie',
  },
  creator: {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'NeoDirector',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
  },
  stats: {
    likes: 3400,
    comments: 890,
    shares: 120,
  },
  createdAt: new Date().toISOString(),
  previewItems: [
    { id: 'vid_1', title: 'Neon Shadows', duration: '14:20', thumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&q=80' },
    { id: 'vid_2', title: 'Digital Rebirth', duration: '09:45', thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80' },
  ],
  videos: [
    {
      id: 'vid_1',
      title: 'Neon Shadows',
      director: 'Alex Mercer',
      duration: '14:20',
      thumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
      likes: 1200,
      dislikes: 12,
      commentsCount: 89,
      addedBy: {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'NeoDirector',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      },
      recentComments: [
        { id: 'c1', user: { id: '11111111-1111-1111-1111-111111111111', name: 'John Doe', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }, text: 'The cinematography in this is insane.' },
      ]
    },
    {
      id: 'vid_2',
      title: 'Digital Rebirth',
      director: 'Sarah Connors',
      duration: '09:45',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      likes: 850,
      dislikes: 5,
      commentsCount: 42,
      addedBy: {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'CyberPunk Fan',
        avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&q=80',
      },
      linkedFrom: {
        id: '99999999-9999-9999-9999-999999999999',
        name: 'SciFi Shorts',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      }
    },
    {
      id: 'vid_3',
      title: 'The Last Code',
      director: 'Liam N.',
      duration: '22:10',
      thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
      likes: 2100,
      dislikes: 18,
      commentsCount: 300,
      addedBy: {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'NeoDirector',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      },
    }
  ]
};
