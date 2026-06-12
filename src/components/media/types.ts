export enum MediaType {
  image = 'image',
  video = 'video',
}

export interface MediaData {
  type: MediaType;
  contentUrl: string;
  thumbnailUrl?: string;
  postId?: string;
  aspectRatio?: number;
}
