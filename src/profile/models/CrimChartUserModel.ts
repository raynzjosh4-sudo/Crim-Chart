export class CrimChartUserModel {
  public id: string;
  public displayName: string;
  public username?: string;
  public profileImageUrl?: string | null;
  public bio?: string;
  public crownTitle?: string;
  public birthday?: Date | null;
  public gender?: string | null;
  public isVerified?: boolean;
  public role?: string;
  public statusCount?: number;
  public followersCount?: number;
  public followingCount?: number;
  public channelsCreatedCount?: number;
  public channelCount?: number;
  public giftsEarned?: number;
  public coinsEarned?: number;
  public isActive?: boolean;
  public hasStatus?: boolean;
  public isFollowing?: boolean;
  public isMe?: boolean;
  public createdAt?: Date;

  constructor(params: {
    id: string;
    displayName: string;
    username?: string;
    profileImageUrl?: string | null;
    bio?: string;
    crownTitle?: string;
    birthday?: Date | null;
    gender?: string | null;
    isVerified?: boolean;
    role?: string;
    statusCount?: number;
    followersCount?: number;
    followingCount?: number;
    channelsCreatedCount?: number;
    channelCount?: number;
    giftsEarned?: number;
    coinsEarned?: number;
    isActive?: boolean;
    hasStatus?: boolean;
    isFollowing?: boolean;
    isMe?: boolean;
    createdAt?: Date;
  }) {
    this.id = params.id;
    this.displayName = params.displayName;
    this.username = params.username;
    this.profileImageUrl = params.profileImageUrl;
    this.bio = params.bio;
    this.crownTitle = params.crownTitle;
    this.birthday = params.birthday;
    this.gender = params.gender;
    this.isVerified = params.isVerified;
    this.role = params.role;
    this.statusCount = params.statusCount;
    this.followersCount = params.followersCount ?? 0;
    this.followingCount = params.followingCount ?? 0;
    this.channelsCreatedCount = params.channelsCreatedCount ?? 0;
    this.channelCount = params.channelCount ?? 0;
    this.giftsEarned = params.giftsEarned ?? 0;
    this.coinsEarned = params.coinsEarned ?? 0;
    this.isActive = params.isActive;
    this.hasStatus = params.hasStatus;
    this.isFollowing = params.isFollowing;
    this.isMe = params.isMe;
    this.createdAt = params.createdAt;
  }

  static empty(): CrimChartUserModel {
    return new CrimChartUserModel({ id: '', displayName: '' });
  }

  static fromMap(map: any): CrimChartUserModel {
    return new CrimChartUserModel({
      id: String(map.id ?? map.user_id ?? ''),
      displayName: String(map.username ?? map.displayName ?? map.display_name ?? ''),
      username: map.username ?? map.displayName ?? map.display_name,
      profileImageUrl: CrimChartUserModel.correctImageUrl(
        map.profile_image_url ?? map.profileImageUrl ?? map.avatar_url ?? ''
      ),
      bio: map.bio ?? map.description,
      crownTitle: map.crown_title ?? map.crownTitle,
      birthday: map.birthday ? new Date(map.birthday) : null,
      gender: map.gender ?? null,
      isVerified: Boolean(map.is_verified ?? map.isVerified),
      role: map.role,
      statusCount: Number(map.status_count ?? map.statusCount ?? 0),
      followersCount: Number(map.followers_count ?? map.followersCount ?? 0),
      followingCount: Number(map.following_count ?? map.followingCount ?? 0),
      channelsCreatedCount: Number(map.charts_count ?? map.channels_created_count ?? map.channelsCreatedCount ?? 0),
      channelCount: Number(map.channel_count ?? map.channelCount ?? 0),
      giftsEarned: Number(map.gifts_earned ?? map.giftsEarned ?? 0),
      coinsEarned: Number(map.coins_earned ?? map.coinsEarned ?? 0),
      isActive: Boolean(map.is_active ?? map.isActive ?? true),
      hasStatus: Boolean(map.has_status ?? map.hasStatus ?? false),
      isFollowing: Boolean(map.is_following ?? map.isFollowing ?? false),
      isMe: Boolean(map.is_me ?? map.isMe ?? false),
      createdAt: map.created_at ? new Date(map.created_at) : undefined,
    });
  }

  copyWith(updates: Partial<CrimChartUserModel>): CrimChartUserModel {
    return new CrimChartUserModel({ ...this, ...updates });
  }

  static correctImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Handle relative or Supabase storage paths
    return url;
  }
}
