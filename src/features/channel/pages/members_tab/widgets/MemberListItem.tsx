import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/core/theme/colors';
import { FollowUserButton } from '@/components/FollowUserButton';
interface MemberListItemProps {
  id: string;
  name: string;
  profileImageUrl: string;
  subtitle: string;
  hasStatus?: boolean;
  statusCount?: number;
  showFollow?: boolean;
  onAvatarTap?: () => void;
  onFollowTap?: () => void;
  showChatToggle?: boolean;
  canChat?: boolean;
  onToggleChat?: () => void;
}
export const MemberListItem: React.FC<MemberListItemProps> = ({
  id,
  name,
  profileImageUrl,
  subtitle,
  hasStatus,
  statusCount,
  showFollow = true,
  showChatToggle = false,
  canChat = true,
  onAvatarTap,
  onFollowTap,
  onToggleChat
}) => {
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#222'
    },
    statusRing: {
      borderWidth: 2,
      borderColor: colors.primary,
      padding: 2
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: 22
    },
    info: {
      flex: 1,
      marginLeft: 12
    },
    name: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold'
    },
    subtitle: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 13,
      marginTop: 2
    },
    followButton: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20
    },
    followButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold'
    },
    chatToggleContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    chatToggleLabel: {
      color: colors.text,
      fontSize: 13,
      marginRight: 8
    }
  }));
  return <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} style={[styles.avatarContainer, hasStatus && styles.statusRing]} onPress={onAvatarTap} disabled={!onAvatarTap}>
        <Image source={{
        uri: profileImageUrl
      }} style={styles.avatar} />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {showChatToggle && <View style={styles.chatToggleContainer}>
          <Text style={styles.chatToggleLabel}>Chat</Text>
          <Switch value={canChat} onValueChange={onToggleChat} trackColor={{
        false: '#333',
        true: colors.primary + '66'
      }} thumbColor={canChat ? colors.primary : '#666'} />
        </View>}

      {showFollow && !showChatToggle && <FollowUserButton targetUserId={id} size="small" style={styles.followButton} textStyle={styles.followButtonText} />}
    </View>;
};