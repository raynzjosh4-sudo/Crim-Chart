import { FollowUserButton } from '@/components/FollowUserButton';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { MusicListTile } from '@/features/boxes/components/music_posting/tiles/MusicListTile';
import { useDesktopVidsStore } from '@/mainFeed/pages/main_page_widgets/useDesktopVidsStore';
import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { Search } from 'lucide-react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMusicFeed } from './hooks/useMusicFeed';

export default function MyMusicPage() {
  const theme = useCurrentTheme();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { tracks, isLoading, isFetchingMore, fetchMore } = useMusicFeed(searchQuery);
  const setActiveVideo = useDesktopVidsStore(s => s.setActiveVideo);

  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      const activeItem = viewableItems[0].item;
      if (activeItem && activeItem.id) {
        setActiveTrackId(activeItem.id);
        useDesktopVidsStore.getState().setActiveVideo(activeItem.id, undefined, undefined);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
            placeholder="Search your music..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            selectionColor={theme.colors.primary}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={() => setSearchQuery(searchInput)}
            returnKeyType="search"
          />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {isLoading && tracks.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Loading music...</Text>
          </View>
        ) : tracks.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>No music found.</Text>
          </View>
        ) : (
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 16 }}
            onEndReached={fetchMore}
            onEndReachedThreshold={0.5}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            ListFooterComponent={
              isFetchingMore ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <View style={{ marginBottom: 24 }}>
                {/* Author Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={{ uri: item.owner?.avatarUrl || 'https://via.placeholder.com/40' }}
                      style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                    />
                    <View>
                      <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                        {item.owner?.name || 'Unknown Artist'}
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                        {item.owner?.crownTitle || 'Novice'}
                      </Text>
                    </View>
                  </View>
                  {item.owner?.id && (
                    <FollowUserButton
                      targetUserId={item.owner.id}
                      size="small"
                      style={{ flex: 0, height: 32, minWidth: 90, paddingHorizontal: 12 }}
                      textStyle={{ fontSize: 13 }}
                    />
                  )}
                </View>

                {/* Music Tile */}
                <PostInteractionWrapper
                  postId={item.id}
                  initialLikesCount={item.likesCount}
                  initialViewsCount={item.viewsCount}
                  sourceTable={item.sourceTable}
                >
                  {({ isLiked, likesCount, viewsCount }) => (
                    <MusicListTile
                      track={item}
                      hideHeader={true}
                      hideTagButton={true}
                      isCurrentlyPlaying={item.id === activeTrackId}
                      lyricsPreview={item.lyrics || "no lyrics"}
                      isLiked={isLiked}
                      likesCount={likesCount}
                      viewsCount={viewsCount}
                      onLikePress={() => useInteractionStore.getState().toggleLike(item.id, undefined, item.sourceTable)}
                    />
                  )}
                </PostInteractionWrapper>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    height: '100%',
  },
});
