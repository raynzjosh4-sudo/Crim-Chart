import React from 'react';
import { View, ScrollView } from 'react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { ShimmerEffect } from '@/channel/pages/widgets2/shimmer/ShimmerEffect';

export const ChannelPageShimmer = () => {
  const styles = useStyles((colors) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      height: 56,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconShimmer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    titleShimmer: {
      width: 120,
      height: 20,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    rightIcons: {
      flexDirection: 'row',
      gap: 16,
    },
    tabsShimmer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 12,
    },
    tabShimmer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    customWidgetShimmer: {
      flexDirection: 'row',
      padding: 16,
      alignItems: 'center',
    },
    avatarShimmer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    nameShimmer: {
      width: 100,
      height: 20,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      marginLeft: 12,
    },
    plusButtonShimmer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      marginLeft: 'auto',
    },
    menuButtonShimmer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      marginLeft: 12,
    },
    statusListShimmer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    addStatusShimmer: {
      width: 105,
      height: 180,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    statusCardShimmer: {
      width: 105,
      height: 180,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    feedPostShimmer: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    postHeaderShimmer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    postAvatarShimmer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    postNameShimmer: {
      width: 120,
      height: 16,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      marginLeft: 12,
    },
    postMediaShimmer: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    postFooterShimmer: {
      flexDirection: 'row',
      marginTop: 12,
      gap: 16,
    },
    postActionShimmer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  }));

  return (
    <View style={styles.container}>
      <ShimmerEffect duration={1500} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconShimmer} />
          <View style={styles.titleShimmer} />
          <View style={styles.rightIcons}>
            <View style={styles.iconShimmer} />
            <View style={styles.iconShimmer} />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsShimmer}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.tabShimmer} />
          ))}
        </View>

        <ScrollView scrollEnabled={false}>
          {/* Custom Channel Widget */}
          <View style={styles.customWidgetShimmer}>
            <View style={styles.avatarShimmer} />
            <View style={styles.nameShimmer} />
            <View style={styles.plusButtonShimmer} />
            <View style={styles.menuButtonShimmer} />
          </View>

          {/* Status Momments */}
          <View style={styles.statusListShimmer}>
            <View style={styles.addStatusShimmer} />
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.statusCardShimmer} />
            ))}
          </View>

          {/* Feed Posts */}
          {[1, 2].map((i) => (
            <View key={i} style={styles.feedPostShimmer}>
              <View style={styles.postHeaderShimmer}>
                <View style={styles.postAvatarShimmer} />
                <View style={styles.postNameShimmer} />
              </View>
              <View style={styles.postMediaShimmer} />
              <View style={styles.postFooterShimmer}>
                {[1, 2, 3, 4].map((j) => (
                  <View key={j} style={styles.postActionShimmer} />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </ShimmerEffect>
    </View>
  );
};
