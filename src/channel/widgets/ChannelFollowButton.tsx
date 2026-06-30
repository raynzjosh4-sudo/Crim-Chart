import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useChannelEngagement } from '@/channel/hooks/useChannelEngagement';

interface Props { channelId: string; joinMethod?: string; onToggle?: (isFollowing: boolean) => void; }

export default function ChannelFollowButton({ channelId, joinMethod = 'open', onToggle }: Props) {
  const { colors } = useTheme();
  const { isFollowing, isLoading, followChannel, unfollowChannel, requestJoin } = useChannelEngagement(channelId);

  const handlePress = async () => {
    if (isFollowing) {
      await unfollowChannel();
      if (onToggle) onToggle(false);
    } else if (joinMethod === 'request') {
      await requestJoin();
    } else {
      await followChannel();
      if (onToggle) onToggle(true);
    }
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
