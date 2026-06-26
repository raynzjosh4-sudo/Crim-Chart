import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TabView, TabBar } from 'react-native-tab-view';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { MediaItem } from '../models/MediaItem';
import { MediaChips } from '@/components/mediaChips/MediaChips';
import { PhotosTab } from '../tabs/PhotosTab';
import { VideosTab } from '../tabs/VideosTab';
import { MusicTab } from '../tabs/MusicTab';
import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { PermissionDialog } from '@/components/ui/PermissionDialog';
import * as MediaLibrary from 'expo-media-library';
import { Linking, AppState } from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';

export const FirstPostMainPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetChannelId = params.targetChannelId as string;
  const isManifestoContext = params.isManifestoContext === 'true';

  const isChannelPost = params.isChannelPost === 'true';
  const isChannelStatus = params.isChannelStatus === 'true';

  const layout = useWindowDimensions();

  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'photos', title: 'Photos' },
    { key: 'videos', title: 'Videos' },
    { key: 'music', title: 'Music' },
  ]);

  const [selectedItems, setSelectedItems] = useState<Record<string, MediaItem>>({});
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

  const handleNext = () => {
    router.push({
      pathname: '/finalize-post',
      params: { 
        ...(targetChannelId ? { targetChannelId } : {}),
        ...(params.channelName ? { channelName: params.channelName } : {}),
        ...(params.channelAvatarUrl ? { channelAvatarUrl: params.channelAvatarUrl } : {}),
        isManifestoContext: String(isManifestoContext),
        ...(isChannelPost ? { isChannelPost: 'true' } : {}),
        ...(isChannelStatus ? { isChannelStatus: 'true' } : {}),
        selectedMediaJson: JSON.stringify(Object.values(selectedItems))
      }
    });
  };

  const renderScene = ({ route }: { route: any }) => {
    switch (route.key) {
      case 'photos':
        return <PhotosTab selectedItems={selectedItems} onToggleSelection={toggleSelection} externalSelectedAlbum={selectedAlbum} />;
      case 'videos':
        return <VideosTab selectedItems={selectedItems} onToggleSelection={toggleSelection} externalSelectedAlbum={selectedAlbum} />;
      case 'music':
        return <MusicTab selectedItems={selectedItems} onToggleSelection={toggleSelection} externalSelectedAlbum={selectedAlbum} />;
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <View>
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: '#FACD11' }}
        style={{ backgroundColor: '#0D0D0D', elevation: 0, shadowOpacity: 0 }}
        labelStyle={{ fontWeight: 'bold' }}
        activeColor="#FACD11"
        inactiveColor="rgba(255,255,255,0.4)"
        scrollEnabled={true}
        tabStyle={{ width: 'auto', paddingHorizontal: 16 }}
      />
      <MediaChips
        activeTabIndex={index}
        selectedAlbum={selectedAlbum}
        onAlbumSelected={(album) => setSelectedAlbum(album)}
      />
    </View>
  );

  return (
    <View style={styles.root}>
      <ChartAppBar
        title="Recents"
        showBack={false}
        leading={<CrimchartBackButton onPress={() => router.back()} />}
        actions={
          Object.keys(selectedItems).length > 0
            ? [
                <TouchableOpacity activeOpacity={1} key="next" onPress={handleNext}>
                  <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>,
              ]
            : []
        }
      />
      
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
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  nextText: {
    color: '#FACD11',
    fontWeight: '900',
    fontSize: 16,
    marginRight: 16,
  }
});
