-- Drop the function first because we changed the return signature (is_discoverable from INT to BOOLEAN)
DROP FUNCTION IF EXISTS public.get_channel_details(UUID, UUID);

-- Create the RPC function to get full channel details efficiently
CREATE OR REPLACE FUNCTION public.get_channel_details(
  p_channel_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  youtube_channel_id TEXT,
  "isActive" BOOLEAN,
  members_count INT,
  moments_count INT,
  messages_count INT,
  tags_count INT,
  likes_count INT,
  followers_count INT,
  unread_count INT,
  pending_requests_count INT,
  has_active_members BOOLEAN,
  age_restriction TEXT,
  visible_to_other_channel_members BOOLEAN,
  visible_to_followed_users BOOLEAN,
  join_method TEXT,
  prevent_leaving BOOLEAN,
  country_restrictions JSONB,
  allow_commenting_by TEXT,
  allow_posting_by TEXT,
  allow_status_posting_by TEXT,
  allow_invitations_by TEXT,
  allow_chatting_by TEXT,
  is_discoverable BOOLEAN,
  "isCharted" BOOLEAN,
  "isPrivate" BOOLEAN,
  creator_id UUID,
  created_at TIMESTAMPTZ,
  creator_name TEXT,
  creator_avatar_url TEXT,
  user_role TEXT,
  can_chat BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.avatar_url,
    c.youtube_channel_id,
    COALESCE(c."isActive", false) AS "isActive",
    COALESCE(c.members_count, 0),
    COALESCE(c.moments_count, 0),
    COALESCE(c.messages_count, 0),
    COALESCE(c.tags_count, 0),
    COALESCE(c.likes_count, 0),
    COALESCE(c.followers_count, 0),
    COALESCE(c.unread_count, 0),
    COALESCE(c.pending_requests_count, 0),
    COALESCE(c.has_active_members, false),
    c.age_restriction,
    COALESCE(c.visible_to_other_channel_members, true),
    COALESCE(c.visible_to_followed_users, true),
    COALESCE(c.join_method, 'invite'),
    COALESCE(c.prevent_leaving, false),
    c.country_restrictions,
    COALESCE(c.allow_commenting_by, 'all'),
    COALESCE(c.allow_posting_by, 'all'),
    COALESCE(c.allow_status_posting_by, 'all'),
    COALESCE(c.allow_invitations_by, 'all'),
    COALESCE(c.allow_chatting_by, 'all'),
    COALESCE(c.is_discoverable, true),
    false AS "isCharted",
    false AS "isPrivate",
    c.creator_id,
    c.created_at,
    p.display_name AS creator_name,
    p.profile_image_url AS creator_avatar_url,
    cm.role AS user_role,
    cm.can_chat AS can_chat
  FROM public.channels c
  LEFT JOIN public.profiles p ON p.id = c.creator_id
  LEFT JOIN public.channel_members cm ON cm.channel_id = c.id AND cm.user_id = p_user_id
  WHERE c.id = p_channel_id;
END;
$$ LANGUAGE plpgsql STABLE;
