-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  display_name text NOT NULL,
  profile_image_url text,
  bio text,
  crown_title text,
  birthday date,
  gender text,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  youtube_channel_id text,
  status_count integer DEFAULT 0,
  channels_created_count integer DEFAULT 0,
  is_online boolean DEFAULT false,
  last_seen timestamp with time zone DEFAULT now(),
  has_status boolean DEFAULT false,
  active_status_views_count integer DEFAULT 0,
  boxes_count integer DEFAULT 0,
  box_submissions_count integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  inbox_count integer DEFAULT 0,
  unread_interactions_count integer DEFAULT 0,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.channels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  avatar_url text,
  age_restriction text DEFAULT 'All Ages'::text,
  visible_to_other_channel_members boolean DEFAULT false,
  visible_to_followed_users boolean DEFAULT true,
  join_method text DEFAULT 'invite'::text,
  prevent_leaving boolean DEFAULT false,
  country_restrictions jsonb DEFAULT '["Global"]'::jsonb,
  allow_commenting_by text DEFAULT 'all'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  allow_status_posting_by text NOT NULL DEFAULT 'all'::text,
  is_discoverable boolean DEFAULT true,
  allow_invitations_by text DEFAULT 'all'::text,
  youtube_channel_id text,
  members_count integer DEFAULT 1,
  followers_count integer DEFAULT 0,
  moments_count integer DEFAULT 0,
  messages_count integer DEFAULT 0,
  tags_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  unread_count integer DEFAULT 0,
  has_active_members boolean DEFAULT false,
  CONSTRAINT channels_pkey PRIMARY KEY (id),
  CONSTRAINT channels_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.channel_members (
  channel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member'::text,
  unread_count integer DEFAULT 0,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  unread_moments_count integer NOT NULL DEFAULT 0,
  is_following boolean DEFAULT true,
  CONSTRAINT channel_members_pkey PRIMARY KEY (channel_id, user_id),
  CONSTRAINT channel_members_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT channel_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.crowns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  crowner_id uuid NOT NULL,
  channel_id uuid,
  is_active boolean DEFAULT true,
  has_status boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT crowns_pkey PRIMARY KEY (id),
  CONSTRAINT crowns_crowner_id_fkey FOREIGN KEY (crowner_id) REFERENCES public.profiles(id),
  CONSTRAINT crowns_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.crown_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  crown_id uuid NOT NULL,
  description text NOT NULL,
  media_url text,
  media_type text DEFAULT 'none'::text,
  link text,
  crowned_user_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT crown_options_pkey PRIMARY KEY (id),
  CONSTRAINT crown_options_crown_id_fkey FOREIGN KEY (crown_id) REFERENCES public.crowns(id),
  CONSTRAINT crown_options_crowned_user_id_fkey FOREIGN KEY (crowned_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.crown_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  crown_id uuid NOT NULL,
  option_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT crown_votes_pkey PRIMARY KEY (id),
  CONSTRAINT crown_votes_crown_id_fkey FOREIGN KEY (crown_id) REFERENCES public.crowns(id),
  CONSTRAINT crown_votes_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.crown_options(id),
  CONSTRAINT crown_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.all_post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  channel_id uuid,
  message text,
  image_urls jsonb DEFAULT '[]'::jsonb,
  likes integer DEFAULT 0,
  is_pending boolean DEFAULT false,
  CONSTRAINT all_post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT channel_post_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT channel_post_comments_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.channel_gifts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  giver_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  gift_id text NOT NULL,
  coin_value integer DEFAULT 0,
  received_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT channel_gifts_pkey PRIMARY KEY (id),
  CONSTRAINT channel_gifts_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT channel_gifts_giver_id_fkey FOREIGN KEY (giver_id) REFERENCES public.profiles(id),
  CONSTRAINT channel_gifts_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.statuses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  caption text,
  image_urls jsonb DEFAULT '[]'::jsonb,
  video_url text,
  audio_url text,
  is_video boolean DEFAULT false,
  is_audio boolean DEFAULT false,
  privacy text DEFAULT 'public'::text,
  allow_comments boolean DEFAULT true,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at timestamp with time zone,
  thumbnail_url text,
  CONSTRAINT statuses_pkey PRIMARY KEY (id),
  CONSTRAINT statuses_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.status_views (
  status_id uuid NOT NULL,
  viewer_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT status_views_pkey PRIMARY KEY (status_id, viewer_id),
  CONSTRAINT status_views_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.statuses(id),
  CONSTRAINT status_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.channel_presence (
  channel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  is_typing boolean DEFAULT false,
  is_online boolean DEFAULT false,
  last_seen_at timestamp with time zone,
  last_known_name text,
  last_known_avatar text,
  CONSTRAINT channel_presence_pkey PRIMARY KEY (channel_id, user_id),
  CONSTRAINT channel_presence_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT channel_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.channel_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  text_content text,
  media_url text,
  media_type text,
  voice_note_url text,
  reply_to_id uuid,
  is_read boolean DEFAULT false,
  is_pending boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  metadata jsonb,
  thumbnail_url text,
  message_type text,
  views_count integer DEFAULT 0,
  CONSTRAINT channel_messages_pkey PRIMARY KEY (id),
  CONSTRAINT channel_messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT channel_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.common_channels (
  user_id uuid NOT NULL,
  other_user_id uuid NOT NULL,
  channel_id uuid NOT NULL,
  CONSTRAINT common_channels_pkey PRIMARY KEY (user_id, other_user_id, channel_id),
  CONSTRAINT common_channels_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT common_channels_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT common_channels_other_user_id_fkey FOREIGN KEY (other_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.channel_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  author_id uuid NOT NULL,
  caption text,
  image_urls jsonb DEFAULT '[]'::jsonb,
  video_url text,
  is_video boolean DEFAULT false,
  is_sponsored boolean DEFAULT false,
  aspect_ratio double precision,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  is_pending boolean DEFAULT false,
  video_urls jsonb DEFAULT '[]'::jsonb,
  thumbnail_urls jsonb DEFAULT '[]'::jsonb,
  author_username text,
  author_profile_image_url text,
  audio_url text,
  is_audio boolean DEFAULT false,
  allow_comments boolean DEFAULT true,
  is_public boolean DEFAULT true,
  post_type text DEFAULT 'post'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  tags_count integer DEFAULT 0,
  channel_name text,
  channel_avatar_url text,
  widget_type text DEFAULT 'channel_post'::text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  downloads_count integer DEFAULT 0,
  type text,
  CONSTRAINT channel_posts_pkey PRIMARY KEY (id),
  CONSTRAINT channel_posts_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT channel_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.all_post_tags (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  post_id uuid NOT NULL,
  tag_name text NOT NULL,
  tag_value text,
  tag_color text,
  CONSTRAINT all_post_tags_pkey PRIMARY KEY (id),
  CONSTRAINT channel_post_tags_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.channel_posts(id)
);
CREATE TABLE public.channel_moments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  author_id uuid NOT NULL,
  media_url text NOT NULL,
  caption text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  expires_at timestamp with time zone,
  media_type text NOT NULL DEFAULT 'photo'::text,
  thumbnail_url text,
  views_count integer DEFAULT 0,
  CONSTRAINT channel_moments_pkey PRIMARY KEY (id),
  CONSTRAINT channel_moments_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT channel_moments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.channel_statuses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  author_id uuid NOT NULL,
  caption text,
  image_urls jsonb DEFAULT '[]'::jsonb,
  video_url text,
  audio_url text,
  is_video boolean DEFAULT false,
  is_audio boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at timestamp with time zone,
  thumbnail_url text,
  CONSTRAINT channel_statuses_pkey PRIMARY KEY (id),
  CONSTRAINT channel_statuses_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT channel_statuses_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.channel_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  source_channel_id uuid NOT NULL,
  target_channel_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT channel_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT channel_invitations_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT channel_invitations_source_channel_id_fkey FOREIGN KEY (source_channel_id) REFERENCES public.channels(id),
  CONSTRAINT channel_invitations_target_channel_id_fkey FOREIGN KEY (target_channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.all_posts_likes (
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT all_posts_likes_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT channel_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT channel_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.channel_posts(id)
);
CREATE TABLE public.comment_counts (
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comment_counts_pkey PRIMARY KEY (post_id, user_id),
  CONSTRAINT channel_post_comment_counts_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.channel_posts(id),
  CONSTRAINT channel_post_comment_counts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.channel_content_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  source_channel_id uuid NOT NULL,
  target_channel_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  link_chain ARRAY DEFAULT '{}'::text[],
  CONSTRAINT channel_content_tags_pkey PRIMARY KEY (id),
  CONSTRAINT channel_content_tags_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.channel_posts(id),
  CONSTRAINT channel_content_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT channel_content_tags_source_channel_id_fkey FOREIGN KEY (source_channel_id) REFERENCES public.channels(id),
  CONSTRAINT channel_content_tags_target_channel_id_fkey FOREIGN KEY (target_channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.app_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  action_type text NOT NULL,
  record_id uuid,
  data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT app_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.invitation_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT invitation_requests_pkey PRIMARY KEY (id),
  CONSTRAINT invitation_requests_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT invitation_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.inbox (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  participant_id uuid,
  last_message text,
  last_message_at timestamp with time zone DEFAULT now(),
  chat_type text DEFAULT 'private'::text,
  metadata jsonb,
  unread_count integer DEFAULT 0,
  last_message_type text DEFAULT 'text'::text,
  CONSTRAINT inbox_pkey PRIMARY KEY (id, user_id),
  CONSTRAINT inbox_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.inbox_messages (
  id text NOT NULL,
  thread_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  body text,
  media_url text,
  message_type text DEFAULT 'text'::text,
  created_at timestamp with time zone DEFAULT now(),
  isRead boolean,
  CONSTRAINT inbox_messages_pkey PRIMARY KEY (id),
  CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES auth.users(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  caption text,
  video_url text,
  image_urls jsonb DEFAULT '[]'::jsonb,
  is_video boolean DEFAULT false,
  tags integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  privacy text DEFAULT 'public'::text,
  role_viewer text,
  thumbnail_urls jsonb DEFAULT '[]'::jsonb,
  audio_url text,
  is_audio boolean DEFAULT false,
  parent_post_id uuid,
  aspect_ratio double precision,
  allow_comments boolean DEFAULT true,
  video_urls jsonb DEFAULT '[]'::jsonb,
  time timestamp without time zone DEFAULT now(),
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  tags_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  views_count integer DEFAULT 0,
  downloads_count integer DEFAULT 0,
  type text,
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT posts_parent_post_id_fkey FOREIGN KEY (parent_post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.channel_branding (
  channel_id uuid NOT NULL,
  theme_color text,
  cover_image_url text,
  leader_avatar_url text,
  is_animated boolean DEFAULT false,
  has_border boolean DEFAULT false,
  CONSTRAINT channel_branding_pkey PRIMARY KEY (channel_id),
  CONSTRAINT channel_branding_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.follows (
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id),
  CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.boxes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  box_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  allow_submissions boolean DEFAULT true,
  is_public boolean DEFAULT true,
  age_restriction text DEFAULT 'All Ages'::text,
  country_restrictions jsonb DEFAULT '["Global"]'::jsonb,
  visible_to_followed_users boolean DEFAULT true,
  views_count integer DEFAULT 0,
  CONSTRAINT boxes_pkey PRIMARY KEY (id),
  CONSTRAINT boxes_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.box_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  box_id uuid NOT NULL,
  post_id uuid NOT NULL,
  likes_count integer DEFAULT 0,
  dislikes_count integer DEFAULT 0,
  is_viral_pushed boolean DEFAULT false,
  added_at timestamp with time zone DEFAULT now(),
  views_count integer DEFAULT 0,
  downloads_count integer DEFAULT 0,
  user_id uuid,
  CONSTRAINT box_items_pkey PRIMARY KEY (id),
  CONSTRAINT box_items_box_id_fkey FOREIGN KEY (box_id) REFERENCES public.boxes(id),
  CONSTRAINT box_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.box_item_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  box_item_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT box_item_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT box_item_reactions_box_item_id_fkey FOREIGN KEY (box_item_id) REFERENCES public.box_items(id),
  CONSTRAINT box_item_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.box_members (
  box_id uuid NOT NULL,
  user_id uuid NOT NULL,
  last_interaction_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  interaction_type text NOT NULL DEFAULT 'view'::text,
  CONSTRAINT box_members_pkey PRIMARY KEY (box_id, user_id),
  CONSTRAINT box_members_box_id_fkey FOREIGN KEY (box_id) REFERENCES public.boxes(id),
  CONSTRAINT box_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.box_item_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  box_item_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT box_item_likes_pkey PRIMARY KEY (id),
  CONSTRAINT box_item_likes_box_item_id_fkey FOREIGN KEY (box_item_id) REFERENCES public.box_items(id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  author_id text NOT NULL,
  author_username text,
  author_avatar_url text,
  text text,
  media_url text,
  media_type text,
  reply_to_id text,
  created_at timestamp with time zone DEFAULT now(),
  likes_count integer DEFAULT 0,
  CONSTRAINT comments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.comment_likes (
  user_id uuid NOT NULL,
  comment_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comment_likes_pkey PRIMARY KEY (user_id, comment_id),
  CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id)
);
CREATE TABLE public.post_views (
  user_id uuid NOT NULL,
  post_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_views_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT post_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.post_tags (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_tags_pkey PRIMARY KEY (id),
  CONSTRAINT post_tags_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT post_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);