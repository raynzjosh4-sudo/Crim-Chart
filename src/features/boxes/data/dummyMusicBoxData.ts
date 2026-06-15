export const dummyMusicBoxPost = {
  id: 'box_123',
  creator: {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'DJ Khaled',
    avatarUrl: 'https://i.pravatar.cc/150?u=djkhaled',
  },
  box: {
    title: 'Summer Hits 2026',
    description: 'The ultimate collection of vibes for the summer.',
    coverImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    type: 'audio',
  },
  previewItems: [
    {
      id: 'song_1',
      title: 'Midnight City',
      artist: 'M83',
      thumbnailUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80',
      hasLyrics: true,
      likes: 1240,
      dislikes: 12,
      commentsCount: 34,
      addedBy: { id: '22222222-2222-2222-2222-222222222222', name: 'Alice', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
      linkedFrom: { id: '99999999-9999-9999-9999-999999999999', name: 'OriginalDJ', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
      recentComments: [
        { id: 'c1', user: { id: '11111111-1111-1111-1111-111111111111', name: 'John', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80' }, text: 'This track never gets old 🔥' },
        { id: 'c2', user: { id: '11111111-1111-1111-1111-111111111112', name: 'Sarah', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' }, text: 'Perfect late night drive vibe.' }
      ]
    },
    {
      id: 'song_2',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      thumbnailUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80',
      likes: 385,
      dislikes: 8,
      commentsCount: 15,
      addedBy: { id: '33333333-3333-3333-3333-333333333333', name: 'Bob', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
      recentComments: [
        { id: 'c3', user: { id: '11111111-1111-1111-1111-111111111113', name: 'Mike', avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&q=80' }, text: 'Classic synthwave' }
      ]
    },
    {
      id: 'song_3',
      title: 'Starboy',
      artist: 'The Weeknd',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516280440502-861614b74681?w=400&q=80',
      likes: 890,
      dislikes: 45,
      commentsCount: 120,
    },
  ],
  stats: {
    likes: 1200,
    comments: 345,
    shares: 89,
  },
  recentContributors: [
    { id: '22222222-2222-2222-2222-222222222222', name: 'Alice', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Bob', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Charlie', avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&q=80' },
  ],
  createdAt: new Date().toISOString(),
};
