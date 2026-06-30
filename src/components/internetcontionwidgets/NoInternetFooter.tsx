import { useThemeSettings } from '@/core/theme/theme_provider';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NoInternetFooterProps {
  isPaginating?: boolean;
  onRetry?: () => void;
}


export const NoInternetFooter: React.FC<NoInternetFooterProps> = ({ isPaginating, onRetry }) => {
  const netInfo = useNetInfo();
  const { colors } = useTheme();
  const { displayScale: scale } = useThemeSettings();

  // If internet connection state is currently unknown or true, just show the spinner if paginating
  if (netInfo.isConnected !== false) {
    if (!isPaginating) return null;
    return (
      <View style={[styles.container, { paddingVertical: 20 }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  // No internet
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={24 * scale} color={colors.textSecondary} style={{ marginBottom: 8 }} />
      <Text style={[styles.text, { color: colors.textSecondary, fontSize: 13 * scale }]}>
        No internet connection
      </Text>
      {onRetry && (
        <TouchableOpacity style={[styles.retryBtn, { borderColor: colors.border }]} onPress={onRetry}>
          <Text style={[styles.retryText, { color: colors.primary, fontSize: 14 * scale }]}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontWeight: '600',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  retryText: {
    fontWeight: 'bold',
  }
});
