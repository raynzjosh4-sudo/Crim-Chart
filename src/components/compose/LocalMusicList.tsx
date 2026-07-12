import { useStyles } from "@/core/hooks/useStyles";
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AudioPreviewWidget } from './AudioPreviewWidget';
import { MusicListShimmer } from './MusicListShimmer';
import { Music } from 'lucide-react-native';
import { CoverArtSelectorSheet, CoverArtSelectorSheetRef } from './CoverArtSelectorSheet';
import { useRef } from 'react';

interface LocalMusicListProps {
  onSelect: (media: any) => void;
  selectedId?: string;
  /** Pre-fetched assets supplied by the parent (skips internal fetch when provided). */
  prefetchedAssets?: MediaLibrary.Asset[];
}
export const LocalMusicList: React.FC<LocalMusicListProps> = ({
  onSelect,
  selectedId,
  prefetchedAssets
}) => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      minHeight: 300,
      marginTop: 16
    },
    itemContainer: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 8
    },
    simpleItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    songTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    songArtist: {
      color: colors.textSecondary || 'rgba(255,255,255,0.6)',
      fontSize: 14,
    }
  }));
  const theme = useCurrentTheme();
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>(prefetchedAssets ?? []);
  const [loading, setLoading] = useState(!prefetchedAssets);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const coverArtSheetRef = useRef<CoverArtSelectorSheetRef | null>(null);

  useEffect(() => {
    // If the parent already pre-fetched, skip internal fetch
    if (prefetchedAssets) return;
    fetchAudio();
  }, [permissionResponse, prefetchedAssets]);
  const fetchAudio = async () => {
    if (!permissionResponse) {
      const result = await requestPermission();
      if (!result.granted) {
        setLoading(false);
        return;
      }
    } else if (!permissionResponse.granted) {
      setLoading(false);
      return;
    }
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 100,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]]
      });
      setAssets(media.assets);
    } catch (e) {
      console.error('Error fetching media:', e);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <MusicListShimmer count={6} />;
  }
  if (!prefetchedAssets && !permissionResponse?.granted) {
    return <View style={[styles.container, {
      justifyContent: 'center',
      alignItems: 'center'
    }]}>
        <Text style={{
        color: theme.colors.text
      }}>Permission needed to access local music.</Text>
        <TouchableOpacity style={{
        marginTop: 12,
        padding: 12,
        backgroundColor: theme.colors.primary,
        borderRadius: 8
      }} onPress={() => requestPermission()}>
          <Text style={{
          color: theme.colors.background,
          fontWeight: 'bold'
        }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>;
  }
  return <View style={styles.container}>
      <FlatList data={assets} keyExtractor={item => item.id} contentContainerStyle={{
      paddingBottom: 40
    }}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.simpleItemContainer}
          activeOpacity={0.8}
          onPress={() => {
            coverArtSheetRef.current?.present({
              id: item.id,
              uri: item.uri,
              name: item.filename,
              artist: 'Unknown Artist',
              lyrics: '',
              thumbnailUri: null
            });
          }}
        >
          <View style={styles.iconContainer}>
            <Music color={theme.colors.primary} size={24} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.songTitle} numberOfLines={1}>{item.filename}</Text>
            <Text style={styles.songArtist} numberOfLines={1}>Unknown Artist</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<View style={{
        padding: 20,
        alignItems: 'center'
      }}>
            <Text style={{
        color: theme.colors.text + '80'
      }}>No audio files found on device.</Text>
          </View>} />
          
      <CoverArtSelectorSheet 
        ref={coverArtSheetRef} 
        onSelectArtwork={(media, artworkUrl) => {
          onSelect({
            ...media,
            thumbnail: artworkUrl
          });
        }}
      />
    </View>;
};