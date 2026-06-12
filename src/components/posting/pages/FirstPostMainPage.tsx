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

export const FirstPostMainPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetChannelId = params.targetChannelId as string;
  const isManifestoContext = params.isManifestoContext === 'true';

  const layout = useWindowDimensions();

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

  const handleNext = () => {
    router.push({
      pathname: '/finalize-post',
      params: { 
        ...(targetChannelId ? { targetChannelId } : {}),
        isManifestoContext: String(isManifestoContext),
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
                <TouchableOpacity key="next" onPress={handleNext}>
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
