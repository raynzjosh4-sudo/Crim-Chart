import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
interface OfflineNoDataWidgetProps {
  onRetry?: () => void | Promise<void>;
}

export const OfflineNoDataWidget: React.FC<OfflineNoDataWidgetProps> = ({ onRetry }) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const theme = useCurrentTheme();
  const { startLoading, stopLoading } = useGlobalProgress();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    setIsRetrying(true);
    startLoading();
    try {
      await onRetry();
    } finally {
      stopLoading();
      setIsRetrying(false);
    }
  };

  const styles = useStyles(colors => ({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      width: '100%',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      width: '100%',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border || colors.surfaceVariant,
    },
    textContainer: {
      flex: 1,
      marginLeft: 12,
    },
    title: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      marginLeft: 12,
    },
    retryButtonText: {
      color: colors.onPrimary,
      fontWeight: 'bold',
      fontSize: 13,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <WifiOff size={24} color={theme.colors.text} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('offline.no_internet_title', 'Offline')}</Text>
          <Text style={styles.subtitle}>
            {t('offline.no_internet_subtitle', 'Check your connection')}
          </Text>
        </View>
        {onRetry && (
          <TouchableOpacity 
            style={[styles.retryButton, isRetrying && { opacity: 0.5 }]} 
            onPress={handleRetry} 
            activeOpacity={0.8}
            disabled={isRetrying}
          >
            <Text style={styles.retryButtonText}>
              {isRetrying ? t('offline.retrying', 'Retrying...') : t('offline.retry', 'Retry')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
