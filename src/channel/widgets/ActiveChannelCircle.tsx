import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChannelAvatar } from '@/channel/pages/widgets2/memberimage/ChannelAvatar';
import AppAvatar from '@/components/avatar/AppAvatar';
import { colors as defaultColors } from '@/core/theme/colors';
import { useTheme } from '@react-navigation/native';

interface ActiveChannelCircleProps {
  imageUrl?: string | null;
  leaderAvatarUrl?: string | null;
  name: string;
  hasUpdate?: boolean;
  onTap?: () => void;
}

export const ActiveChannelCircle: React.FC<ActiveChannelCircleProps> = ({
  imageUrl,
  leaderAvatarUrl,
  name,
  hasUpdate = false,
  onTap,
}) => {
  const size = 72; // Increased from 62 for impact
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onTap}
      style={styles.container}
    >
      <View style={{ width: size, height: size }}>
        {leaderAvatarUrl ? (
          <ChannelAvatar
            imageUrl={imageUrl}
            leaderAvatarUrl={leaderAvatarUrl}
            size={size}
            isActive={hasUpdate}
          />
        ) : (
          <AppAvatar
            size={size}
            url={imageUrl}
            showStatusRing={hasUpdate}
            showActiveDot={hasUpdate}
          />
        )}
      </View>
      <View style={{ height: 8 }} />
      <Text
        style={[
          styles.nameText,
          {
            color: colors.text,
            fontWeight: hasUpdate ? '900' : '700',
            opacity: 0.8,
          },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 18,
    alignItems: 'center',
    width: 72, // Ensure text wraps or truncates within bounds
  },
  nameText: {
    fontSize: 12,
    color: '#FFF', // onSurface
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
