import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExploreChannels } from '../hooks/useExploreChannels';
import ChannelListTile from '../widgets/ChannelListTile';
import { CustomBackButton } from '@/components/CustomBackButton';
import { ChannelListSkeleton } from '@/components/skeletons/Skeletons';
export const ExploreChannelsPage: React.FC = () => {
  const { colors } = useTheme() as any;
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { backgroundColor: colors.background, borderRadius: isDesktop ? 16 : 0, overflow: 'hidden' }]}>

      {/* Header Row */}
      <View style={styles.headerContainer}>
        <CustomBackButton onPressed={() => router.back()} color={colors.text} />
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Search color={colors.text + '80'} size={20} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
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
              onPress={() => router.push({ pathname: '/channel/channelpage', params: { id: item.id } } as any)}
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
      <View style={styles.desktopOverlay}>
        <View style={styles.desktopModalContainer}>
          {content}
        </View>
      </View>
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
