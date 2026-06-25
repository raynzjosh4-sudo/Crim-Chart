import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import AppAvatar from '@/components/avatar/AppAvatar';
import { useAppTheme } from '@/core/theme/app_theme';
import { LinearGradient } from 'expo-linear-gradient';

export interface StatusCardProps {
  username: string;
  avatarUrl?: string | null;
  statusImageUrl?: string | null;
  onPress?: () => void;
  hasUnseen?: boolean;
  statusCount?: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  username,
  avatarUrl,
  statusImageUrl,
  onPress,
  hasUnseen = true,
  statusCount = 1,
}) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <ImageBackground
        source={{ uri: statusImageUrl || 'https://via.placeholder.com/150' }}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFillObject}
          locations={[0, 0.3, 0.6, 1]}
        />
        
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
    width: 100,
    height: 160,
    borderRadius: 16,
    marginRight: 8,
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
