export interface ChannelEntity {
  id: string;
  name: string;
  avatarUrl?: string;
  description?: string;
  isPrivate?: boolean;
  isCharted?: boolean;
  creatorId?: string;
  creatorName?: string;
  creatorAvatarUrl?: string;
  createdAt?: Date;
  is_discoverable?: number;
  join_method?: string;
  age_restriction?: string;
  visible_to_other_channel_members?: number;
  visible_to_followed_users?: number;
  prevent_leaving?: number;
  country_restrictions?: string;
  allow_commenting_by?: string;
  allow_status_posting_by?: string;
  allow_invitations_by?: string;
}
