import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
interface CreateChannelButtonProps {
  onPress?: () => void;
  label?: string;
}

export const CreateChannelButton: React.FC<CreateChannelButtonProps> = ({
  onPress,
  label = 'Create Channel',
}) => {
  const router = useRouter();
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);

  const handlePress = () => {
    if (onPress) onPress();
    if (Platform.OS === 'web' && window.innerWidth >= 768) {
      router.setParams({ desktopChannelId: 'create' });
    } else {
      router.push('/channel/create');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.85}>
      <Plus color={theme.colors.onPrimary} size={18} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
    alignSelf: 'flex-start',
  },
  label: {
    color: colors.onPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
});
