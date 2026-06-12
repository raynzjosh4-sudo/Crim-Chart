import os

BASE = 'src/channel'

# ── MODELS ──────────────────────────────────────────────────────────────────
models = {
  'models/ChannelModel.ts': '''
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

export interface ChannelModel {
  id: string;
  title: string;
  imageUrl?: string;
  description?: string;
  youtubeChannelId?: string;
  membersCount: number;
  momentsCount: number;
  messagesCount: number;
  tagsCount: number;
  likesCount: number;
  followersCount: number;
  unreadCount: number;
  ageRestriction?: string;
  visibleToOtherChannelMembers: boolean;
  visibleToFollowedUsers: boolean;
  joinMethod: string;
  preventLeaving: boolean;
  countryRestrictions: string[];
  allowCommentingBy: string;
  allowStatusPostingBy: string;
  allowInvitationsBy: string;
  isOwnChannel: boolean;
  isCharted: boolean;
  giftsVisible: boolean;
  isPrivate: boolean;
  isActive: boolean;
  isDiscoverable: boolean;
  creatorId?: string;
  creatorUser: CrimChartUserModel;
  createdAt: Date;
}

export function emptyChannel(): ChannelModel {
  return {
    id: '', title: 'Unknown Channel', membersCount: 0, momentsCount: 0,
    messagesCount: 0, tagsCount: 0, likesCount: 0, followersCount: 0,
    unreadCount: 0, visibleToOtherChannelMembers: true, visibleToFollowedUsers: true,
    joinMethod: 'invite', preventLeaving: false, countryRestrictions: ['Global'],
    allowCommentingBy: 'all', allowStatusPostingBy: 'all', allowInvitationsBy: 'all',
    isOwnChannel: false, isCharted: false, giftsVisible: true, isPrivate: false,
    isActive: false, isDiscoverable: true,
    creatorUser: { id: '', displayName: '', username: '', profileImageUrl: '' } as any,
    createdAt: new Date(),
  };
}

export function channelFromMap(map: Record<string, any>): ChannelModel {
  return {
    id: map.id?.toString() ?? '',
    title: (map.name ?? map.title ?? 'Channel')?.toString() ?? '',
    imageUrl: (map.avatar_url ?? map.imageUrl ?? '') || '',
    description: (map.description ?? map.bio)?.toString() ?? '',
    youtubeChannelId: map.youtube_channel_id?.toString(),
    isActive: Boolean(map.isActive ?? false),
    creatorId: map.creator_id?.toString(),
    isOwnChannel: false,
    creatorUser: { id: map.creator_id ?? '', displayName: map.creator_name ?? 'Owner', username: '', profileImageUrl: map.creator_avatar_url ?? '' } as any,
    membersCount: Number(map.members_count ?? 0),
    momentsCount: Number(map.moments_count ?? 0),
    messagesCount: Number(map.messages_count ?? 0),
    tagsCount: Number(map.tags_count ?? 0),
    likesCount: Number(map.likes_count ?? 0),
    followersCount: Number(map.followers_count ?? 0),
    unreadCount: Number(map.unread_count ?? 0),
    visibleToOtherChannelMembers: true,
    visibleToFollowedUsers: true,
    joinMethod: map.join_method ?? 'invite',
    preventLeaving: false,
    countryRestrictions: ['Global'],
    allowCommentingBy: map.allow_commenting_by ?? 'all',
    allowStatusPostingBy: map.allow_status_posting_by ?? 'all',
    allowInvitationsBy: map.allow_invitations_by ?? 'all',
    isDiscoverable: (map.is_discoverable ?? 1) !== 0,
    isOwnChannel: false,
    isCharted: Boolean(map.isCharted ?? false),
    giftsVisible: true,
    isPrivate: Boolean(map.isPrivate ?? false),
    createdAt: map.created_at ? new Date(map.created_at) : new Date(),
  };
}
''',

  'models/ChannelMemberModel.ts': '''
export interface ChannelMemberModel {
  channelId: string;
  userId: string;
  displayName?: string;
  profileImageUrl?: string;
  role: 'owner' | 'admin' | 'member';
  unreadCount: number;
  unreadMomentsCount: number;
  isFollowing: boolean;
  joinedAt: Date;
}

export function channelMemberFromMap(map: Record<string, any>): ChannelMemberModel {
  return {
    channelId: (map.channel_id ?? map.channelId)?.toString() ?? '',
    userId: (map.user_id ?? map.userId)?.toString() ?? '',
    displayName: map.user?.display_name ?? map.display_name ?? '',
    profileImageUrl: map.user?.profile_image_url ?? map.profile_image_url ?? '',
    role: (map.role ?? 'member') as any,
    unreadCount: Number(map.unread_count ?? map.unreadCount ?? 0),
    unreadMomentsCount: Number(map.unread_moments_count ?? 0),
    isFollowing: Boolean(map.is_following ?? map.isFollowing ?? true),
    joinedAt: map.joined_at ? new Date(map.joined_at) : new Date(),
  };
}
''',

  'models/ChannelSettingsModel.ts': '''
export interface ChannelSettingsModel {
  channelId: string;
  joinMethod: 'open' | 'invite' | 'request';
  isPrivate: boolean;
  allowCommentingBy: 'all' | 'members' | 'none';
  allowStatusPostingBy: 'all' | 'members' | 'none';
  allowInvitationsBy: 'all' | 'members' | 'admins';
  preventLeaving: boolean;
  visibleToOtherChannelMembers: boolean;
  visibleToFollowedUsers: boolean;
  giftsVisible: boolean;
  isDiscoverable: boolean;
  countryRestrictions: string[];
  ageRestriction?: string;
}
''',

  'models/ChannelInvitationModel.ts': '''
export interface ChannelInvitationModel {
  id: string;
  channelId: string;
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
''',

  'models/MemberModel.ts': '''
export interface MemberModel {
  id: string;
  userId: string;
  channelId: string;
  displayName: string;
  profileImageUrl: string;
  role: string;
  isFollowing: boolean;
  joinedAt: Date;
}
''',

  'models/ChannelFeedPostModel.ts': '''
export interface ChannelFeedPostModel {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  postType: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
}
''',

  'models/InvitationRequestModel.ts': '''
export interface InvitationRequestModel {
  id: string;
  channelId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
}
''',
}

# ── DOMAIN ENTITIES ─────────────────────────────────────────────────────────
entities = {
  'domain/entities/ChannelEntity.ts': '''
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
''',
  'domain/entities/ChannelMemberEntity.ts': '''
export interface ChannelMemberEntity {
  channelId: string;
  userId: string;
  role: string;
  unreadCount: number;
  unreadMomentsCount: number;
  isFollowing: boolean;
  joinedAt: Date;
}
''',
  'domain/entities/ChannelMessageEntity.ts': '''
export interface ChannelMessageEntity {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: Date;
  isRead: boolean;
}
''',
  'domain/entities/ChannelMomentEntity.ts': '''
export interface ChannelMomentEntity {
  id: string;
  channelId: string;
  authorId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number;
  viewersCount: number;
  createdAt: Date;
  expiresAt: Date;
}
''',
  'domain/entities/TagEntity.ts': '''
export interface TagEntity {
  id: string;
  name: string;
  channelsCount: number;
  postsCount: number;
  imageUrl?: string;
}
''',
  'domain/entities/StatusViewEntity.ts': '''
export interface StatusViewEntity {
  statusId: string;
  viewerId: string;
  viewedAt: Date;
}
''',
  'domain/entities/InvitationRequestEntity.ts': '''
export interface InvitationRequestEntity {
  id: string;
  channelId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
''',
  'domain/entities/CommonChannelEntity.ts': '''
export interface CommonChannelEntity {
  id: string;
  name: string;
  avatarUrl?: string;
  membersCount: number;
}
''',
  'domain/entities/ChannelItem.ts': '''
export type ChannelItemType = 'post' | 'moment' | 'ad' | 'divider';

export interface ChannelItem {
  type: ChannelItemType;
  data: any;
}
''',
}

# ── DATA LAYER ────────────────────────────────────────────────────────────
data_files = {
  'data/sources/ChannelRemoteSource.ts': '''
import { supabase } from '@/core/supabase/client';
import { channelFromMap, ChannelModel } from '@/channel/models/ChannelModel';
import { channelMemberFromMap, ChannelMemberModel } from '@/channel/models/ChannelMemberModel';

export class ChannelRemoteSource {
  async getChannels(page: number, limit = 20): Promise<ChannelModel[]> {
    const from = page * limit;
    const { data, error } = await supabase
      .from('channels')
      .select('*, users:creator_id(*)')
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw error;
    return (data ?? []).map(channelFromMap);
  }

  async getChannelById(channelId: string): Promise<ChannelModel | null> {
    const { data, error } = await supabase
      .from('channels')
      .select('*, users:creator_id(*)')
      .eq('id', channelId)
      .single();
    if (error) return null;
    return channelFromMap(data);
  }

  async getChannelMembers(channelId: string): Promise<ChannelMemberModel[]> {
    const { data, error } = await supabase
      .from('channel_members')
      .select('*, user:user_id(*)')
      .eq('channel_id', channelId)
      .order('joined_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(channelMemberFromMap);
  }

  async joinChannel(channelId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('channel_members')
      .insert({ channel_id: channelId, user_id: userId, role: 'member' });
    if (error) throw error;
  }

  async leaveChannel(channelId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('channel_members')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  async searchChannels(query: string): Promise<ChannelModel[]> {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(30);
    if (error) throw error;
    return (data ?? []).map(channelFromMap);
  }
}

export const channelRemoteSource = new ChannelRemoteSource();
''',

  'data/sources/TagRemoteSource.ts': '''
import { supabase } from '@/core/supabase/client';
import { TagEntity } from '@/channel/domain/entities/TagEntity';

export class TagRemoteSource {
  async getTags(page: number, limit = 20): Promise<TagEntity[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('channels_count', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    if (error) throw error;
    return (data ?? []).map((t: any) => ({
      id: t.id, name: t.name,
      channelsCount: t.channels_count ?? 0,
      postsCount: t.posts_count ?? 0,
      imageUrl: t.image_url,
    }));
  }

  async searchTags(query: string): Promise<TagEntity[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(20);
    if (error) throw error;
    return (data ?? []).map((t: any) => ({
      id: t.id, name: t.name,
      channelsCount: t.channels_count ?? 0,
      postsCount: t.posts_count ?? 0,
      imageUrl: t.image_url,
    }));
  }
}

export const tagRemoteSource = new TagRemoteSource();
''',

  'data/repositories/ChannelRepositoryImpl.ts': '''
import { channelRemoteSource } from '@/channel/data/sources/ChannelRemoteSource';
import { ChannelModel } from '@/channel/models/ChannelModel';

export class ChannelRepositoryImpl {
  getChannels = (page: number) => channelRemoteSource.getChannels(page);
  getChannelById = (id: string) => channelRemoteSource.getChannelById(id);
  getChannelMembers = (id: string) => channelRemoteSource.getChannelMembers(id);
  joinChannel = (channelId: string, userId: string) => channelRemoteSource.joinChannel(channelId, userId);
  leaveChannel = (channelId: string, userId: string) => channelRemoteSource.leaveChannel(channelId, userId);
  searchChannels = (query: string) => channelRemoteSource.searchChannels(query);
}

export const channelRepository = new ChannelRepositoryImpl();
''',
}

# ── HOOKS ────────────────────────────────────────────────────────────────
hooks = {
  'hooks/useChannelMember.ts': '''
import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/core/store/useAuthStore';

export function useChannelMember(channelId: string) {
  const user = (useAuthStore as any).getState?.()?.user;
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !channelId) { setIsLoading(false); return; }
    supabase
      .from('channel_members')
      .select('user_id')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setIsMember(!!data);
        setIsLoading(false);
      });
  }, [channelId, user?.id]);

  const joinChannel = async () => {
    if (!user) return;
    await supabase.from('channel_members').insert({ channel_id: channelId, user_id: user.id, role: 'member' });
    setIsMember(true);
  };

  return { isMember, isLoading, joinChannel };
}
''',

  'hooks/useChannelAdmin.ts': '''
import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/core/store/useAuthStore';

export function useChannelAdmin(channelId: string) {
  const user = (useAuthStore as any).getState?.()?.user;
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !channelId) { setIsLoading(false); return; }
    supabase
      .from('channel_members')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === 'admin' || data?.role === 'owner');
        setIsLoading(false);
      });
  }, [channelId, user?.id]);

  return { isAdmin, isLoading };
}
''',

  'hooks/useChannelEngagement.ts': '''
import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/core/store/useAuthStore';

export function useChannelEngagement(channelId: string) {
  const user = (useAuthStore as any).getState?.()?.user;
  const [isFollowing, setIsFollowing] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !channelId) { setIsLoading(false); return; }
    supabase
      .from('channel_members')
      .select('role, is_following')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setIsFollowing(data?.is_following ?? false);
        setIsLoading(false);
      });
  }, [channelId, user?.id]);

  const followChannel = async () => {
    if (!user) return;
    await supabase.from('channel_members').upsert({ channel_id: channelId, user_id: user.id, is_following: true });
    setIsFollowing(true);
  };

  const unfollowChannel = async () => {
    if (!user) return;
    await supabase.from('channel_members').update({ is_following: false }).eq('channel_id', channelId).eq('user_id', user.id);
    setIsFollowing(false);
  };

  const requestJoin = async () => {
    if (!user) return;
    await supabase.from('channel_join_requests').insert({ channel_id: channelId, user_id: user.id, status: 'pending' });
    setRequestStatus('pending');
  };

  return { isFollowing, requestStatus, isLoading, followChannel, unfollowChannel, requestJoin };
}
''',

  'hooks/useChannelMembers.ts': '''
import { useState, useEffect } from 'react';
import { channelRemoteSource } from '@/channel/data/sources/ChannelRemoteSource';
import { ChannelMemberModel } from '@/channel/models/ChannelMemberModel';

export function useChannelMembers(channelId: string) {
  const [members, setMembers] = useState<ChannelMemberModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channelId) return;
    channelRemoteSource.getChannelMembers(channelId)
      .then(setMembers)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [channelId]);

  return { members, isLoading, error };
}
''',
}

# ── PAGES ────────────────────────────────────────────────────────────────
pages = {
  'pages/ChannelsPage.tsx': '''
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/chartappbar/ChartAppBar';
import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { ChannelModel } from '@/channel/models/ChannelModel';
import ChannelListTile from '@/channel/widgets/ChannelListTile';

export default function ChannelsPage() {
  const { colors } = useTheme();
  const [channels, setChannels] = useState<ChannelModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    channelRepository.getChannels(0)
      .then(setChannels)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar title="Channels" showSearch />
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChannelListTile channel={item} />}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.text }]}>No channels yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { textAlign: 'center', marginTop: 40, opacity: 0.5 },
});
''',

  'pages/ChannelDetailsPage.tsx': '''
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/chartappbar/ChartAppBar';

interface Props { channelId?: string; }

export default function ChannelDetailsPage({ channelId }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar title="Channel Details" />
      <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>Channel {channelId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
''',

  'pages/ChannelSettingsPage.tsx': '''
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/chartappbar/ChartAppBar';

export default function ChannelSettingsPage() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar title="Channel Settings" />
      <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>Settings coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
''',

  'pages/ExploreChannelsPage.tsx': '''
import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { ChannelModel } from '@/channel/models/ChannelModel';
import ChannelListTile from '@/channel/widgets/ChannelListTile';
import ChartAppBar from '@/chartappbar/ChartAppBar';

export default function ExploreChannelsPage() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChannelModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 2) return;
    setIsLoading(true);
    try { setResults(await channelRepository.searchChannels(q)); }
    catch(e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar title="Explore Channels" />
      <TextInput
        style={[styles.search, { color: colors.text, borderColor: colors.border }]}
        placeholder="Search channels..."
        placeholderTextColor={colors.text + '60'}
        value={query}
        onChangeText={search}
      />
      {isLoading
        ? <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        : <FlatList data={results} keyExtractor={(i) => i.id} renderItem={({ item }) => <ChannelListTile channel={item} />} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
});
''',

  'pages/ChannelPostDetailPage.tsx': '''
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/chartappbar/ChartAppBar';

interface Props { postId?: string; channelId?: string; }

export default function ChannelPostDetailPage({ postId }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar title="Post" />
      <ScrollView />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
''',

  'pages/TagDiscoveryPage.tsx': '''
import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/chartappbar/ChartAppBar';
import { tagRemoteSource } from '@/channel/data/sources/TagRemoteSource';
import { TagEntity } from '@/channel/domain/entities/TagEntity';
import TagCard from '@/channel/widgets/TagCard';

export default function TagDiscoveryPage() {
  const { colors } = useTheme();
  const [tags, setTags] = useState<TagEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tagRemoteSource.getTags(0).then(setTags).finally(() => setIsLoading(false));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar title="Tags" />
      {isLoading
        ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        : <FlatList data={tags} keyExtractor={(t) => t.id} renderItem={({ item }) => <TagCard tag={item} />} />
      }
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
''',
}

# ── WIDGETS ───────────────────────────────────────────────────────────────
widgets_extra = {
  'widgets/ChannelListTile.tsx': '''
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import AppAvatar from '@/components/avatar/AppAvatar';
import { ChannelModel } from '@/channel/models/ChannelModel';

interface Props { channel: ChannelModel; onPress?: () => void; }

export default function ChannelListTile({ channel, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <AppAvatar imageUrl={channel.imageUrl} size={48} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{channel.title}</Text>
        <Text style={[styles.meta, { color: colors.text + '80' }]}>
          {channel.membersCount} members · {channel.momentsCount} moments
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
});
''',

  'widgets/ChannelFollowButton.tsx': '''
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useChannelEngagement } from '@/channel/hooks/useChannelEngagement';

interface Props { channelId: string; joinMethod?: string; }

export default function ChannelFollowButton({ channelId, joinMethod = 'open' }: Props) {
  const { colors } = useTheme();
  const { isFollowing, isLoading, followChannel, unfollowChannel, requestJoin } = useChannelEngagement(channelId);

  const handlePress = () => {
    if (isFollowing) unfollowChannel();
    else if (joinMethod === 'request') requestJoin();
    else followChannel();
  };

  if (isLoading) return <ActivityIndicator color={colors.primary} />;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: isFollowing ? 'transparent' : colors.primary, borderColor: colors.primary }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, { color: isFollowing ? colors.primary : '#fff' }]}>
        {isFollowing ? 'Following' : joinMethod === 'request' ? 'Request' : 'Follow'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  label: { fontSize: 13, fontWeight: '700' },
});
''',

  'widgets/ChannelSearchBar.tsx': '''
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Search } from 'lucide-react-native';

interface Props { value: string; onChangeText: (t: string) => void; placeholder?: string; }

export default function ChannelSearchBar({ value, onChangeText, placeholder = 'Search channels...' }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Search size={18} color={colors.text + '60'} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text + '60'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', margin: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  input: { flex: 1, marginLeft: 8, fontSize: 15 },
});
''',

  'widgets/ChannelName.tsx': '''
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface Props { name?: string; fontSize?: number; }

export default function ChannelName({ name, fontSize = 15 }: Props) {
  const { colors } = useTheme();
  return <Text style={[styles.text, { color: colors.text, fontSize }]} numberOfLines={1}>{name ?? ''}</Text>;
}

const styles = StyleSheet.create({ text: { fontWeight: '800' } });
''',

  'widgets/TagCard.tsx': '''
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { TagEntity } from '@/channel/domain/entities/TagEntity';

interface Props { tag: TagEntity; onPress?: () => void; }

export default function TagCard({ tag, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.hash, { color: colors.primary }]}>#</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>#{tag.name}</Text>
        <Text style={[styles.meta, { color: colors.text + '60' }]}>{tag.channelsCount} channels</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  hash: { fontSize: 22, fontWeight: '900' },
  info: { marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
});
''',
}

# ── WRITE ALL FILES ───────────────────────────────────────────────────────
all_files = {**models, **entities, **data_files, **hooks, **pages, **widgets_extra}

for rel_path, content in all_files.items():
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    if not os.path.exists(full_path):
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content.lstrip('\n'))
        print(f'Created: {full_path}')
    else:
        print(f'Skipped (exists): {full_path}')

print(f'\nDone! Created {sum(1 for p in all_files if not os.path.exists(os.path.join(BASE, p)))} new files.')
print(f'Total in spec: {len(all_files)} files')
