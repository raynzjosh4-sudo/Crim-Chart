/** Hiness (Highlight + News) card model — shown in the discover section. */
export interface HinessModel {
  id: string;
  title: string;
  mediaUrl?: string;
  isVideo: boolean;
  channelId?: string;
  channelName?: string;
  createdAt: Date;
}

export function hinessFromMap(map: Record<string, unknown>): HinessModel {
  return {
    id: String(map['id'] ?? ''),
    title: String(map['title'] ?? ''),
    mediaUrl: map['media_url'] as string | undefined,
    isVideo: Boolean(map['is_video'] ?? map['isVideo']),
    channelId: map['channel_id'] as string | undefined,
    channelName: map['channel_name'] as string | undefined,
    createdAt: map['created_at'] ? new Date(String(map['created_at'])) : new Date(),
  };
}
