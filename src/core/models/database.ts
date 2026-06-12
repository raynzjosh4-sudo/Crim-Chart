export interface User {
  id: string;
  username: string;
  display_name: string;
  profile_image_url: string;
  bio?: string;
  created_at: string;
}

export interface Channel {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  avatar_url: string;
  members_count: number;
  created_at: string;
}

export interface ChannelMember {
  channel_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar_url: string;
  text: string;
  media_url?: string;
  media_type: 'text' | 'image' | 'video' | 'audio' | 'lottie';
  reply_to_id?: string;
  created_at: string;
  is_pending: boolean;
}

export interface ChannelPost {
  id: string;
  channel_id: string;
  author_id: string;
  caption: string;
  video_url?: string;
  image_urls?: string; // Stored as JSON string
  is_video: boolean;
  likes: number;
  comments: number;
  created_at: string;
  is_pending: boolean;
  is_liked: boolean;
}

export interface Status {
  id: string;
  author_id: string;
  username: string;
  profile_image_url: string;
  caption?: string;
  image_urls?: string; // Stored as JSON string
  video_url?: string;
  thumbnail_url?: string;
  audio_url?: string;
  is_video: boolean;
  is_audio: boolean;
  comments_count: number;
  created_at: string;
  expires_at: string;
  channel_id?: string; // If null, it's a global status/moment
}
