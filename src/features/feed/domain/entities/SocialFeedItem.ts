import { ChannelModel, emptyChannel, channelFromMap } from '@/channel/models/ChannelModel';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

export enum SocialFeedWidgetType {
  channelPost = 'channelPost',
  regularPost = 'regularPost'
}

export class SocialFeedItem {
  public id: string;
  public authorData: CrimChartUserModel;
  public channelData: ChannelModel;

  public caption: string;
  public videoUrl?: string;
  public imageUrls: string[];
  public isVideo: boolean;
  public likes: number;
  public comments: number;
  public createdAt: Date;
  public timeAgo: string;
  public widgetType: SocialFeedWidgetType;

  constructor(params: {
    id: string;
    authorData: CrimChartUserModel;
    channelData: ChannelModel;
    caption: string;
    videoUrl?: string;
    imageUrls?: string[];
    isVideo?: boolean;
    likes?: number;
    comments?: number;
    createdAt: Date;
    timeAgo?: string;
    widgetType: SocialFeedWidgetType;
  }) {
    this.id = params.id;
    this.authorData = params.authorData;
    this.channelData = params.channelData;
    this.caption = params.caption;
    this.videoUrl = params.videoUrl;
    this.imageUrls = params.imageUrls ?? [];
    this.isVideo = params.isVideo ?? false;
    this.likes = params.likes ?? 0;
    this.comments = params.comments ?? 0;
    this.createdAt = params.createdAt;
    this.timeAgo = params.timeAgo ?? '';
    this.widgetType = params.widgetType;
  }

  static fromMap(map: any): SocialFeedItem {
    const widgetTypeStr = String(map.widget_type || 'channel_post');
    const widgetType = widgetTypeStr === 'regular_post'
      ? SocialFeedWidgetType.regularPost
      : SocialFeedWidgetType.channelPost;

    const rawImageUrls = map.image_urls || map.imageUrls;
    let imageUrls: string[] = [];
    if (typeof rawImageUrls === 'string' && rawImageUrls) {
      try {
        const decoded = JSON.parse(rawImageUrls);
        if (Array.isArray(decoded)) imageUrls = decoded.map(String);
      } catch (e) {}
    } else if (Array.isArray(rawImageUrls)) {
      imageUrls = rawImageUrls.map(String);
    }

    const createdAt = map.created_at ? new Date(map.created_at) : new Date();

    // Time Ago formatter
    const diff = Math.floor((new Date().getTime() - createdAt.getTime()) / 1000);
    let timeAgo = '';
    if (diff < 60) timeAgo = 'just now';
    else if (diff < 3600) timeAgo = `${Math.floor(diff / 60)}m`;
    else if (diff < 86400) timeAgo = `${Math.floor(diff / 3600)}h`;
    else timeAgo = `${Math.floor(diff / 86400)}d`;

    return new SocialFeedItem({
      id: String(map.id || ''),
      authorData: CrimChartUserModel.empty().copyWith({
        id: String(map.author_id || ''),
        displayName: String(map.author_username || 'unknown'),
        profileImageUrl: String(
          map.channel_avatar_url ||
          map.channelAvatarUrl ||
          map.channel_avatar ||
          map.channelAvatar ||
          map.author_avatar_url ||
          map.authorAvatarUrl ||
          ''
        ),
      }),
      channelData: {
        ...emptyChannel(),
        id: String(map.channel_id || ''),
        title: String(map.channel_name || ''),
        imageUrl: String(
          map.channel_avatar_url ||
          map.channelAvatarUrl ||
          map.channel_avatar ||
          map.channelAvatar ||
          ''
        ),
      },
      caption: String(map.caption || ''),
      videoUrl: map.video_url,
      imageUrls,
      isVideo: map.is_video === true || map.is_video === 1 || map.isVideo === true || map.isVideo === 1,
      likes: Number(map.likes || 0),
      comments: Number(map.comments || 0),
      createdAt,
      timeAgo,
      widgetType,
    });
  }
}
