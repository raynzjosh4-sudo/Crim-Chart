import { StepProps } from '../signup.types';
import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';

import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, useWindowDimensions , Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDiscoveryChannels } from '@/features/feed/application/useDiscoveryChannels';
import ChannelFollowButton from '@/channel/widgets/ChannelFollowButton';
import { ShimmerEffect } from '@/channel/pages/widgets2/shimmer/ShimmerEffect';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
const SuggestionsShimmer = () => {
  return <View style={{
    flex: 1,
    paddingHorizontal: 20
  }}>
      <ShimmerEffect>
        {[1, 2, 3, 4, 5].map(key => <View key={key} style={styles.channelItem}>
            <View style={[styles.channelIcon, {
          backgroundColor: 'rgba(255,255,255,0.1)'
        }]} />
            <View style={styles.channelInfo}>
              <View style={{
            width: '60%',
            height: 16,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            marginBottom: 8
          }} />
              <View style={{
            width: '40%',
            height: 12,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 4
          }} />
            </View>
            <View style={{
          width: 80,
          height: 32,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 16
        }} />
          </View>)}
      </ShimmerEffect>
    </View>;
};
export default function ChannelSuggestionsPage({ onNext, onBack, onClose }: StepProps) {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: Platform.OS === 'web' ? 'transparent' : colors.background
    },
    desktopWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'transparent'
    },
    desktopModal: {
      width: '100%',
      maxWidth: 600,
      backgroundColor: colors.background,
      borderRadius: 16,
      paddingVertical: 40,
      borderWidth: 0,
      },
    flexOne: {
      flex: 1
    },
    content: {
      flex: 1
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      paddingHorizontal: 24,
      marginTop: 20
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 14,
      paddingHorizontal: 24,
      marginTop: 8
    },
    spacerMedium: {
      height: 16
    },
    listPadding: {
      paddingHorizontal: 24,
      paddingBottom: 100
    },
    channelItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      borderWidth: 0,
      },
    channelItemSelected: {
      backgroundColor: 'rgba(255, 179, 0, 0.05)',
      borderColor: colors.primary
    },
    channelIcon: {
      width: 56,
      height: 56,
      borderRadius: 28
    },
    channelInfo: {
      flex: 1,
      marginLeft: 16
    },
    channelName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold'
    },
    memberCount: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 12,
      marginTop: 4
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center'
    },
    checkboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 24,
      backgroundColor: Platform.OS === 'web' ? 'transparent' : colors.background
    },
    finishButton: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center'
    },
    finishButtonDisabled: {
      opacity: 0.5
    },
    finishButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: 'bold'
    },
    skipText: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 16,
      fontWeight: 'bold'
    }
  }));
  
  const {
    channels,
    isLoading,
    loadInitial
  } = useDiscoveryChannels();
  const [followCount, setFollowCount] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);
  const handleToggle = (isFollowing: boolean) => {
    setFollowCount(followCount + (isFollowing ? 1 : -1));
  };
  const handleFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    startLoading();
    await new Promise(resolve => setTimeout(resolve, 600));
    stopLoading();
    if (onFinish) onFinish();
    else onClose?.();
    setTimeout(() => setIsFinishing(false), 500);
  };
  return <SafeAreaView style={styles.container}>
      {!isDesktop && <ChartAppBar title="" showBorder actions={[<TouchableOpacity activeOpacity={1} key="skip" onPress={handleFinish} disabled={isFinishing}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>]} />}

      <View style={styles.flexOne}>
        <View style={styles.content}>
        <Text style={styles.title}>Channels for you</Text>
        <Text style={styles.subtitle}>
          Based on your interests, we think you'll love these channels. Select at least 3 to get started.
        </Text>

        <View style={styles.spacerMedium} />

        {isLoading ? <SuggestionsShimmer /> : <FlatList data={channels} keyExtractor={item => String(item.id)} contentContainerStyle={channels.length === 0 ? [styles.listPadding, {
          flex: 1
        }] : styles.listPadding} ListEmptyComponent={<View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 40
        }}>
                <Text style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 16
          }}>No channels available to follow right now.</Text>
              </View>} renderItem={({
          item
        }) => {
          return <View style={styles.channelItem}>
                  {item.profileImageUrl ? <Image source={{
              uri: item.profileImageUrl
            }} style={styles.channelIcon} /> : <View style={[styles.channelIcon, {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }]} />}
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{item.displayName}</Text>
                    <Text style={styles.memberCount} numberOfLines={1}>{item.bio || `@${item.username}`}</Text>
                  </View>
                  <ChannelFollowButton channelId={item.id} onToggle={handleToggle} />
                </View>;
        }} />}

        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={1} style={[styles.finishButton, followCount < 3 && styles.finishButtonDisabled]} onPress={handleFinish} disabled={followCount < 3 || isFinishing}>
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </SafeAreaView>;
}