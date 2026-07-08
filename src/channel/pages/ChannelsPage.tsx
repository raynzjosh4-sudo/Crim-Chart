import { ChannelModel } from '@/channel/models/ChannelModel';
import ChannelListTile from '@/channel/widgets/ChannelListTile';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native';
import { ChannelListSkeleton } from '@/components/skeletons/Skeletons';

// Section Headers and Tab Widgets
import { ProfileMiniSheet } from '@/channel/widgets/bottom_sheets/ProfileMiniSheet';
import { ChannelSectionHeader } from '@/channel/widgets/sectionHeaders/ChannelSectionHeader';
import { ChannelStatusMoments } from '@/channel/widgets/sectionHeaders/ChannelStatusMoments';
import { InboxSectionHeader } from '@/channel/widgets/sectionHeaders/InboxSectionHeader';
import { ChannelFilterChips } from '@/features/profile/widgets/charters/ChannelFilterChips';
import { ChannelSearchBar } from '@/profile/channels/widgets/ChannelSearchBar';

import { useUserChannels } from '@/channel/hooks/useChannels';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useExploreStore } from '@/channel/store/useExploreStore';

import { useStyles } from '@/core/hooks/useStyles';
export default function ChannelsPage() {
  const styles = useStyles(colors => ({
    container: { flex: 1, backgroundColor: colors.background },
    headerContainer: { paddingBottom: 8 },
    footerContainer: { paddingTop: 16 },
    divider: { height: 1, backgroundColor: colors.muted, marginVertical: 8 },
    listContent: { paddingBottom: 40 },
    empty: { textAlign: 'center' as const, marginTop: 40, opacity: 0.5, color: colors.text },
  }));
  const router = useAppRouter();
  const user = useAuthStore(s => s.user);
  const { width } = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Channels');
  const [selectedChannel, setSelectedChannel] = useState<ChannelModel | null>(null);

  // --- UNIFIED CHANNEL ARCHITECTURE ---
  const { channels: ownedChannels, loadMore: loadOwned } = useUserChannels(user?.id || '', 'owned');
  const { channels: joinedChannels, loadMore: loadJoined } = useUserChannels(user?.id || '', 'joined');

  useEffect(() => {
    let isMounted = true;
    // Fire the initial loads
    if (user?.id) {
      Promise.all([
        loadOwned(true),
        loadJoined(true)
      ]).finally(() => {
        if (isMounted) setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
    return () => { isMounted = false; };
  }, [user?.id]);

  const displayedChannels = (() => {
    if (activeFilter === 'Private') return ownedChannels.map(c => c.channel);
    if (activeFilter === 'Public') return joinedChannels.map(c => c.channel);
    // 'Channels' filter shows both, but we should deduplicate
    const combined = [...ownedChannels.map(c => c.channel), ...joinedChannels.map(c => c.channel)];
    const unique = new Map<string, ChannelModel>();
    combined.forEach(c => unique.set(c.id, c));
    return Array.from(unique.values());
  })();

  const renderHeader = () => {
    if (activeFilter === 'Inbox') {
      return (
        <View style={styles.headerContainer}>
          <InboxSectionHeader threads={[]} />
          <View style={styles.divider} />
          <ChannelSectionHeader title="Messages" showAction={false} />
        </View>
      );
    }

    return (
      <View style={styles.headerContainer}>
        <ChannelSectionHeader title="Moments" showAction={false} />
        <ChannelStatusMoments displayedChannels={displayedChannels} />
        <View style={styles.divider} />
        <ChannelSectionHeader title="Channels" showAction={false} />
      </View>
    );
  };

  const renderFooter = () => {
    if (activeFilter === 'Inbox') return <View style={{ height: 40 }} />;

    return (
      <View style={styles.footerContainer}>
        <ChannelSectionHeader
          title="Find channels to follow"
          subtitle="Explore more channels to find new moments"
          showAction={true}
          actionText="Explore"
          onActionPressed={() => {
            if (Platform.OS === 'web' && width >= 768) {
              useExploreStore.getState().openExplore();
            } else {
              router.push('/channel/explore' as any);
            }
          }}
        />
        <View style={{ height: 40 }} />
      </View>
    );
  };

  if (isLoading) return (
    <View style={styles.container}>
      <ChartAppBar title="CHANNELS" showBack={false} titleStyle={{ fontWeight: '900', fontSize: 16, letterSpacing: 0.5 }} />
      <ChannelSearchBar onChanged={() => {}} />
      <ChannelFilterChips filters={['Channels', 'Private', 'Public']} activeFilter={activeFilter} onFilterChanged={setActiveFilter} />
      <ChannelListSkeleton count={8} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ChartAppBar
        title="CHANNELS"
        showBack={false}
        titleStyle={{ fontWeight: '900', fontSize: 16, letterSpacing: 0.5 }}
      />
      <ChannelSearchBar onChanged={(val) => console.log('Search:', val)} />
      <ChannelFilterChips
        filters={['Channels', 'Private', 'Public']}
        activeFilter={activeFilter}
        onFilterChanged={setActiveFilter}
      />
      <FlatList
        data={displayedChannels}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <ChannelListTile
            channel={item}
            showFollowButton={false}
            onPress={() => {
              if (Platform.OS === 'web' && width >= 768) {
                router.setParams({ desktopChannelId: item.id });
              } else {
                router.push({ pathname: '/channel/channelpage', params: { id: item.id } } as any);
              }
            }}
            onAvatarTap={(ch) => ch.momentsCount > 0 && setSelectedChannel(ch)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No channels yet</Text>}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
      <ProfileMiniSheet
        visible={selectedChannel !== null}
        onClose={() => setSelectedChannel(null)}
        channel={selectedChannel}
      />
    </View>
  );
}

