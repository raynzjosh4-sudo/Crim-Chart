export enum ExploreItemType {
  media = 'media',
  channel = 'channel',
  user = 'user',
}

export interface ExploreItemModel {
  id: string;
  imageUrl?: string;
  description?: string;
  likes: number;
  type: ExploreItemType;
  isVideo: boolean;
  videoUrl?: string;
  isAudio: boolean;
  audioUrl?: string;
  aspectRatio: number;
  user?: any; // Reusing user model type loosely here
}
