import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface AvatarWithStatusProps {
  channelId?: string | null;
  currentChannelAvatar?: string | null;
  sourceChannelAvatar?: string | null;
  authorAvatar?: string | null;
}

export const AvatarWithStatus: React.FC<AvatarWithStatusProps> = ({
  channelId,
  currentChannelAvatar,
  sourceChannelAvatar,
  authorAvatar,
}) => {
  const imageUrl = currentChannelAvatar || sourceChannelAvatar || authorAvatar || 'https://via.placeholder.com/150';

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8}>
      <Image source={{ uri: imageUrl }} style={styles.avatar} />
      {/* TODO: Add status ring and moments badge when providers are ported */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8, // Dart code likely uses a rounded rect for channels
    backgroundColor: '#333',
  },
});
