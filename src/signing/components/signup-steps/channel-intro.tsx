import { StepProps } from '../signup.types';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';

import { Hash, Plus, CheckCircle } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions , Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';
import { useUserChannels } from '@/channel/hooks/useChannels';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChannelAvatarImage } from '@/channel/components/channelavatarimage/ChannelAvatarImage';

export default function ChannelIntroPage({ onNext, onBack, onClose }: StepProps) {
  
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { startLoading, stopLoading } = useGlobalProgress();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { user } = useAuthStore();
  const { channels, loadMore, isLoading: isChannelsLoading } = useUserChannels(user?.id || '', 'owned');

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadMore(true);
      }
    }, [user?.id, loadMore])
  );

  const hasChannel = channels.length > 0;

  const handleNext = async () => {
    if (isLoading) return;
    setIsLoading(true);
    startLoading();
    await new Promise(resolve => setTimeout(resolve, 600));
    stopLoading();
    onNext('channel-suggestions');
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleCreateChannel = async () => {
    if (isLoading) return;
    setIsLoading(true);
    startLoading();
    await new Promise(resolve => setTimeout(resolve, 600));
    stopLoading();
    onClose?.();
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isDesktop && (
        <ChartAppBar
          title=""
          showBorder={false}
          isLoading={isLoading}
          actions={[
            !hasChannel ? (
              <TouchableOpacity activeOpacity={1}
                key="skip"
                onPress={handleNext}
                disabled={isLoading}
              >
                <Text style={styles.skipText}>{t('skip' as any) || 'Skip'}</Text>
              </TouchableOpacity>
            ) : null
          ]}
        />
      )}

      <View style={styles.flexOne}>
        <View style={styles.content}>
          
          {hasChannel ? (
            <>
              <View style={styles.successIconCircle}>
                <CheckCircle size={40} color="#000" />
              </View>
              
              <View style={styles.spacerLarge} />
              
              <Text style={[styles.title, isDesktop && { textAlign: 'center', marginBottom: 12, fontSize: 28 }]}>You're all set!</Text>
              <Text style={styles.subtitle}>
                You have successfully created your first channel.
              </Text>

              <View style={styles.spacerLarge} />
              
              <View style={styles.channelPreviewCard}>
                <ChannelAvatarImage 
                  imageUrl={channels[0].channel.imageUrl}
                  name={channels[0].channel.title}
                  size={80}
                  showStatusRing={false}
                />
                <Text style={styles.channelPreviewTitle} numberOfLines={1}>{channels[0].channel.title}</Text>
                <Text style={styles.channelPreviewSubtitle} numberOfLines={2}>
                  {channels[0].channel.description || 'No description provided'}
                </Text>
              </View>

              <View style={styles.spacerExtraLarge} />

              <TouchableOpacity activeOpacity={1}
                style={styles.nextButton}
                onPress={handleNext}
                disabled={isLoading}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.iconCircle}>
                <Hash size={64} color={colors.primary} />
              </View>

              <View style={styles.spacerLarge} />

              <Text style={[styles.title, isDesktop && { textAlign: 'center', marginBottom: 12, fontSize: 28 }]}>Create your first channel</Text>
              <Text style={styles.subtitle}>
                Channels are where the magic happens. Build a community, share content, and connect with your audience.
              </Text>

              <View style={styles.spacerExtraLarge} />

              <TouchableOpacity activeOpacity={1}
                style={styles.nextButton}
                onPress={handleCreateChannel}
                disabled={isLoading}
              >
                <Plus size={20} color="#000" />
                <Text style={styles.nextButtonText}>Create your first channel</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={1}
                style={styles.laterButton}
                onPress={handleNext}
                disabled={isLoading}
              >
                <Text style={styles.laterButtonText}>I'll do this later</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'transparent' : colors.background,
  },
  desktopWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  desktopModal: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 40,
    borderWidth: 0,
      },
  flexOne: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  channelPreviewCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 24,
    borderRadius: 24,
    width: '100%',
    borderWidth: 0,
      },
  channelPreviewTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  channelPreviewSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  spacerLarge: {
    height: 32,
  },
  spacerExtraLarge: {
    height: 60,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 56,
    width: '100%',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  laterButton: {
    marginTop: 16,
    padding: 8,
  },
  laterButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

