export const TABLES = {
  USERS: 'users',
  CHANNELS: 'channels',
  CHANNEL_POSTS: 'channel_posts',
  CHANNEL_MEMBERS: 'channel_members',
  CHANNEL_MESSAGES: 'channel_messages',
  DISCOVERY_FEED: 'discovery_feed',
  STATUSES: 'statuses',
  FEED_STATUSES: 'cached_feed_statuses',
  CHANNEL_MOMENTS: 'channel_moments',
  PROFILE_MEDIA: 'profile_media',
  BOXES: 'boxes',
  BOX_ITEMS: 'box_items',
  BOX_MEMBERS: 'box_members',
  TRENDING_BOX_ITEMS: 'trending_box_items',
  COMMENTS: 'comments',
  CHANNEL_REQUESTS: 'channel_requests',
  USER_CONNECTION_STATS: 'user_connection_stats',
  MAIN_FEED: 'main_feed',
  CHANNEL_STATUSES: 'channel_statuses',
  MUSIC_FEED: 'music_feed',
};

export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS ${TABLES.USERS} (
    id TEXT PRIMARY KEY,
    username TEXT,
    display_name TEXT,
    profile_image_url TEXT,
    bio TEXT,
    crown_title TEXT,
    created_at TEXT,
    is_online INTEGER DEFAULT 0,
    last_seen TEXT,
    has_status INTEGER DEFAULT 0,
    status_count INTEGER DEFAULT 0,
    inbox_permission TEXT DEFAULT 'everyone'
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.USER_CONNECTION_STATS} (
    user_id TEXT PRIMARY KEY,
    rel_sent_count INTEGER DEFAULT 0,
    rel_accepted_count INTEGER DEFAULT 0,
    relationship_status TEXT DEFAULT 'Unknown',
    preferred_countries TEXT DEFAULT '[]',
    preferred_age_ranges TEXT DEFAULT '[]',
    show_status_circle INTEGER DEFAULT 1,
    show_status_text INTEGER DEFAULT 1,
    show_country_pref INTEGER DEFAULT 1,
    show_age_pref INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.CHANNELS} (
    id TEXT PRIMARY KEY,
    creator_id TEXT,
    name TEXT,
    description TEXT,
    avatar_url TEXT,
    age_restriction TEXT DEFAULT 'All Ages',
    visible_to_other_channel_members INTEGER DEFAULT 0,
    visible_to_followed_users INTEGER DEFAULT 1,
    join_method TEXT DEFAULT 'invite',
    prevent_leaving INTEGER DEFAULT 0,
    country_restrictions TEXT DEFAULT '["Global"]',
    allow_commenting_by TEXT DEFAULT 'all',
    allow_posting_by TEXT DEFAULT 'all',
    allow_status_posting_by TEXT DEFAULT 'all',
    allow_chatting_by TEXT DEFAULT 'all',
    is_discoverable INTEGER DEFAULT 1,
    allow_invitations_by TEXT DEFAULT 'all',
    youtube_channel_id TEXT,
    members_count INTEGER DEFAULT 1,
    followers_count INTEGER DEFAULT 0,
    moments_count INTEGER DEFAULT 0,
    messages_count INTEGER DEFAULT 0,
    tags_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    has_active_members INTEGER DEFAULT 0,
    created_at INTEGER,
    sync_status TEXT DEFAULT 'SYNCED',
    invite_link TEXT,
    category TEXT,
    rules_text TEXT,
    is_paid INTEGER DEFAULT 0,
    subscription_price REAL,
    pinned_message_id TEXT,
    is_youtube_claimed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.CHANNEL_MOMENTS} (
    id TEXT PRIMARY KEY,
    channel_id TEXT,
    author_id TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    caption TEXT,
    media_type TEXT,
    created_at TEXT,
    views_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.CHANNEL_STATUSES} (
    id TEXT PRIMARY KEY,
    channel_id TEXT,
    author_id TEXT,
    caption TEXT,
    image_urls TEXT,
    video_url TEXT,
    audio_url TEXT,
    is_video INTEGER DEFAULT 0,
    is_audio INTEGER DEFAULT 0,
    created_at TEXT,
    expires_at TEXT,
    thumbnail_url TEXT
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.CHANNEL_MEMBERS} (
    channel_id TEXT,
    user_id TEXT,
    role TEXT DEFAULT 'member',
    unread_count INTEGER DEFAULT 0,
    joined_at INTEGER,
    unread_moments_count INTEGER DEFAULT 0,
    is_following INTEGER DEFAULT 1,
    can_chat INTEGER DEFAULT 1,
    sync_status TEXT DEFAULT 'SYNCED',
    PRIMARY KEY (channel_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.CHANNEL_REQUESTS} (
    id TEXT PRIMARY KEY,
    channel_id TEXT,
    target_user_id TEXT,
    request_type TEXT,
    requested_by_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.CHANNEL_MESSAGES} (
    id TEXT PRIMARY KEY,
    channel_id TEXT,
    sender_id TEXT,
    sender_name TEXT,
    sender_avatar_url TEXT,
    text TEXT,
    media_url TEXT,
    media_type TEXT, -- 'text', 'image', 'video', 'audio', 'lottie'
    metadata TEXT,
    reply_to_id TEXT,
    created_at TEXT,
    is_pending INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.CHANNEL_POSTS} (
    id TEXT PRIMARY KEY,
    channel_id TEXT,
    author_id TEXT,
    caption TEXT,
    video_url TEXT,
    image_urls TEXT,
    is_video INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TEXT,
    is_pending INTEGER DEFAULT 0,
    is_liked INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.DISCOVERY_FEED} (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    author_username TEXT,
    author_avatar_url TEXT,
    channel_id TEXT,
    channel_name TEXT,
    channel_avatar_url TEXT,
    caption TEXT,
    video_url TEXT,
    image_urls TEXT,
    is_video INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TEXT,
    widget_type TEXT,
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.STATUSES} (
    id TEXT PRIMARY KEY,
    author_id TEXT,
    caption TEXT,
    image_urls TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    audio_url TEXT,
    is_video INTEGER DEFAULT 0,
    is_audio INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TEXT,
    expires_at TEXT,
    username TEXT,
    profile_image_url TEXT,
    channel_id TEXT, -- Added to support channel-specific moments
    views_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cached_feed_statuses (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    author_name TEXT,
    author_avatar_url TEXT,
    image_urls TEXT,
    video_url TEXT,
    audio_url TEXT,
    thumbnail_url TEXT,
    caption TEXT,
    is_video INTEGER DEFAULT 0,
    is_audio INTEGER DEFAULT 0,
    created_at INTEGER,
    expires_at INTEGER,
    fetched_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_cfs_expires ON cached_feed_statuses (expires_at);
  CREATE INDEX IF NOT EXISTS idx_cfs_author  ON cached_feed_statuses (author_id);

  CREATE TABLE IF NOT EXISTS ${TABLES.PROFILE_MEDIA} (
    id TEXT PRIMARY KEY,
    author_id TEXT,
    media_type TEXT,
    caption TEXT,
    video_url TEXT,
    audio_url TEXT,
    image_urls TEXT,
    thumbnail_urls TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TEXT,
    metadata TEXT,
    views_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.BOXES} (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    box_type TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    is_public INTEGER DEFAULT 1,
    allow_submissions INTEGER DEFAULT 1,
    age_restriction TEXT DEFAULT 'All Ages',
    country_restrictions TEXT DEFAULT '["Global"]',
    visible_to_followed_users INTEGER DEFAULT 1,
    created_at TEXT,
    views_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.COMMENTS} (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_username TEXT,
    author_avatar_url TEXT,
    text TEXT,
    media_url TEXT,
    media_type TEXT,
    reply_to_id TEXT,
    created_at TEXT,
    likes_count INTEGER DEFAULT 0,
    is_pending INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.BOX_ITEMS} (
    id TEXT PRIMARY KEY,
    box_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    added_at TEXT,
    added_by_id TEXT,
    added_by_name TEXT,
    added_by_avatar TEXT,
    caption TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    is_video INTEGER DEFAULT 0,
    author_id TEXT,
    author_name TEXT,
    author_avatar TEXT,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    post_type TEXT,
    aspect_ratio REAL,
    UNIQUE(box_id, post_id)
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.BOX_MEMBERS} (
    box_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    interaction_type TEXT,
    last_interaction_at TEXT,
    PRIMARY KEY (box_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.TRENDING_BOX_ITEMS} (
    id TEXT PRIMARY KEY,
    box_id TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    thumbnail_url TEXT,
    audio_url TEXT,
    video_url TEXT,
    is_audio INTEGER DEFAULT 0,
    is_short INTEGER DEFAULT 0,
    likes INTEGER
  );

  CREATE TABLE IF NOT EXISTS main_feed (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    source_type TEXT NOT NULL,
    created_at TEXT,
    prefetched_data TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_main_feed_created ON main_feed (created_at DESC);

  CREATE TABLE IF NOT EXISTS ${TABLES.MUSIC_FEED} (
    id TEXT PRIMARY KEY,
    title TEXT,
    artist TEXT,
    coverUrl TEXT,
    audioUrl TEXT,
    likesCount INTEGER DEFAULT 0,
    commentsCount INTEGER DEFAULT 0,
    viewsCount INTEGER DEFAULT 0,
    downloadsCount INTEGER DEFAULT 0,
    lyrics TEXT,
    sourceTable TEXT,
    caption TEXT,
    category TEXT,
    created_at TEXT,
    owner_id TEXT,
    owner_name TEXT,
    owner_avatarUrl TEXT,
    owner_crownTitle TEXT,
    fetched_at INTEGER NOT NULL
  );
`;
