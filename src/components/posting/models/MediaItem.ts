export enum MediaType {
  photo = 'photo',
  video = 'video',
  audio = 'audio'
}

export enum MediaSource {
  device = 'device',
  gallery = 'gallery',
  members = 'members'
}

export class PostType {
  static readonly profile = 'profile_post';
  static readonly channel = 'channel_post';
  static readonly manifesto = 'manifesto';
  static readonly reel = 'reel';
  static readonly status = 'status';
  static readonly comment = 'comment';
}

export class PostFolder {
  static readonly public = 'public_posts';
  static readonly status = 'status_posts';
  static readonly channel = 'channel_posts';
  static readonly profile = 'profile_posts';

  static compute(source: MediaSource, hasChannel: boolean, isMyChannel: boolean, isRepost: boolean): string {
    if (source === MediaSource.members) return PostFolder.channel;
    if (isRepost) return PostFolder.public;
    if (hasChannel) return PostFolder.channel;
    return PostFolder.profile;
  }
}

export interface MediaOverlay {
  imagePath?: string;
  text?: string;
  color?: string;
  hasBackground?: boolean;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
}

export interface MediaItem {
  id: string; // React needs keys, so adding id
  path: string;
  type: MediaType;
  title?: string;
  artist?: string;
  thumbnailUrl?: string;
  thumbnailBytes?: Uint8Array;
  aspectRatio?: number;
  duration?: number; // Video or audio duration in seconds
  lyrics?: string;
  overlays?: any[];

  linkedPostId?: string;
  linkedAuthorId?: string;
  linkChain?: string[];
  linkDepth?: number;
  linkedAuthorUsername?: string;
  linkedCaption?: string;
  linkedChannelId?: string;
  
  source?: MediaSource;
}

export const isLinked = (item: MediaItem): boolean => {
  return !!item.linkedPostId;
};
