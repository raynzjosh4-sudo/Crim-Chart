import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, FileText, Disc, Image as ImageIcon, Play } from 'lucide-react-native';
import { TabView } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { CoverArtSelectorSheet, CoverArtSelectorSheetRef } from '@/components/compose/CoverArtSelectorSheet';
import { AnimatedDisk } from '@/components/AnimatedDisk';

import { BottomPillTabs } from '@/components/posting/widgets/BottomPillTabs';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { usePostingStore } from '@/core/store/usePostingStore';

export default function MobileWebPostPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();
  const theme = useCurrentTheme();
  const colors = theme.colors;
  const { t } = useTranslation();

  const coverArtSheetRef = useRef<CoverArtSelectorSheetRef | null>(null);

  const [index, setIndex] = useState(0);
  const routes = [
    { key: 'music', title: t('common.music', 'Music') },
    { key: 'photos', title: t('common.photos', 'Photos') },
    { key: 'videos', title: t('common.videos', 'Videos') },
  ];

  const getNextParams = () => {
    return {
      ...(params.targetChannelId ? { targetChannelId: params.targetChannelId } : {}),
      ...(params.channelName ? { channelName: params.channelName } : {}),
      ...(params.channelAvatarUrl ? { channelAvatarUrl: params.channelAvatarUrl } : {}),
      isManifestoContext: String(params.isManifestoContext === 'true'),
      ...(params.isChannelPost === 'true' ? { isChannelPost: 'true' } : {}),
      ...(params.isChannelStatus === 'true' ? { isChannelStatus: 'true' } : {}),
    };
  };

  const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const audioFile = result.assets[0];
        
        coverArtSheetRef.current?.present({
          id: audioFile.uri,
          uri: audioFile.uri,
          name: audioFile.name,
          artist: 'Unknown Artist',
          lyrics: '',
          thumbnailUri: null,
          type: 'audio',
          filename: audioFile.name,
          mimeType: audioFile.mimeType,
          duration: 0,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const mediaList = result.assets.map(asset => ({
          id: asset.uri,
          uri: asset.uri,
          type: 'photo',
          width: asset.width,
          height: asset.height,
        }));

        usePostingStore.getState().setStagingMedia(mediaList);
        router.push({
          pathname: '/finalize-post',
          params: {
            ...getNextParams()
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const media = {
          id: asset.uri,
          uri: asset.uri,
          type: 'video',
          width: asset.width,
          height: asset.height,
          duration: asset.duration || 0,
        };

        usePostingStore.getState().setStagingMedia([media]);
        router.push({
          pathname: '/trim-video',
          params: {
            ...getNextParams()
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderScene = ({ route }: { route: any }) => {
    switch (route.key) {
      case 'music':
        return (
          <View style={[styles.tabContent, { justifyContent: 'center', alignItems: 'center' }]}>
            <AnimatedDisk 
              isPlaying={false} 
              onPress={handlePickAudio} 
              size={240} 
              showOverlayIcons={false} 
              placeholderText={t('Tap to select audio', 'Tap to select audio')} 
            />
          </View>
        );
      case 'photos':
        return (
          <View style={[styles.tabContent, { justifyContent: 'center', alignItems: 'center' }]}>
            <TouchableOpacity 
              style={[styles.placeholderButton, { width: 240, height: 240, borderRadius: 16, backgroundColor: '#222', padding: 0 }]} 
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <ImageIcon size={64} color="#555" />
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginTop: 16, fontWeight: '600' }}>
                {t('Tap to select photo', 'Tap to select photos')}
              </Text>
            </TouchableOpacity>
          </View>
        );
      case 'videos':
        return (
          <View style={[styles.tabContent, { justifyContent: 'center', alignItems: 'center' }]}>
            <TouchableOpacity 
              style={[styles.placeholderButton, { width: 240, height: 240, borderRadius: 16, backgroundColor: '#222', padding: 0 }]} 
              onPress={handlePickVideo}
              activeOpacity={0.8}
            >
              <Play size={64} color="#555" />
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginTop: 16, fontWeight: '600' }}>
                {t('Tap to select video', 'Tap to select video')}
              </Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const renderTabBar = () => null;

  return (
    <View style={[styles.root, { paddingBottom: Math.max(48, insets.bottom), backgroundColor: '#000000' }]}>
      <View style={{ flex: 1, backgroundColor: '#0D0D0D' }}>
        <View style={{ paddingTop: Math.max(16, insets.top), backgroundColor: '#000000', paddingHorizontal: 16 }}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>

          <View style={{ paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}
              onPress={() => router.push('/drafts')}
            >
              <FileText color={colors.primary} size={16} />
              <Text style={{ color: colors.primary, marginLeft: 8, fontWeight: '600' }}>Drafts</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          style={{ flex: 1 }}
        />

        <BottomPillTabs
          tabs={routes}
          activeIndex={index}
          onChange={setIndex}
        />
        <CoverArtSelectorSheet 
          ref={coverArtSheetRef} 
          onSelectArtwork={(media, artworkUrl) => {
            const finalMedia = {
              id: media.uri,
              uri: media.uri,
              type: 'audio',
              filename: media.name,
              name: media.name,
              artist: media.artist || 'Unknown Artist',
              mimeType: media.mimeType,
              duration: 0,
              thumbnail: artworkUrl
            };
            router.push({
              pathname: '/add-post',
              params: {
                initialAudio: JSON.stringify(finalMedia),
                ...getNextParams()
              }
            });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  closeButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 150,
  },
  placeholderText: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  gridItem: {
    width: '32.66%',
    aspectRatio: 1,
    margin: '0.33%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  }
});
