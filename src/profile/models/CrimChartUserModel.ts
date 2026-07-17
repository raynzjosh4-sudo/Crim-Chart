export interface UserConnectionStatsModel {
  relSentCount: number;
  relAcceptedCount: number;
  relationshipStatus: string;
  preferredCountries: string[];
  preferredAgeRanges: string[];
  showStatusCircle: boolean;
  showStatusText: boolean;
  showCountryPref: boolean;
  showAgePref: boolean;
  lockedIntent: boolean;
}

export interface UserTagGroup {
  taggerId: string;
  taggerName: string;
  taggerAvatar: string;
  tags: { id: string; name: string }[];
}

export class CrimChartUserModel {
  public id: string;
  public displayName: string;
  public username?: string;
  public email?: string;
  public profileImageUrl?: string | null;
  public bio?: string;
  public crownTitle?: string;
  public birthday?: Date | null;
  public gender?: string | null;
  public country?: string | null;
  public isVerified?: boolean;
  public role?: string;
  public statusCount?: number;
  public followersCount?: number;
  public followingCount?: number;
  public channelsCreatedCount?: number;
  public channelCount?: number;
  public boxesCount?: number;
  public boxSubmissionsCount?: number;
  public postsCount?: number;
  public inboxCount?: number;
  public downloadsCount?: number;
  public giftsEarned?: number;
  public coinsEarned?: number;
  public isActive?: boolean;
  public hasStatus?: boolean;
  public isFollowing?: boolean;
  public isMe?: boolean;
  public createdAt?: Date;
  public inboxPermission?: string;
  public connectionStats?: UserConnectionStatsModel;
  public musicCategory?: string;
  public receivedTags?: UserTagGroup[];

  constructor(params: {
    id: string;
    displayName: string;
    username?: string;
    email?: string;
    profileImageUrl?: string | null;
    bio?: string;
    crownTitle?: string;
    birthday?: Date | null;
    gender?: string | null;
    country?: string | null;
    isVerified?: boolean;
    role?: string;
    statusCount?: number;
    followersCount?: number;
    followingCount?: number;
    channelsCreatedCount?: number;
    channelCount?: number;
    boxesCount?: number;
    boxSubmissionsCount?: number;
    postsCount?: number;
    inboxCount?: number;
    downloadsCount?: number;
    giftsEarned?: number;
    coinsEarned?: number;
    isActive?: boolean;
    hasStatus?: boolean;
    isFollowing?: boolean;
    isMe?: boolean;
    createdAt?: Date;
    inboxPermission?: string;
    connectionStats?: UserConnectionStatsModel;
    musicCategory?: string;
    receivedTags?: UserTagGroup[];
  }) {
    this.id = params.id;
    this.displayName = params.displayName;
    this.username = params.username;
    this.email = params.email;
    this.profileImageUrl = params.profileImageUrl;
    this.bio = params.bio;
    this.crownTitle = params.crownTitle;
    this.birthday = params.birthday;
    this.gender = params.gender;
    this.country = params.country;
    this.isVerified = params.isVerified;
    this.role = params.role;
    this.statusCount = params.statusCount;
    this.followersCount = params.followersCount ?? 0;
    this.followingCount = params.followingCount ?? 0;
    this.channelsCreatedCount = params.channelsCreatedCount ?? 0;
    this.channelCount = params.channelCount ?? 0;
    this.boxesCount = params.boxesCount ?? 0;
    this.boxSubmissionsCount = params.boxSubmissionsCount ?? 0;
    this.postsCount = params.postsCount ?? 0;
    this.inboxCount = params.inboxCount ?? 0;
    this.downloadsCount = params.downloadsCount ?? 0;
    this.giftsEarned = params.giftsEarned ?? 0;
    this.coinsEarned = params.coinsEarned ?? 0;
    this.isActive = params.isActive;
    this.hasStatus = params.hasStatus;
    this.isFollowing = params.isFollowing;
    this.isMe = params.isMe;
    this.createdAt = params.createdAt;
    this.inboxPermission = params.inboxPermission ?? 'everyone';
    this.connectionStats = params.connectionStats;
    this.musicCategory = params.musicCategory;
    this.receivedTags = params.receivedTags;
  }

  static empty(): CrimChartUserModel {
    return new CrimChartUserModel({ id: '', displayName: '', username: '', email: '', profileImageUrl: null });
  }

  static fromMap(map: any): CrimChartUserModel {
    return new CrimChartUserModel({
      id: String(map.id ?? map.user_id ?? ''),
      displayName: String(map.username ?? map.displayName ?? map.display_name ?? ''),
      username: map.username ?? map.displayName ?? map.display_name,
      email: map.email,
      profileImageUrl: CrimChartUserModel.correctImageUrl(
        map.profile_image_url ?? map.profileImageUrl ?? map.avatar_url ?? ''
      ),
      bio: map.bio ?? map.description,
      crownTitle: map.crown_title ?? map.crownTitle,
      birthday: map.birthday ? new Date(map.birthday) : null,
      gender: map.gender ?? null,
      country: map.country ?? null,
      isVerified: Boolean(map.is_verified ?? map.isVerified),
      role: map.role,
      statusCount: Number(map.status_count ?? map.statusCount ?? 0),
      followersCount: Number(map.followers_count ?? map.followersCount ?? 0),
      followingCount: Number(map.following_count ?? map.followingCount ?? 0),
      channelsCreatedCount: Number(map.charts_count ?? map.channels_created_count ?? map.channelsCreatedCount ?? 0),
      channelCount: Number(map.channel_count ?? map.channelCount ?? 0),
      boxesCount: Number(map.boxes_count ?? map.boxesCount ?? 0),
      boxSubmissionsCount: Number(map.box_submissions_count ?? map.boxSubmissionsCount ?? 0),
      postsCount: Number(map.posts_count ?? map.postsCount ?? 0),
      inboxCount: Number(map.inbox_count ?? map.inboxCount ?? 0),
      downloadsCount: Number(map.downloads_count ?? map.downloadsCount ?? 0),
      giftsEarned: Number(map.gifts_earned ?? map.giftsEarned ?? 0),
      coinsEarned: Number(map.coins_earned ?? map.coinsEarned ?? 0),
      isActive: map.is_active,
      hasStatus: map.has_status,
      isFollowing: map.is_following,
      isMe: Boolean(map.is_me ?? map.isMe ?? false),
      createdAt: map.created_at ? new Date(map.created_at) : undefined,
      inboxPermission: map.inbox_permission,
      connectionStats: map.user_connection_stats ? {
        relSentCount: map.user_connection_stats.rel_sent_count ?? 0,
        relAcceptedCount: map.user_connection_stats.rel_accepted_count ?? 0,
        relationshipStatus: map.user_connection_stats.relationship_status ?? 'Unknown',
        preferredCountries: map.user_connection_stats.preferred_countries ?? [],
        preferredAgeRanges: map.user_connection_stats.preferred_age_ranges ?? [],
        showStatusCircle: map.user_connection_stats.show_status_circle ?? true,
        showStatusText: map.user_connection_stats.show_status_text ?? true,
        showCountryPref: map.user_connection_stats.show_country_pref ?? true,
        showAgePref: map.user_connection_stats.show_age_pref ?? true,
        lockedIntent: map.user_connection_stats.locked_intent ?? false,
      } : undefined,
      receivedTags: typeof map.received_tags === 'string' ? (() => {
        try { return JSON.parse(map.received_tags); } catch { return []; }
      })() : (map.received_tags || []),
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
