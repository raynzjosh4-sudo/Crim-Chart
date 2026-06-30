import React, { useState, useEffect } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { useTheme } from '@react-navigation/native';
import { Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

// Using relative paths to the assets directory
const NO_INTERNET_IMG = require('../../../assets/offline/no-internet.webp');
const SLOW_CONNECTION_IMG = require('../../../assets/offline/slowconnection.png');

interface OfflineStateWidgetProps {
  onRetry?: () => void;
  // Optional override to force a specific state, useful if a network request times out
  // despite the OS reporting that there is an active connection.
  overrideState?: 'offline' | 'slow' | 'online';
}

export const OfflineStateWidget: React.FC<OfflineStateWidgetProps> = ({ onRetry, overrideState }) => {
  const netInfo = useNetInfo();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { colors } = useTheme();
  const { t } = useTranslation();
  
  const [dismissed, setDismissed] = useState(false);

  // Determine network state
  let currentState = 'online';

  if (overrideState) {
    currentState = overrideState;
  } else {
    // Determine from NetInfo
    if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
      currentState = 'offline';
    } else if (
      netInfo.type === 'cellular' &&
      (netInfo.details?.cellularGeneration === '2g' || netInfo.details?.cellularGeneration === '3g')
    ) {
      currentState = 'slow';
    } else if (Platform.OS === 'web' && typeof window !== 'undefined' && 'connection' in navigator) {
      // @ts-ignore
      const effectiveType = navigator.connection.effectiveType;
      if (effectiveType === '2g' || effectiveType === '3g' || effectiveType === 'slow-2g') {
        currentState = 'slow';
      }
    }
  }

  useEffect(() => {
    setDismissed(false);
  }, [currentState]);

  if (currentState === 'online' || dismissed) {
    return null;
  }

  const isOffline = currentState === 'offline';
  const imgSrc = isOffline ? NO_INTERNET_IMG : SLOW_CONNECTION_IMG;
  const title = isOffline 
    ? t('offline.no_internet_title', 'No Internet Connection') 
    : t('offline.slow_connection_title', 'Slow Connection');
  const subtitle = isOffline
    ? t('offline.no_internet_subtitle', "It looks like you're offline. Please check your network connection and try again.")
    : t('offline.slow_connection_subtitle', "Your internet connection seems to be slow. Some content may take longer to load or fail.");

  return (
    <Modal transparent={true} visible={true} animationType="fade">
      <View 
        style={[styles.container, isDesktop ? styles.containerDesktop : { backgroundColor: colors.background }]}
        pointerEvents={isDesktop ? "box-none" : "auto"}
      >
        <View style={[styles.card, isDesktop && styles.cardDesktop, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {!isOffline && (
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setDismissed(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X color={colors.text} size={20} />
            </TouchableOpacity>
          )}
          <Image source={imgSrc} style={[styles.image, isDesktop && styles.imageDesktop]} resizeMode="contain" />
          
          {isDesktop ? (
            <View style={styles.contentDesktop}>
              <Text style={[styles.title, styles.titleDesktop, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.subtitle, styles.subtitleDesktop, { color: 'rgba(255,255,255,0.6)' }]}>{subtitle}</Text>
              {onRetry && (
                <TouchableOpacity style={[styles.retryButton, styles.retryButtonDesktop]} onPress={onRetry} activeOpacity={0.8}>
                  <Text style={[styles.retryButtonText, styles.retryButtonTextDesktop]}>{t('offline.retry', 'Retry')}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.6)' }]}>{subtitle}</Text>
              {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
                  <Text style={styles.retryButtonText}>{t('offline.retry', 'Retry')}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  containerDesktop: {
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 24,
  },
  card: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    width: '100%',
  },
  cardDesktop: {
    flexDirection: 'row',
    maxWidth: 400,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 150,
    marginBottom: 24,
  },
  imageDesktop: {
    width: 48,
    height: 48,
    marginBottom: 0,
    marginRight: 16,
  },
  contentDesktop: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleDesktop: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  subtitleDesktop: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'left',
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#ffd60a', 
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonDesktop: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  retryButtonTextDesktop: {
    fontSize: 12,
  },
});
