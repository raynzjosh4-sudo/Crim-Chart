import { PermissionDialog } from '@/components/ui/PermissionDialog';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image as ImageIcon, X, FileText } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Linking, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';
import { MediaItem } from '../models/MediaItem';
import { MusicTab } from '../tabs/MusicTab';
import { LocalMusicList } from '@/components/compose/LocalMusicList';
import { PhotosTab } from '../tabs/PhotosTab';
import { VideosTab } from '../tabs/VideosTab';
import { AlbumSelectorModal } from '../widgets/AlbumSelectorModal';
import { BottomPillTabs } from '../widgets/BottomPillTabs';
import { useCurrentTheme } from '@/core/store/useThemeStore';

export const FirstPostMainPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const targetChannelId = params.targetChannelId as string;
  const isManifestoContext = params.isManifestoContext === 'true';

  const isChannelPost = params.isChannelPost === 'true';
  const isChannelStatus = params.isChannelStatus === 'true';

  const layout = useWindowDimensions();
  const theme = useCurrentTheme();
  const colors = theme.colors;

  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { t } = useTranslation();

  const [index, setIndex] = useState(0);
  const routes = [
    { key: 'music', title: t('common.music', 'Music') },
    { key: 'photos', title: t('common.photos', 'Photos') },
    { key: 'videos', title: t('common.videos', 'Videos') },
  ];

  const [selectedItems, setSelectedItems] = useState<Record<string, MediaItem>>({});
  const selectedItemsRef = React.useRef(selectedItems);
  selectedItemsRef.current = selectedItems;

  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  const toggleSelection = useCallback((id: string, item: MediaItem) => {
    const newItems = { ...selectedItems };
    if (newItems[id]) {
      delete newItems[id];
    } else {
      newItems[id] = item;
    }
    setSelectedItems(newItems);
  }, [selectedItems]);

  const handleNext = () => {
    const mediaArray = Object.values(selectedItems);
    if (mediaArray.length === 0) return;

    const hasVideo = mediaArray.some(item => item.type === 'video');
    const nextRoute = hasVideo ? '/trim-video' : '/finalize-post';

    router.push({
      pathname: nextRoute,
      params: {
        ...(targetChannelId ? { targetChannelId } : {}),
        ...(params.channelName ? { channelName: params.channelName } : {}),
        ...(params.channelAvatarUrl ? { channelAvatarUrl: params.channelAvatarUrl } : {}),
        isManifestoContext: String(isManifestoContext),
        ...(isChannelPost ? { isChannelPost: 'true' } : {}),
        ...(isChannelStatus ? { isChannelStatus: 'true' } : {}),
        selectedMediaJson: JSON.stringify(mediaArray)
      }
    });
  };

  React.useEffect(() => {
    const checkPermissions = async () => {
      const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
      if (status !== 'granted') {
        if (canAskAgain) {
          const newStatus = await MediaLibrary.requestPermissionsAsync();
          if (newStatus.status !== 'granted') {
            setShowPermissionDialog(true);
          }
        } else {
          setShowPermissionDialog(true);
        }
      } else {
        setShowPermissionDialog(false);
      }
    };

    checkPermissions();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkPermissions();
      }
    });
    return () => sub.remove();
  }, []);

  const renderScene = ({ route }: { route: any }) => {
    switch (route.key) {
      case 'photos':
        return <PhotosTab selectedItems={selectedItems} onToggleSelection={toggleSelection} externalSelectedAlbum={selectedAlbum} />;
      case 'videos':
        return <VideosTab selectedItems={selectedItems} onToggleSelection={toggleSelection} externalSelectedAlbum={selectedAlbum} />;
      case 'music':
        return (
          <LocalMusicList 
            onSelect={(media) => {
              router.push({
                pathname: '/add-post',
                params: {
                  initialAudio: JSON.stringify(media),
                  ...(targetChannelId ? { targetChannelId } : {}),
                  ...(params.channelName ? { channelName: params.channelName } : {}),
                  ...(params.channelAvatarUrl ? { channelAvatarUrl: params.channelAvatarUrl } : {}),
                  isManifestoContext: String(isManifestoContext),
                  ...(isChannelPost ? { isChannelPost: 'true' } : {}),
                  ...(isChannelStatus ? { isChannelStatus: 'true' } : {})
                }
              });
            }} 
          />
        );
      default:
        return null;
    }
  };

  const renderTabBar = () => null; // Hide the default TabBar

  return (
    <View style={[styles.root, { paddingBottom: Math.max(48, insets.bottom), backgroundColor: '#000000' }]}>
      <View style={{ flex: 1, backgroundColor: '#0D0D0D' }}>
        {/* Custom Header - YouTube Style */}
        <View style={{ paddingTop: Math.max(16, insets.top), backgroundColor: '#000000', paddingHorizontal: 16 }}>
          {/* Top Row: Close Button & Next Button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>

            {Object.keys(selectedItems).length > 0 && (
              <TouchableOpacity style={styles.nextButtonContainer} onPress={handleNext}>
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Second Row: Album Selector & Drafts Button */}
          <View style={{ paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <AlbumSelectorModal
                activeTabKey={routes[index].key}
                selectedAlbum={selectedAlbum}
                onAlbumSelected={(album) => setSelectedAlbum(album)}
              />
            </View>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: '3%', paddingVertical: '2%', borderRadius: 20 }}
              onPress={() => router.push('/drafts')}
            >
              <FileText color={colors.primary} size={16} />
              <Text style={{ color: colors.primary, marginLeft: '4%', fontWeight: '600' }}>Drafts</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={(newIndex) => {
            setIndex(newIndex);
            setSelectedAlbum(null); // Reset album on tab change
          }}
          initialLayout={{ width: layout.width }}
          style={{ flex: 1 }}
        />

        {/* Floating Bottom Pill Tabs */}
        <BottomPillTabs
          tabs={routes}
          activeIndex={index}
          onChange={(newIndex) => {
            setIndex(newIndex);
            setSelectedAlbum(null);
          }}
        />

        <PermissionDialog
          visible={showPermissionDialog}
          title="Media Access Needed"
          description="CrimChart needs access to your media library to let you select photos, videos, and music for your posts."
          icon={<ImageIcon color="#FACD11" size={24} />}
          confirmText="Open Settings"
          cancelText="Go Back"
          onConfirm={() => {
            Linking.openSettings();
          }}
          onCancel={() => {
            setShowPermissionDialog(false);
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  closeButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  albumSelectorContainer: {
    flex: 1,
    alignItems: 'center',
  },
  nextButtonContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  nextText: {
    color: '#FACD11',
    fontWeight: '900',
    fontSize: 16,
  }
});
