import { useWindowDimensions, Platform, View, Text } from 'react-native';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useTranslation } from '@/core/localization/i18n';

export default function SettingsIndex() {
  const { width } = useWindowDimensions();
  const theme = useCurrentTheme();
  const { t } = useTranslation();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (isDesktop) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>Select a setting from the menu</Text>
      </View>
    );
  }

  return <SettingsPage />;
}
