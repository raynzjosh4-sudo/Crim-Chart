import { ContentEntity } from '@/core/models/ContentEntity';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { ThumbnailLink } from '@/core/models/ThumbnailLink';

export class PostEntity extends ContentEntity {
  public caption: string;
  public videoUrl?: string;
  public videoUrls: string[];
  public audioUrl?: string;
  public imageUrls: string[];
  public thumbnailUrls: string[];
  public isVideo: boolean;
  public isAudio: boolean;
  public isLiked: boolean;
  public isPublic: boolean;
  public timeAgo: string;
  public linkChain: string[];
  public metadata: Record<string, any>;
  public taggerName?: string;
  public taggerAvatar?: string;
  public sourceChannelName?: string;
  public sourceChannelAvatar?: string;
  public sdVideoUrl?: string;
  public isPending: number;
  public localFileCache: string;
  public privacy: string;
  public roleViewer?: string;
  public aspectRatio?: number;
  public allowComments: boolean;
  public parentPostId?: string;
  public time?: Date;
  public likesCount: number;
  public commentsCount: number;
  public tagsCount: number;

  constructor(params: {
    id: string;
    author: CrimChartUserModel;
    createdAt: Date;
    thumbnailLink: ThumbnailLink;
    caption?: string;
    videoUrl?: string;
    videoUrls?: string[];
    audioUrl?: string;
    imageUrls?: string[];
    thumbnailUrls?: string[];
    isVideo?: boolean;
    isAudio?: boolean;
    isLiked?: boolean;
    isPublic?: boolean;
    timeAgo?: string;
    linkChain?: string[];
    metadata?: Record<string, any>;
    taggerName?: string;
    taggerAvatar?: string;
    sourceChannelName?: string;
    sourceChannelAvatar?: string;
    sdVideoUrl?: string;
    isPending?: number;
    localFileCache?: string;
    privacy?: string;
    roleViewer?: string;
    aspectRatio?: number;
    allowComments?: boolean;
    parentPostId?: string;
    time?: Date;
    likesCount?: number;
    commentsCount?: number;
    tagsCount?: number;
  }) {
    super(params.id, params.author, params.createdAt, params.thumbnailLink);
    this.caption = params.caption ?? '';
    this.videoUrl = params.videoUrl;
    this.videoUrls = params.videoUrls ?? [];
    this.audioUrl = params.audioUrl;
    this.imageUrls = params.imageUrls ?? [];
    this.thumbnailUrls = params.thumbnailUrls ?? [];
    this.isVideo = params.isVideo ?? false;
    this.isAudio = params.isAudio ?? false;
    this.isLiked = params.isLiked ?? false;
    this.isPublic = params.isPublic ?? true;
    this.timeAgo = params.timeAgo ?? '';
    this.linkChain = params.linkChain ?? [];
    this.metadata = params.metadata ?? {};
    this.taggerName = params.taggerName;
    this.taggerAvatar = params.taggerAvatar;
    this.sourceChannelName = params.sourceChannelName;
    this.sourceChannelAvatar = params.sourceChannelAvatar;
    this.sdVideoUrl = params.sdVideoUrl;
    this.isPending = params.isPending ?? 0;
    this.localFileCache = params.localFileCache ?? '';
    this.privacy = params.privacy ?? 'public';
    this.roleViewer = params.roleViewer;
    this.aspectRatio = params.aspectRatio;
    this.allowComments = params.allowComments ?? true;
    this.parentPostId = params.parentPostId;
    this.time = params.time;
    this.likesCount = params.likesCount ?? 0;
    this.commentsCount = params.commentsCount ?? 0;
    this.tagsCount = params.tagsCount ?? 0;
  }

  static original(params: {
    id: string;
    author: CrimChartUserModel;
    createdAt: Date;
    caption: string;
    videoUrl?: string;
    videoUrls?: string[];
    audioUrl?: string;
    imageUrls?: string[];
    thumbnailUrls?: string[];
    isVideo?: boolean;
    isAudio?: boolean;
    privacy?: string;
    roleViewer?: string;
    aspectRatio?: number;
    allowComments?: boolean;
    parentPostId?: string;
    time?: Date;
    isLiked?: boolean;
    isPublic?: boolean;
    shares?: number;
    timeAgo?: string;
    linkChain?: string[];
    metadata?: Record<string, any>;
    taggerName?: string;
    taggerAvatar?: string;
    sourceChannelName?: string;
    sourceChannelAvatar?: string;
    sdVideoUrl?: string;
    isPending?: number;
    likesCount?: number;
    commentsCount?: number;
    tagsCount?: number;
  }): PostEntity {
    const thumbnailLink = ThumbnailLink.original(
      params.id,
      params.author,
      'post'
    );

    return new PostEntity({
      ...params,
      thumbnailLink,
    });
  }

  static fromMap(map: any): PostEntity {
    const rawImageUrls = map.imageUrls ?? map.image_urls ?? map.image_url;
    let imageUrls: string[] = [];
    if (typeof rawImageUrls === 'string' && rawImageUrls) {
      try {
        const decoded = JSON.parse(rawImageUrls);
        imageUrls = Array.isArray(decoded) ? decoded.map(String) : [];
      } catch (e) {
        imageUrls = [];
      }
    } else if (Array.isArray(rawImageUrls)) {
      imageUrls = rawImageUrls.map(String);
    }

    const rawThumbnailUrls = map.thumbnailUrls ?? map.thumbnail_urls;
    let thumbnailUrls: string[] = [];
    if (typeof rawThumbnailUrls === 'string' && rawThumbnailUrls) {
      try {
        const decoded = JSON.parse(rawThumbnailUrls);
        thumbnailUrls = Array.isArray(decoded) ? decoded.map(String) : [];
      } catch (e) {
        thumbnailUrls = [];
      }
    } else if (Array.isArray(rawThumbnailUrls)) {
      thumbnailUrls = rawThumbnailUrls.map(String);
    }

    const createdAt = map.createdAt ? new Date(map.createdAt) : (map.created_at ? new Date(map.created_at) : new Date());

    const authorMap = map.author || {};
    const author = map.author 
      ? CrimChartUserModel.fromMap(authorMap)
      : CrimChartUserModel.empty().copyWith({
          id: String(map.authorId || map.author_id || 'unknown'),
          displayName: String(map.authorUsername || map.username || 'Unknown'),
          profileImageUrl: String(map.authorAvatarUrl || map.author_avatar_url || map.profile_image_url || map.profileImageUrl || ''),
        });

    return PostEntity.original({
      id: String(map.id || map.postId || Date.now()),
      author,
      createdAt,
      caption: String(map.caption || map.message || ''),
      videoUrl: map.videoUrl || map.video_url,
      videoUrls: PostEntity._parseStringList(map.video_urls || map.videoUrls),
      audioUrl: map.audioUrl || map.audio_url,
      imageUrls,
      thumbnailUrls,
      isVideo: PostEntity._parseBool(map.isVideo ?? map.is_video),
      isAudio: PostEntity._parseBool(map.isAudio ?? map.is_audio),
      privacy: map.privacy || 'public',
      roleViewer: map.role_viewer || map.roleViewer,
      aspectRatio: Number(map.aspectRatio || map.aspect_ratio) || undefined,
      allowComments: PostEntity._parseBool(map.allow_comments ?? map.allowComments, true),
      parentPostId: map.parent_post_id || map.parentPostId,
      time: map.time ? new Date(map.time) : undefined,
      likesCount: Number(map.likes_count || (Array.isArray(map.likes) ? map.likes.length : map.likes) || 0),
      commentsCount: Number(map.comments_count || (Array.isArray(map.comments) ? map.comments.length : map.comments) || 0),
      tagsCount: Number(map.tags_count || (Array.isArray(map.tags) ? map.tags.length : map.tags) || 0),
      isLiked: map.is_liked === true || map.isLiked === true,
      isPublic: map.is_public == null ? true : (map.is_public === true || map.is_public === 1),
      timeAgo: String(map.time_ago || map.timeAgo || ''),
      linkChain: PostEntity._parseStringList(map.link_chain || map.linkChain),
      metadata: typeof map.metadata === 'string' && map.metadata ? JSON.parse(map.metadata) : (map.metadata || {}),
      taggerName: map.tagger_name || map.taggerName,
      taggerAvatar: map.tagger_avatar || map.taggerAvatar,
      sourceChannelName: map.source_channel_name || map.sourceChannelName,
      sourceChannelAvatar: map.source_channel_avatar || map.sourceChannelAvatar,
      sdVideoUrl: map.sdVideoUrl || map.sd_video_url,
      isPending: map.is_pending === true ? 1 : Number(map.is_pending || 0),
    });
  }

  private static _parseStringList(input: any): string[] {
    if (!input) return [];
    if (Array.isArray(input)) return input.map(String);
    if (typeof input === 'string' && input.trim()) {
      try {
        const decoded = JSON.parse(input);
        if (Array.isArray(decoded)) return decoded.map(String);
      } catch (e) {}
    }
    return [];
  }

  private static _parseBool(value: any, defaultVal = false): boolean {
    if (value == null) return defaultVal;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === '1' || value === 'true';
    return defaultVal;
  }
}
