import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

export interface ChannelStatusModel {
  id: string;
  channelId: string;
  authorId: string;
  caption: string | null;
  imageUrls: string[];
  videoUrl: string | null;
  audioUrl: string | null;
  isVideo: boolean;
  isAudio: boolean;
  createdAt: string;
  expiresAt: string | null;
  thumbnailUrl: string | null;
  author?: CrimChartUserModel;
}

export function channelStatusFromMap(map: any): ChannelStatusModel {
  return {
    id: map.id,
    channelId: map.channel_id,
    authorId: map.author_id,
    caption: map.caption,
    imageUrls: map.image_urls || [],
    videoUrl: map.video_url,
    audioUrl: map.audio_url,
    isVideo: map.is_video || false,
    isAudio: map.is_audio || false,
    createdAt: map.created_at,
    expiresAt: map.expires_at,
    thumbnailUrl: map.thumbnail_url,
    author: map.author ? {
      id: map.author.id,
      username: map.author.username,
      displayName: map.author.display_name,
      profileImageUrl: map.author.profile_image_url,
      bio: map.author.bio,
    } as CrimChartUserModel : undefined,
  };
}
