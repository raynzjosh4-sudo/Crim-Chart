export enum MessageMediaType {
  image = 'image',
  video = 'video',
  audio = 'audio',
  lottie = 'lottie',
}

export interface MessageMediaItem {
  type: MessageMediaType | string;
  url: string;
  thumbnail?: string;
  caption?: string;
}
