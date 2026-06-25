import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DesktopStatusGrid } from '@/components/UserStatusWidget/DesktopStatusGrid';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useSegments, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export const DesktopRightSidebar = () => {
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const segments = useSegments();
  const params = useLocalSearchParams();
  const user = useAuthStore(s => s.user);

  let targetUserId: string | undefined;
  if ((segments as string[]).includes('profile')) {
    if ((segments as string[]).includes('[id]')) {
      targetUserId = params.id as string;
    } else {
      targetUserId = user?.id;
    }
  }

  return (
    <View style={styles.container}>
      <DesktopStatusGrid isExpanded={true} targetUserId={targetUserId} />
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  container: {
    width: 350 * scale, // Wide enough for 3 columns of statuses
    borderLeftWidth: 1,
    borderLeftColor: colors.surfaceVariant,
    paddingTop: 16 * scale,
    backgroundColor: colors.background,
  },
});
