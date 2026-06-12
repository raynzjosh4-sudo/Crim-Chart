export enum MessageMediaType {
  image = 'image',
  video = 'video',
  audio = 'audio',
  lottie = 'lottie',
}

export interface MessageMediaItem {
  url: string;
  type: MessageMediaType | string;
  thumbnail?: string;
  duration?: number; // In seconds or milliseconds depending on your standard
}
