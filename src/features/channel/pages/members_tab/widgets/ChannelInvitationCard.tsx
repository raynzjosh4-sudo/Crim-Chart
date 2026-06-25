import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface ChannelInvitationCardProps {
  channelName?: string;
  onTap: () => void;
}

export const ChannelInvitationCard: React.FC<ChannelInvitationCardProps> = ({
  channelName,
  onTap,
}) => {
  return (
    <TouchableOpacity activeOpacity={1} style={styles.container} onPress={onTap}>
      <View style={styles.iconContainer}>
        <Share2 size={24} color={colors.primary} />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.title}>Invite your friends</Text>
        <Text style={styles.subtitle}>
          Invite others to join {channelName || 'this channel'} and grow the community.
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 184, 0, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.1)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 4,
  },
});
