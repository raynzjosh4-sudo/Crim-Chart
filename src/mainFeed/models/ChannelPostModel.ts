import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { ThumbnailMediaType } from '@/components/thumbnaillink/thumbnaillinkmedia/ThumbnailMediaType';

export interface ChannelModel {
  id: string;
  title: string;
  imageUrl?: string;
  creatorId?: string;
  memberCount?: number;
  newMessageCount?: number;
  description?: string;
}

export function createEmptyChannel(): ChannelModel {
  return { id: '', title: '' };
}

export interface ChannelPostModel {
  id: string;
  author: CrimChartUserModel;
  channel: ChannelModel;
  channelTitle?: string;
  tag?: string;
  taggedBy?: string;
  tagsCount: number;
  imageUrls: string[];
  caption: string;
  videoUrl?: string;
  videoUrls: string[];
  isVideo: boolean;
  audioUrl?: string;
  isAudio: boolean;
  gifUrl?: string;
  isGif: boolean;
  isText: boolean;
  thumbnailLinkUrl?: string;
  thumbnailLinkType: ThumbnailMediaType;
  referenceId?: string;
  linkedPostId?: string;
  referenceChannelId?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  downloadsCount?: number;
  timeAgo: string;
  isLiked: boolean;
  isSponsored: boolean;
  aspectRatio?: number;
  hasStatus: boolean;
  isActive: boolean;
  isPending: number; // 0 = not pending
  localFileCache: string;
  widgetType?: string;
  source_type?: string;
  sourceTable?: string;
  metadata?: any;
}

const EMPTY_USER = CrimChartUserModel.empty().copyWith({
  displayName: 'Unknown',
  username: 'unknown',
});

export function createEmptyChannelPost(): ChannelPostModel {
  return {
    id: '', author: EMPTY_USER, channel: createEmptyChannel(),
    tagsCount: 0, imageUrls: [], caption: '',
    videoUrls: [], isVideo: false, isAudio: false,
    isGif: false, isText: false,
    thumbnailLinkType: ThumbnailMediaType.image,
    likesCount: 0, commentsCount: 0, timeAgo: '',
    isLiked: false, isSponsored: false,
    hasStatus: false, isActive: false,
    isPending: 0, localFileCache: '',
    widgetType: 'channel_post',
    source_type: undefined,
    sourceTable: undefined,
    metadata: {},
  };
}

export function channelPostFromMap(map: Record<string, unknown>): ChannelPostModel {
  return {
    id: String(map['id'] ?? ''),
    author: map['author']
      ? EMPTY_USER.copyWith(map['author'] as Partial<CrimChartUserModel>)
      : EMPTY_USER.copyWith({ id: String(map['author_id'] ?? '') }),
    channel: map['channel']
      ? map['channel'] as ChannelModel
      : { id: String(map['channel_id'] ?? ''), title: '' },
    channelTitle: map['channelTitle'] as string | undefined,
    tag: map['tag'] as string | undefined,
    taggedBy: map['taggedBy'] as string | undefined,
    tagsCount: Number(map['tags_count'] ?? map['tagsCount'] ?? 0),
    imageUrls: Array.isArray(map['imageUrls']) ? (map['imageUrls'] as string[]) : [],
    caption: String(map['caption'] ?? ''),
    videoUrl: map['videoUrl'] as string | undefined,
    videoUrls: Array.isArray(map['videoUrls']) ? (map['videoUrls'] as string[]) : [],
    isVideo: Boolean(map['isVideo']),
    audioUrl: map['audioUrl'] as string | undefined,
    isAudio: Boolean(map['isAudio']),
    gifUrl: map['gifUrl'] as string | undefined,
    isGif: Boolean(map['isGif']),
    isText: Boolean(map['isText']),
    thumbnailLinkUrl: map['thumbnailLinkUrl'] as string | undefined,
    thumbnailLinkType: (map['thumbnailLinkType'] as ThumbnailMediaType) ?? ThumbnailMediaType.image,
    referenceId: map['referenceId'] as string | undefined,
    linkedPostId: map['linkedPostId'] as string | undefined,
    referenceChannelId: map['referenceChannelId'] as string | undefined,
    likesCount: Number(map['likes_count'] ?? map['likesCount'] ?? 0),
    commentsCount: Number(map['comments_count'] ?? map['commentsCount'] ?? 0),
    viewsCount: Number(map['views_count'] ?? map['viewsCount'] ?? 0),
    timeAgo: String(map['timeAgo'] ?? ''),
    isLiked: Boolean(map['isLiked']),
    isSponsored: Boolean(map['isSponsored']),
    aspectRatio: map['aspectRatio'] as number | undefined,
    hasStatus: Boolean(map['hasStatus']),
    isActive: Boolean(map['isActive']),
    isPending: Number(map['isPending'] ?? 0),
    localFileCache: String(map['localFileCache'] ?? ''),
    widgetType: map['widget_type'] as string | undefined ?? map['widgetType'] as string | undefined,
    source_type: map['source_type'] as string | undefined,
    sourceTable: map['source_table'] as string | undefined ?? map['sourceTable'] as string | undefined,
    metadata: typeof map['metadata'] === 'string' ? JSON.parse(map['metadata'] as string) : (map['metadata'] || {}),
  };
}
