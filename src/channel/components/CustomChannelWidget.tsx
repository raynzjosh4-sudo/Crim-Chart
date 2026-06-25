import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import UserAvatar from '@/components/avatar/UserAvatar';
import { Plus, Menu } from 'lucide-react-native';
import { ChannelRestrictionWrapper } from '@/components/wrappers/ChannelRestrictionWrapper';

interface CustomChannelWidgetProps {
  userId?: string;
  username: string;
  avatarUrl: string;
  isOnline?: boolean;
  onPlusPress?: () => void;
  onMorePress?: () => void;
  channelId?: string;
}

export const CustomChannelWidget: React.FC<CustomChannelWidgetProps> = ({
  userId,
  username,
  avatarUrl,
  isOnline = true,
  onPlusPress,
  onMorePress,
  channelId,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <UserAvatar
            userId={userId || ''}
            fallbackUrl={avatarUrl}
            name={username}
            size={40}
            forceOnline={isOnline}
          />
        </View>
        <Text style={styles.username}>{username}</Text>
      </View>
      
      <View style={styles.actions}>
        {channelId ? (
          <ChannelRestrictionWrapper channelId={channelId} requiredAction="post_feed" fallback={null}>
            <TouchableOpacity activeOpacity={1} style={styles.actionCircle} onPress={onPlusPress}>
              <Plus size={20} color="#FFF" />
            </TouchableOpacity>
          </ChannelRestrictionWrapper>
        ) : (
          <TouchableOpacity activeOpacity={1} style={styles.actionCircle} onPress={onPlusPress}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity activeOpacity={1} style={styles.actionCircle} onPress={onMorePress}>
          <Menu size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#000',
  },
  username: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
