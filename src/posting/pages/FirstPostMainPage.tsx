import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Dimensions, SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Camera, Check } from 'lucide-react-native';
import { Image as ExpoImage } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { colors } from '@/core/theme/colors';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import { MediaData, MediaType } from '@/components/media/types';

const PAGE_SIZE = 30;

export function FirstPostMainPage() {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const { tr } = useLocalization();

  const isManifestoContext = route.params?.isManifestoContext;
  const onMediaSelected = route.params?.onMediaSelected;

  const [activeTab, setActiveTab] = useState('photos' as 'photos' | 'videos');
  const [hasPermission, setHasPermission] = useState(false);
  const [assets, setAssets] = useState([] as MediaLibrary.Asset[]);
  const [selectedItems, setSelectedItems] = useState(new Map<string, MediaData>());

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      setAssets([]);
      setEndCursor(undefined);
      setHasNextPage(true);
      loadAssets(undefined, true);
    }
  }, [activeTab, hasPermission]);

  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      setHasPermission(true);
    } else {
      setIsLoading(false);
    }
  };

  const loadAssets = useCallback(
    async (cursor?: string, reset = false) => {
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);

      const params: MediaLibrary.AssetsOptions = {
        first: PAGE_SIZE,
        after: cursor,
        sortBy: MediaLibrary.SortBy.creationTime,
        mediaType: activeTab === 'photos' ? [MediaLibrary.MediaType.photo] : [MediaLibrary.MediaType.video],
      };

      const page = await MediaLibrary.getAssetsAsync(params);

      setAssets(reset ? page.assets : [...assets, ...page.assets]);
      setEndCursor(page.endCursor);
      setHasNextPage(page.hasNextPage);
      setIsLoading(false);
      setIsLoadingMore(false);
    },
    [activeTab, assets]
  );

  const handleEndReached = () => {
    if (!isLoadingMore && hasNextPage) {
      loadAssets(endCursor);
    }
  };

  const toggleSelection = (asset: MediaLibrary.Asset) => {
    const uri = asset.uri;
    const type = asset.mediaType === MediaLibrary.MediaType.video ? MediaType.video : MediaType.image;
    const aspectRatio = asset.width > 0 && asset.height > 0 ? asset.width / asset.height : 1;

    const newSelected = new Map(selectedItems);
    if (newSelected.has(asset.id)) {
      newSelected.delete(asset.id);
    } else {
      newSelected.set(asset.id, {
        type,
        contentUrl: uri,
        aspectRatio,
      });
    }
    setSelectedItems(newSelected);
  };

  const onNext = () => {
    const selectedMediaList = Array.from(selectedItems.values());
    if (isManifestoContext && onMediaSelected) {
      onMediaSelected(selectedMediaList);
      navigation.goBack();
      return;
    }
    
    // Otherwise it would go to FinalizePostPage, but we don't have it yet, 
    // so just return items for now.
    if (onMediaSelected) {
      onMediaSelected(selectedMediaList);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity activeOpacity={1} style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>{tr('recents') || 'Recents'}</Text>
        <View style={styles.actions}>
          {selectedItems.size > 0 && (
            <TouchableOpacity activeOpacity={1} onPress={onNext}>
              <Text style={styles.nextText}>{tr('next') || 'Next'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity activeOpacity={1} 
          style={[styles.tab, activeTab === 'photos' && styles.activeTab]} 
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
            {tr('photos_tab') || 'Photos'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} 
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]} 
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            {tr('videos_tab') || 'Videos'}
          </Text>
        </TouchableOpacity>
      </View>

      {!hasPermission ? (
        <View style={styles.center}>
          <Text style={{ color: 'rgba(255,255,255,0.5)' }}>Please grant gallery access via Settings.</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={assets}
          numColumns={3}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.gridContent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={isLoadingMore ? <ActivityIndicator color={colors.primary} style={{ padding: 16 }} /> : null}
          renderItem={({ item }) => {
            const isSelected = selectedItems.has(item.id);
            return (
              <TouchableOpacity activeOpacity={1}
                style={[styles.gridItem, isSelected && { borderColor: colors.primary, borderWidth: 3 }]}
                onPress={() => toggleSelection(item)}
                activeOpacity={0.8}
              >
                <ExpoImage source={{ uri: item.uri }} contentFit="cover" style={StyleSheet.absoluteFill} />
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backBtn: { padding: 4, marginLeft: -4 },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  actions: { minWidth: 48, alignItems: 'flex-end' },
  nextText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    fontSize: 14,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: '900',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gridContent: { padding: 4 },
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
});
