import { useStyles } from '@/core/hooks/useStyles';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { ChevronDown, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlbumDropdownPopover } from './AlbumDropdownPopover';

export interface AlbumData {
  id: string;
  title: string;
  assetCount: number;
  thumbnailUrl?: string;
}

interface AlbumSelectorModalProps {
  activeTabIndex: number; // 0 = photos, 1 = videos, 2 = music
  selectedAlbum: string | null;
  onAlbumSelected: (albumId: string | null) => void;
}

export const AlbumSelectorModal: React.FC<AlbumSelectorModalProps> = ({
  activeTabIndex,
  selectedAlbum,
  onAlbumSelected
}) => {
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isPopoverVisible, setPopoverVisible] = useState(false);
  const { t } = useTranslation();

  const styles = useStyles((colors, scale) => ({
    triggerButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    triggerText: {
      color: colors.text,
      fontSize: 16 * scale,
      fontWeight: 'bold',
      marginRight: 4 * scale,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16 * scale,
      paddingVertical: 16 * scale,
      borderBottomWidth: 1 * scale,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18 * scale,
      fontWeight: 'bold',
      marginLeft: 16 * scale,
    },
    closeButton: {
      padding: 4 * scale,
    },
    albumItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16 * scale,
      paddingVertical: 12 * scale,
    },
    albumThumbnailPlaceholder: {
      width: 64 * scale,
      height: 64 * scale,
      borderRadius: 4 * scale,
      backgroundColor: colors.surface,
      marginRight: 16 * scale,
      overflow: 'hidden',
    },
    albumInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    albumTitle: {
      color: colors.text,
      fontSize: 16 * scale,
      fontWeight: '600',
    },
    albumCount: {
      color: colors.textSecondary,
      fontSize: 14 * scale,
      marginTop: 4 * scale,
    },
  }));

  // Fetch albums and filter by media type
  useEffect(() => {
    const fetchAlbums = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;

      const mediaType = activeTabIndex === 1
        ? MediaLibrary.MediaType.video
        : activeTabIndex === 2
          ? MediaLibrary.MediaType.audio
          : MediaLibrary.MediaType.photo;

      const fetchedAlbums = await MediaLibrary.getAlbumsAsync();
      const filteredAlbums: AlbumData[] = [];

      try {
        const recentsPage = await MediaLibrary.getAssetsAsync({ mediaType, first: 1 });
        const recentsThumbnail = recentsPage.assets.length > 0 ? recentsPage.assets[0].uri : undefined;

        filteredAlbums.push({
          id: 'all',
          title: t('common.recents', 'Recents'),
          assetCount: recentsPage.totalCount || 0,
          thumbnailUrl: recentsThumbnail,
        });
      } catch (e) {
        console.error("Failed to load recents assets", e);
        filteredAlbums.push({ id: 'all', title: t('common.recents', 'Recents'), assetCount: 0 });
      }

      for (const a of fetchedAlbums) {
        try {
          const page = await MediaLibrary.getAssetsAsync({ album: a.id, mediaType, first: 1 });
          if (page.assets && page.assets.length > 0) {
            filteredAlbums.push({
              id: a.id,
              title: a.title,
              assetCount: page.totalCount,
              thumbnailUrl: page.assets[0].uri,
            });
          }
        } catch (e) {
          // Ignore failing albums
        }
      }
      setAlbums(filteredAlbums);
    };
    fetchAlbums();
  }, [t, activeTabIndex]);

  const currentAlbumName = selectedAlbum
    ? albums.find((a) => a.id === selectedAlbum)?.title || t('common.recents', 'Recents')
    : t('common.recents', 'Recents');

  const handleSelect = (id: string) => {
    onAlbumSelected(id === 'all' ? null : id);
    setModalVisible(false);
  };

  const renderAlbumItem = ({ item }: { item: AlbumData }) => {
    return (
      <TouchableOpacity
        style={styles.albumItem}
        activeOpacity={0.7}
        onPress={() => handleSelect(item.id)}
      >
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.albumThumbnailPlaceholder} contentFit="cover" />
        ) : (
          <View style={styles.albumThumbnailPlaceholder} />
        )}
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle}>{item.title}</Text>
          {item.id !== 'all' && (
            <Text style={styles.albumCount}>{item.assetCount}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.triggerButton}
        activeOpacity={0.8}
        onPress={() => setPopoverVisible(true)}
      >
        <Text style={styles.triggerText}>{currentAlbumName}</Text>
        <ChevronDown color={styles.triggerText.color} size={16 * styles.triggerText.fontSize / 16} />
      </TouchableOpacity>

      <AlbumDropdownPopover
        visible={isPopoverVisible}
        onClose={() => setPopoverVisible(false)}
        activeTabIndex={activeTabIndex}
        isRecentsSelected={selectedAlbum === null}
        onSelectRecents={() => {
          setPopoverVisible(false);
          onAlbumSelected(null);
        }}
        onSelectAllAlbums={() => {
          setPopoverVisible(false);
          setModalVisible(true);
        }}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={false} onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <X color={styles.headerTitle.color} size={24 * styles.triggerText.fontSize / 16} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('posting.selectAlbum', 'Select Album')}</Text>
          </View>

          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            renderItem={renderAlbumItem}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};
