export enum MediaType {
  photo,
  video,
  audio,
}

export interface MediaData {
  contentUrl: string;
  type: MediaType;
  thumbnailUrl?: string;
  postId?: string;
  aspectRatio?: number;
}
