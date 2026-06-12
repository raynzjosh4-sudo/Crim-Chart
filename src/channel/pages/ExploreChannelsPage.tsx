import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExploreChannels } from '../hooks/useExploreChannels';
import ChannelListTile from '../widgets/ChannelListTile';
export const ExploreChannelsPage: React.FC = () => {
  const { colors } = useTheme() as any;
  const router = useRouter();

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
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 12,
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
    paddingHorizontal: 16,
  },
  channelTileWrapper: {
    paddingVertical: 4,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
