import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

// Minimal interface for StatusViewEntity since we are in a feed domain
export interface StatusViewEntity {
  id: string;
  viewer: CrimChartUserModel;
  viewedAt: Date;
}

export class UserStatusEntity {
  public id: string;
  public author: CrimChartUserModel;

  public caption?: string;
  public imageUrls: string[];
  public videoUrl?: string;
  public audioUrl?: string;
  public isVideo: boolean;
  public isAudio: boolean;
  public privacy?: string;
  public allowComments: boolean;

  public views: any[]; // Or StatusViewEntity[]
  public likes: any[]; // Or LikeEntity[]
  public comments: any[]; // Or CommentEntity[]

  public createdAt: Date;
  public expiresAt?: Date;
  public thumbnailUrl?: string;

  constructor(params: {
    id: string;
    author: CrimChartUserModel;
    caption?: string;
    imageUrls?: string[];
    videoUrl?: string;
    audioUrl?: string;
    isVideo?: boolean;
    isAudio?: boolean;
    privacy?: string;
    allowComments?: boolean;
    views?: any[];
    likes?: any[];
    comments?: any[];
    createdAt: Date;
    expiresAt?: Date;
    thumbnailUrl?: string;
  }) {
    this.id = params.id;
    this.author = params.author;
    this.caption = params.caption;
    this.imageUrls = params.imageUrls ?? [];
    this.videoUrl = params.videoUrl;
    this.audioUrl = params.audioUrl;
    this.isVideo = params.isVideo ?? false;
    this.isAudio = params.isAudio ?? false;
    this.privacy = params.privacy;
    this.allowComments = params.allowComments ?? true;
    this.views = params.views ?? [];
    this.likes = params.likes ?? [];
    this.comments = params.comments ?? [];
    this.createdAt = params.createdAt;
    this.expiresAt = params.expiresAt;
    this.thumbnailUrl = params.thumbnailUrl;
  }

  static empty(): UserStatusEntity {
    return new UserStatusEntity({
      id: '',
      author: CrimChartUserModel.empty(),
      createdAt: new Date(),
    });
  }

  static fromMap(map: any): UserStatusEntity {
    const parseImageUrls = (raw: any): string[] => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw.map(String);
      if (typeof raw === 'string' && raw) {
        try {
          const decoded = JSON.parse(raw);
          if (Array.isArray(decoded)) return decoded.map(String);
        } catch (e) {}
        return [raw];
      }
      return [];
    };

    const created = map.created_at || map.createdAt;
    const createdAt = created ? new Date(created) : new Date();

    const expiresStr = map.expires_at || map.expiresAt;
    const expiresAt = expiresStr ? new Date(expiresStr) : undefined;

    return new UserStatusEntity({
      id: String(map.id || ''),
      author: map.author
        ? CrimChartUserModel.fromMap(map.author)
        : CrimChartUserModel.empty().copyWith({
            id: String(map.author_id || map.authorId || ''),
          }),
      caption: map.caption ? String(map.caption) : undefined,
      imageUrls: parseImageUrls(map.image_urls || map.imageUrls),
      videoUrl: map.video_url || map.videoUrl,
      audioUrl: map.audio_url || map.audioUrl,
      isVideo: map.is_video === true || map.isVideo === true,
      isAudio: map.is_audio === true || map.isAudio === true,
      privacy: map.privacy || map.visibility,
      allowComments: map.allow_comments === true || map.allowComments === true,
      // For now, mapping views/likes/comments to basic any arrays to avoid strict type coupling yet
      views: Array.isArray(map.status_views) ? map.status_views : [],
      likes: Array.isArray(map.likes) ? map.likes : [],
      comments: Array.isArray(map.comments) ? map.comments : [],
      createdAt,
      expiresAt,
      thumbnailUrl: map.thumbnail_url || map.thumbnailUrl,
    });
  }

  get viewsCount(): number {
    return this.views.length;
  }

  get likesCount(): number {
    return this.likes.length;
  }

  get commentsCount(): number {
    return this.comments.length;
  }
}
