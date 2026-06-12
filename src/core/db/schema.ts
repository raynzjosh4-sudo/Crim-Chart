export const TABLES = {
  USERS: 'users',
  CHANNELS: 'channels',
  CHANNEL_POSTS: 'channel_posts',
  CHANNEL_MEMBERS: 'channel_members',
  CHANNEL_MESSAGES: 'channel_messages',
  DISCOVERY_FEED: 'discovery_feed',
  STATUSES: 'statuses',
  CHANNEL_MOMENTS: 'channel_moments',
};

export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS ${TABLES.USERS} (
    id TEXT PRIMARY KEY,
    username TEXT,
    display_name TEXT,
    profile_image_url TEXT,
    bio TEXT,
    created_at TEXT
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
    allow_status_posting_by TEXT DEFAULT 'all',
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
    sync_status TEXT DEFAULT 'SYNCED'
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.CHANNEL_MOMENTS} (
    id TEXT PRIMARY KEY,
    channel_id TEXT,
    author_id TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    caption TEXT,
    media_type TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS ${TABLES.CHANNEL_MEMBERS} (
    channel_id TEXT,
    user_id TEXT,
    role TEXT DEFAULT 'member',
    unread_count INTEGER DEFAULT 0,
    joined_at INTEGER,
    unread_moments_count INTEGER DEFAULT 0,
    is_following INTEGER DEFAULT 1,
    sync_status TEXT DEFAULT 'SYNCED',
    PRIMARY KEY (channel_id, user_id)
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
    reply_to_id TEXT,
    created_at TEXT,
    is_pending INTEGER DEFAULT 0
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
    is_liked INTEGER DEFAULT 0
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
    widget_type TEXT
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
    channel_id TEXT -- Added to support channel-specific moments
  );
`;
