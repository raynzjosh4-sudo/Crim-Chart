import { MediaData, MediaType } from '@/components/media/types';
import { colors } from '@/core/theme/colors';
import { Image as ExpoImage } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { Camera, Check } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface DeviceMediaTabProps {
  onMediaTap: (index: number, item: MediaData) => void;
  selectedIndices: number[];
}

interface AlbumItem {
  id: string;
  title: string;
  assetCount: number;
}

const PAGE_SIZE = 30;

export default function DeviceMediaTab({
  onMediaTap,
  selectedIndices,
}: DeviceMediaTabProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      setHasPermission(true);
      await loadAlbums();
    } else {
      setIsLoading(false);
    }
  };

  const loadAlbums = async () => {
    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
    const albumItems: AlbumItem[] = fetchedAlbums.map(a => ({
      id: a.id,
      title: a.title || 'Recent',
      assetCount: a.assetCount,
    }));

    // Also add a "Recents" catch-all
    const recents: AlbumItem = { id: 'recents', title: 'Recent', assetCount: 0 };
    const all = [recents, ...albumItems.filter(a => a.id !== 'recents')];
    setAlbums(all);
    setSelectedAlbumId('recents');
    await loadAssets('recents', undefined, true);
  };

  const loadAssets = useCallback(
    async (albumId: string, cursor?: string, reset = false) => {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params: MediaLibrary.AssetsOptions = {
        first: PAGE_SIZE,
        after: cursor,
        sortBy: MediaLibrary.SortBy.creationTime,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      };

      if (albumId !== 'recents') {
        params.album = albumId;
      }

      const page = await MediaLibrary.getAssetsAsync(params);

      setAssets(prev => (reset ? page.assets : [...prev, ...page.assets]));
      setEndCursor(page.endCursor);
      setHasNextPage(page.hasNextPage);
      setIsLoading(false);
      setIsLoadingMore(false);
    },
    []
  );

  const handleAlbumSelect = (albumId: string) => {
    if (albumId === selectedAlbumId) return;
    setSelectedAlbumId(albumId);
    setAssets([]);
    setEndCursor(undefined);
    setHasNextPage(true);
    loadAssets(albumId, undefined, true);
  };

  const handleEndReached = () => {
    if (!isLoadingMore && hasNextPage && selectedAlbumId) {
      loadAssets(selectedAlbumId, endCursor);
    }
  };

  const handleAssetTap = async (index: number, asset: MediaLibrary.Asset) => {
    const uri = asset.uri;
    const type = asset.mediaType === MediaLibrary.MediaType.video ? MediaType.video : MediaType.image;
    const aspectRatio = asset.width > 0 && asset.height > 0 ? asset.width / asset.height : 1;

    onMediaTap(1000 + index, {
      type,
      contentUrl: uri,
      aspectRatio,
    });
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'rgba(255,255,255,0.5)' }}>
          Please grant gallery access via Settings.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const NUM_COLUMNS = 3;

  return (
    <View style={styles.container}>
      {/* Album Selector */}
      {albums.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.albumList}
          style={styles.albumScroll}
        >
          {albums.map(album => {
            const isSelected = album.id === selectedAlbumId;
            return (
              <TouchableOpacity activeOpacity={1}
                key={album.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : 'rgba(255,255,255,0.08)',
                  },
                ]}
                onPress={() => handleAlbumSelect(album.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? colors.surface : colors.text, fontWeight: isSelected ? '800' : '600' },
                  ]}
                >
                  {album.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Media Grid */}
      <FlatList
        ref={flatListRef}
        data={assets}
        key={`grid-${selectedAlbumId}`}
        numColumns={NUM_COLUMNS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.gridContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>No media found.</Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const isSelected = selectedIndices.includes(1000 + index);
          return (
            <TouchableOpacity activeOpacity={1}
              style={[styles.gridItem, isSelected && { borderColor: colors.primary, borderWidth: 3 }]}
              onPress={() => handleAssetTap(index, item)}
              activeOpacity={0.8}
            >
              <ExpoImage
                source={{ uri: item.uri }}
                contentFit="cover"
                style={StyleSheet.absoluteFill}
              />
              {item.mediaType === MediaLibrary.MediaType.video && (
                <View style={styles.videoOverlay}>
                  <Camera color="white" size={18} />
                </View>
              )}
              {isSelected && (
                <View style={styles.selectedOverlay}>
                  <Check color="white" size={24} />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  albumScroll: { maxHeight: 50 },
  albumList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: { fontSize: 13 },
  gridContent: { padding: 16, gap: 8 },
  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
