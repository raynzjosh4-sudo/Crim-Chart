import { useStyles } from '@/core/hooks/useStyles';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useNetInfo } from '@react-native-community/netinfo';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';

interface NoInternetFooterProps {
  isPaginating?: boolean;
  onRetry?: () => void | Promise<void>;
}


export const NoInternetFooter: React.FC<NoInternetFooterProps> = ({ isPaginating, onRetry }) => {
  const netInfo = useNetInfo();
  const { displayScale: scale } = useThemeSettings();
  const styles = useStyles(themeStyles);
  const { t } = useTranslation();
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

  // If internet connection state is currently unknown or true, just show the spinner if paginating
  if (netInfo.isConnected !== false) {
    if (!isPaginating) return null;
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="small" color={styles.spinner.color} />
      </View>
    );
  }

  // No internet
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: 15 * scale }]}>
        {t('offline.something_went_wrong', "Something went wrong. Try reloading.")}
      </Text>

      {onRetry && (
        <TouchableOpacity 
          style={[styles.retryBtn, isRetrying && { opacity: 0.5 }]} 
          onPress={handleRetry} 
          activeOpacity={0.8}
          disabled={isRetrying}
        >
          <Text style={[styles.retryText, { fontSize: 14 * scale }]}>
            {isRetrying ? t('offline.retrying', 'Retrying...') : t('offline.retry', 'Retry')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const themeStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  spinnerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  spinner: {
    color: colors.primary,
  },
  title: {
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  retryText: {
    fontWeight: '700',
    color: colors.onPrimary,
  }
});
