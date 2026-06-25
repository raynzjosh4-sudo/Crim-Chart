import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Users } from 'lucide-react-native';
import { supabase } from '@/core/supabase/supabaseConfig'; // Adjust based on your Supabase client setup
import { useTheme } from '@react-navigation/native';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import AppAvatar from '@/components/avatar/AppAvatar';

interface InvitePostCardProps {
  author?: CrimChartUserModel;
  content: string;
  timeAgo: string;
  inviteChannelId?: string;
  inviteChannelName?: string;
  inviteChannelImage?: string;
  inviteChannelTitle?: string;
}

export const InvitePostCard: React.FC<InvitePostCardProps> = ({
  author,
  content,
  timeAgo,
  inviteChannelId,
  inviteChannelName,
  inviteChannelImage,
  inviteChannelTitle,
}) => {
  const { colors } = useTheme();
  const [resolvedChannelName, setResolvedChannelName] = useState<string | null>(null);
  const [resolvedChannelImage, setResolvedChannelImage] = useState<string | null>(null);
  const [resolvedChannelTitle, setResolvedChannelTitle] = useState<string | null>(null);
  const [isFetchingChannel, setIsFetchingChannel] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (inviteChannelId) {
      fetchChannelData();
    }
  }, [inviteChannelId]);

  const fetchChannelData = async () => {
    if (!inviteChannelId) return;

    setIsFetchingChannel(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('channels')
        .select('id, name, description, avatar_url')
        .eq('id', inviteChannelId)
        .maybeSingle();

      if (error) throw error;

      let memberStatus = false;
      if (user) {
        const { data: memberRow } = await supabase
          .from('channel_members')
          .select('user_id')
          .eq('channel_id', inviteChannelId)
          .eq('user_id', user.id)
          .maybeSingle();
        memberStatus = !!memberRow;
      }

      if (data) {
        setResolvedChannelName(data.name);
        setResolvedChannelImage(data.avatar_url);
        setResolvedChannelTitle(data.description);
      }
      setIsMember(memberStatus);
    } catch (e) {
      console.warn('⚠️ [InviteCard] Failed to fetch channel data:', e);
    } finally {
      setIsFetchingChannel(false);
    }
  };

  const joinChannel = async () => {
    if (!inviteChannelId || isMember || isJoining) return;

    setIsJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsJoining(false);
        return;
      }

      const { error } = await supabase.from('channel_members').upsert({
        channel_id: inviteChannelId,
        user_id: user.id,
        role: 'member',
      }, { onConflict: 'channel_id,user_id' });

      if (error) throw error;

      setIsMember(true);
      // Local cache skipped or handled via global state / React Query in real app
    } catch (e) {
      console.error('❌ [InviteCard] Join failed:', e);
    } finally {
      setIsJoining(false);
    }
  };

  const channelName = resolvedChannelName ?? inviteChannelName ?? 'Channel';
  const channelTitle = resolvedChannelTitle ?? inviteChannelTitle;
  const channelImage = resolvedChannelImage ?? inviteChannelImage;

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.header}>
        {author && (
          <AppAvatar size={30} imageUrl={author.profileImageUrl} />
        )}
        <Text style={[styles.authorName, { color: colors.text }]}>
          {author?.displayName || 'Unknown'}
        </Text>
      </View>
      
      <Text style={[styles.content, { color: colors.text }]}>{content}</Text>
      
      <View style={[styles.inviteBox, { backgroundColor: colors.card }]}>
        <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
          {!isFetchingChannel && (
            channelImage ? (
              <Image source={{ uri: channelImage }} style={styles.channelImage} contentFit="cover" />
            ) : (
              <Users size={24} color={colors.text} />
            )
          )}
        </View>
        <View style={styles.channelInfo}>
          <Text style={[styles.channelName, { color: colors.text }]} numberOfLines={1}>
            {channelName}
          </Text>
          {!!channelTitle && (
            <Text style={[styles.channelTitle, { color: colors.text }]} numberOfLines={1}>
              {channelTitle}
            </Text>
          )}
        </View>
        
        <TouchableOpacity activeOpacity={1}
          style={[
            styles.joinButton,
            { backgroundColor: isMember ? colors.card : colors.primary },
          ]}
          onPress={joinChannel}
          disabled={isMember || isJoining}
        >
          <Text style={[
            styles.joinText,
            { color: isMember ? colors.text : 'white' }
          ]}>
            {isMember ? 'JOINED' : 'JOIN'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  inviteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelImage: {
    width: '100%',
    height: '100%',
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 15,
    fontWeight: '800',
  },
  channelTitle: {
    fontSize: 12,
    opacity: 0.5,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 12,
  },
  joinText: {
    fontSize: 12,
    fontWeight: '900',
  },
});

