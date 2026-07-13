import { LocalMusicImages } from '@/assets_musicImages';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { OfflineStaleDataBanner, SlowConnectionBanner } from '@/components/offlineIndicators';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Search, Upload, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView as _GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GestureHandlerRootView = _GestureHandlerRootView as any;

export interface CoverArtSelectorSheetRef {
  present: (media: any) => void;
  dismiss: () => void;
}

interface CoverArtSelectorSheetProps {
  onSelectArtwork: (media: any, artworkUrl: string | null) => void;
}

interface ArtworkResult {
  id: string;
  url: string;
  source: 'itunes' | 'local' | 'upload';
  title?: string;
  artist?: string;
}

export const CoverArtSelectorSheet = React.forwardRef(({ onSelectArtwork }: CoverArtSelectorSheetProps, ref: React.ForwardedRef<CoverArtSelectorSheetRef>) => {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { startLoading, stopLoading } = useGlobalProgress();
  const theme = useCurrentTheme();

  const [currentMedia, setCurrentMedia] = useState<any>(null);
  const [artworks, setArtworks] = useState<ArtworkResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const snapPoints = useMemo(() => ['85%', '100%'], []);
  const styles = useStyles((colors, scale) => ({
    sheetBackground: {
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16 * scale,
      paddingBottom: 12 * scale,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      marginBottom: 8 * scale
    },
    title: {
      fontSize: 18 * scale,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14 * scale,
      color: colors.textSecondary,
      marginTop: 2 * scale,
    },
    grid: {
      paddingBottom: 40,
    },
    imageContainer: {
      flex: 1,
      aspectRatio: 1,
      margin: 8 * scale,
      borderRadius: 12 * scale,
      overflow: 'hidden',
      backgroundColor: colors.text + '0D', // ~5% opacity
    },
    image: {
      width: '100%',
      height: '100%',
    },
    uploadButton: {
      flex: 1,
      aspectRatio: 1,
      margin: 8 * scale,
      borderRadius: 12 * scale,
      borderWidth: 2 * scale,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.text + '05', // ~2% opacity
    },
    uploadText: {
      color: colors.primary,
      marginTop: 8 * scale,
      fontWeight: '600',
    },
    queriesContainer: {
      paddingHorizontal: 16 * scale,
      paddingBottom: 12 * scale,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8 * scale,
    },
    queryBadge: {
      paddingHorizontal: 12 * scale,
      paddingVertical: 6 * scale,
      backgroundColor: colors.text + '1A', // ~10% opacity
      borderRadius: 16 * scale,
    },
    queryText: {
      color: colors.text,
      fontSize: 12 * scale,
    },
    emptyText: {
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 40 * scale,
      fontSize: 16 * scale,
    }
  }));

  const parseFilename = (filename: string): string[] => {
    let clean = filename.replace(/\.(mp3|m4a|wav|ogg|flac|aac)$/i, '');
    const queries = new Set<string>();
    queries.add(clean.replace(/[-_]/g, ' ').trim());

    const parts = clean.split(/[-_]/);
    if (parts.length >= 2) {
      queries.add(parts[0].trim());
      queries.add(parts[1].trim());
    }

    return Array.from(queries).filter(q => q.length > 2 && !q.toLowerCase().includes('unknown'));
  };

  const fetchiTunesArt = async (queries: string[]) => {
    setIsSearching(true);
    let results: ArtworkResult[] = [];

    try {
      for (const query of queries) {
        if (!query) continue;
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
        const data = await response.json();

        if (data.results) {
          const newArt = data.results
            .filter((item: any) => item.artworkUrl100)
            .map((item: any) => ({
              id: `itunes-${item.trackId}`,
              url: item.artworkUrl100.replace('100x100bb', '600x600bb'),
              source: 'itunes',
              title: item.trackName,
              artist: item.artistName
            }));

          newArt.forEach((art: ArtworkResult) => {
            if (!results.some(r => r.id === art.id || r.url === art.url)) {
              results.push(art);
            }
          });
        }
      }
    } catch (e) {
      console.error("iTunes search failed:", e);
    } finally {
      setIsSearching(false);
      setArtworks(results);
    }
  };

  const handlePresent = useCallback(async (media: any) => {
    startLoading();
    setCurrentMedia(media);
    setArtworks([]);

    const queries = parseFilename(media.name || 'Unknown Audio');
    setSearchQueries(queries);

    // Enforce a minimum 400ms delay for premium UI transition
    const fetchPromise = fetchiTunesArt(queries);
    const delayPromise = new Promise(resolve => setTimeout(resolve, 400));

    await Promise.all([fetchPromise, delayPromise]);

    setVisible(true);
    stopLoading();
  }, [startLoading, stopLoading]);

  React.useImperativeHandle(ref, () => ({
    present: handlePresent,
    dismiss: () => setVisible(false),
  }));

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        startLoading();
        await new Promise(r => setTimeout(r, 300));
        stopLoading();
        setVisible(false);

        // If uploading manually, at least use the cleanest parsed filename
        const updatedMedia = { ...currentMedia };
        if (searchQueries.length > 0) {
          updatedMedia.name = searchQueries[0];
        }
        onSelectArtwork(updatedMedia, result.assets[0].uri);
      }
    } catch (e) {
      console.error("Image pick failed", e);
    }
  };

  const handleSelectArt = async (item: ArtworkResult) => {
    startLoading();
    await new Promise(r => setTimeout(r, 300));
    stopLoading();
    setVisible(false);

    // Inject the official iTunes title and artist!
    const updatedMedia = { ...currentMedia };
    if (item.source === 'itunes') {
      if (item.title) updatedMedia.name = item.title;
      if (item.artist) updatedMedia.artist = item.artist;
    } else {
      if (searchQueries.length > 0) {
        updatedMedia.name = searchQueries[0];
      }
    }

    onSelectArtwork(updatedMedia, item.url);
  };

  const handleClose = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={() => setVisible(false)}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} onPress={handleClose} />
          )}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={{ backgroundColor: theme.colors.text + '50' }}
          topInset={insets.top}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Select Cover Art</Text>
              <Text style={styles.subtitle} numberOfLines={1}>{currentMedia?.name}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
              <X color={styles.title.color} size={24} />
            </TouchableOpacity>
          </View>

          <OfflineStaleDataBanner />
          <SlowConnectionBanner />

          {searchQueries.length > 0 && (
            <View style={styles.queriesContainer}>
              <Search color={styles.title.color} size={16} opacity={0.5} />
              {searchQueries.map((q, i) => (
                <View key={`query-${i}`} style={styles.queryBadge}>
                  <Text style={styles.queryText}>{q}</Text>
                </View>
              ))}
            </View>
          )}

          {isSearching && artworks.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: styles.title.color, marginTop: 16, opacity: 0.7 }}>Searching artwork...</Text>
            </View>
          ) : (
            <BottomSheetFlatList
              data={[
                { id: 'upload-btn', url: '', source: 'upload' as const },
                ...artworks,
                ...LocalMusicImages.map((imgResource, idx) => ({ id: `local-${idx}`, url: imgResource, source: 'local' as const }))
              ]}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              numColumns={2}
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => {
                if (item.id === 'upload-btn') {
                  return (
                    <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage} activeOpacity={0.8}>
                      <Upload color={theme.colors.primary} size={32} />
                      <Text style={styles.uploadText}>Upload Image</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    style={styles.imageContainer}
                    activeOpacity={0.8}
                    onPress={() => handleSelectArt(item)}
                  >
                    <Image source={typeof item.url === 'string' ? { uri: item.url } : item.url} style={styles.image} contentFit="cover" transition={200} />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                !isSearching ? (
                  <Text style={styles.emptyText}>No artwork found. Try uploading one!</Text>
                ) : null
              }
            />
          )}
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
});
