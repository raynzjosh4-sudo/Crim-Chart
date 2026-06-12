export const DUMMY_PARTICIPANT = {
  id: 'dummy_user_1',
  displayName: 'Sarah Jenkins',
  profileImageUrl: 'https://i.pravatar.cc/150?u=sarah',
  isActive: true, // Shows online dot
  hasStatus: true, // Could show status ring if implemented in UI
} as any;

export const DUMMY_THREAD_MESSAGES = [
  {
    id: 'msg7',
    text: 'Please vote on this:',
    author: DUMMY_PARTICIPANT,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    poll: { title: 'Where should we go next?' },
  },
  {
    id: 'msg6',
    text: '',
    author: { isMe: true, displayName: 'Me' },
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
    mediaItems: [
      {
        type: 'lottie',
        url: require('../../../../assets/stickers/sticker_4.json'),
      },
    ],
  },
  {
    id: 'msg5',
    text: 'Wow, looks amazing!',
    author: { isMe: true, displayName: 'Me' },
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    replyTo: { senderName: 'Sarah Jenkins', text: 'And an image too!' },
  },
  {
    id: 'msg4',
    text: 'And an image too!',
    author: DUMMY_PARTICIPANT,
    createdAt: new Date(Date.now() - 1000 * 60 * 39),
    mediaItems: [{ type: 'image', url: 'https://picsum.photos/400/300' }],
  },
  {
    id: 'msg3',
    text: 'Here is a video from the event!',
    author: DUMMY_PARTICIPANT,
    createdAt: new Date(Date.now() - 1000 * 60 * 40),
    mediaItems: [{ type: 'video', url: 'mock.mp4', duration: 45 }],
  },
  {
    id: 'msg2',
    text: '',
    author: { isMe: true, displayName: 'Me' },
    createdAt: new Date(Date.now() - 1000 * 60 * 55),
    mediaItems: [{ type: 'audio', url: 'mock.m4a', duration: 12 }],
  },
  {
    id: 'msg1',
    text: 'Hey! Check out this audio message.',
    author: DUMMY_PARTICIPANT,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
] as any[];

export const DUMMY_THREADS_LIST = [
  {
    id: 'dummy_1',
    participants: [{
      id: 'dummy_user_1',
      displayName: 'Sarah Jenkins',
      profileImageUrl: 'https://i.pravatar.cc/150?u=sarah',
      hasStatus: true,
      isActive: true,
    }],
    lastMessage: { text: 'Hey! Check out this audio message.' },
    unreadCount: 3,
    isTyping: true,
  },
  {
    id: 'dummy_2',
    participants: [{
      id: 'dummy_user_2',
      displayName: 'Mike Ross',
      profileImageUrl: 'https://i.pravatar.cc/150?u=mike',
      hasStatus: false,
      isActive: false,
    }],
    lastMessage: { text: 'Got the documents, thanks!' },
    unreadCount: 0,
    isTyping: false,
  },
  {
    id: 'dummy_3',
    participants: [{
      id: 'dummy_user_3',
      displayName: 'Harvey Specter',
      profileImageUrl: 'https://i.pravatar.cc/150?u=harvey',
      hasStatus: false,
      isActive: true,
    }],
    lastMessage: { text: 'Meet me in my office.' },
    unreadCount: 1,
    isTyping: false,
  }
] as any[];
