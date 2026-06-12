import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/core/theme/colors';

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
}

export const MemberListItem: React.FC<MemberListItemProps> = ({
  id,
  name,
  profileImageUrl,
  subtitle,
  hasStatus,
  statusCount,
  showFollow = true,
  onAvatarTap,
  onFollowTap,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.avatarContainer, hasStatus && styles.statusRing]} 
        onPress={onAvatarTap}
        disabled={!onAvatarTap}
      >
        <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {showFollow && (
        <TouchableOpacity style={styles.followButton} onPress={onFollowTap}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#222',
  },
  statusRing: {
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 2,
  },
  followButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
