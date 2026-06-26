import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import AppAvatar from '@/components/avatar/AppAvatar';
import { useAppTheme } from '@/core/theme/app_theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Music } from 'lucide-react-native';

export interface StatusCardProps {
  username: string;
  avatarUrl?: string | null;
  statusImageUrl?: string | null;
  isAudio?: boolean;
  onPress?: () => void;
  hasUnseen?: boolean;
  statusCount?: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  username,
  avatarUrl,
  statusImageUrl,
  isAudio = false,
  onPress,
  hasUnseen = true,
  statusCount = 1,
}) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <ImageBackground
        source={statusImageUrl ? { uri: statusImageUrl } : undefined}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        {!statusImageUrl && (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isAudio ? '#1a0a2e' : '#1A1A1A', borderRadius: 16 }]} />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFillObject}
          locations={[0, 0.3, 0.6, 1]}
        />

        {/* Music icon badge for audio statuses */}
        {isAudio && (
          <View style={styles.musicIconContainer}>
            <Music size={14} color="#FFF" />
          </View>
        )}
        
        <View style={styles.avatarContainer}>
          <View style={{ backgroundColor: '#000', borderRadius: 24, overflow: 'hidden' }}>
            <AppAvatar 
              imageUrl={avatarUrl} 
              size={36} 
              showStatusRing={true} 
              isStatusRead={!hasUnseen}
              statusSegmentCount={statusCount}
            />
          </View>
        </View>

        <Text style={styles.usernameText} numberOfLines={2}>
          {username}
        </Text>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    borderRadius: 16,
  },
  avatarContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent', // Default transparent, uses primary color if hasUnseen
  },
  usernameText: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 8,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    ...Platform.select({
      web: { textShadow: '0px 1px 3px rgba(0, 0, 0, 0.75)' } as any,
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
    }),
  },
  musicIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
