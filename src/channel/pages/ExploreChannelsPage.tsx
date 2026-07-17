import { useExploreStore } from '@/channel/store/useExploreStore';
import { CustomBackButton } from '@/components/CustomBackButton';
import { ChannelListSkeleton } from '@/components/skeletons/Skeletons';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExploreChannels } from '../hooks/useExploreChannels';
import ChannelListTile from '../widgets/ChannelListTile';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';

export const ExploreChannelsPage: React.FC<{ isModal?: boolean }> = ({ isModal }) => {
  const { colors } = useTheme() as any;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const closeExplore = useExploreStore(s => s.closeExplore);
  const { startLoading } = useGlobalProgress();

  const { channels, loadMore, isLoading, hasMore } = useExploreChannels();
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load
  useEffect(() => {
    loadMore(true);
  }, []);

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    loadMore(true, query);
  };

  const renderFooter = () => {
    if (!isLoading) return <View style={{ height: 40 }} />;
    return <ChannelListSkeleton count={4} />;
  };

  const { width } = useWindowDimensions();
  const isDesktop = width > 768 && Platform.OS === 'web';

  const content = (
    <View style={[styles.container, { backgroundColor: isDesktop ? colors.card : colors.background, borderRadius: isDesktop ? 16 : 0, overflow: 'hidden' }]}>

      {/* Header Row */}
      <View style={styles.headerContainer}>
        <CustomBackButton onPressed={() => isModal ? closeExplore() : router.back()} color={colors.text} />
        <View style={[styles.searchBox, { backgroundColor: isDesktop ? colors.background : colors.card }]}>
          <Search color={colors.text + '80'} size={20} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, outlineStyle: 'none' } as any]}
            placeholder="Search communities, topics..."
            placeholderTextColor={colors.text + '60'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Results List */}
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item, index }) => (
          <View style={styles.channelTileWrapper}>
            <ChannelListTile
              channel={item}
              onPress={() => {
                if (isModal) closeExplore();
                if (isDesktop) {
                  router.setParams({ desktopChannelId: item.id });
                } else {
                  startLoading();
                  setTimeout(() => {
                    router.push({ pathname: '/channel/channelpage', params: { id: item.id } } as any);
                  }, 100);
                }
              }}
              showFollowButton={true}
            />
          </View>
        )}
        onEndReached={() => {
          if (hasMore) {
            loadMore(false);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text + '80' }]}>
                No channels found
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );

  if (isDesktop) {
    return (
      <TouchableWithoutFeedback onPress={() => isModal && closeExplore()}>
        <View style={styles.desktopOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.desktopModalContainer}>
              {content}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return <SafeAreaView style={styles.container}>{content}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  listContainer: {
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  channelTileWrapper: {
    paddingVertical: 0,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  desktopOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopModalContainer: {
    width: 600,
    maxWidth: '90%',
    height: '80%',
    maxHeight: 800,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
