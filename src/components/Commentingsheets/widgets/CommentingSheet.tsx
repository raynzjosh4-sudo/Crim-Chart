import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, TouchableOpacity, Dimensions, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { X, Image as ImageIcon, Smartphone } from 'lucide-react-native';
import { useLocalization } from '@/core/localization/localization_provider';
import { MediaData, MediaType } from '@/channel/pages/widgets2/chartcard/models/media_data';
import * as MediaLibrary from 'expo-media-library';
import { Image as ExpoImage } from 'expo-image';
import { MediaChips } from '@/components/mediaChips/MediaChips';

const { height, width } = Dimensions.get('window');

interface CommentingSheetProps {
  visible: boolean;
  onClose: () => void;
  onMediaSelected: (media: MediaData) => void;
  showInputField?: boolean;
}

export const CommentingSheet: React.FC<CommentingSheetProps> = ({
  visible,
  onClose,
  onMediaSelected,
  showInputField = true,
}) => {
  const { colors } = useTheme();
  const { tr } = useLocalization();
  
  const [activeTab, setActiveTab] = useState<'gallery' | 'device'>('gallery');
  const [devicePhotos, setDevicePhotos] = useState<MediaLibrary.Asset[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoadingDevicePhotos, setIsLoadingDevicePhotos] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<MediaLibrary.Album | null>(null);

  useEffect(() => {
    if (activeTab === 'device' && hasPermission !== true) {
      (async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status === 'granted') {
          fetchDevicePhotos();
        }
      })();
    } else if (activeTab === 'device' && hasPermission === true) {
      fetchDevicePhotos();
    }
  }, [activeTab, selectedAlbum]);

  const fetchDevicePhotos = async () => {
    setIsLoadingDevicePhotos(true);
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 50,
        sortBy: [MediaLibrary.SortBy.creationTime],
        album: selectedAlbum || undefined,
      });
      setDevicePhotos(media.assets);
    } catch (e) {
      console.error('Failed to load device photos', e);
    } finally {
      setIsLoadingDevicePhotos(false);
    }
  };

  const handlePickFromDevice = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onMediaSelected({
        contentUrl: result.assets[0].uri,
        type: MediaType.photo,
      });
      onClose();
    }
  };

  const handleSelectMockImage = (index: number) => {
    // Return a mocked MediaData item to simulate picking a previously uploaded post image
    onMediaSelected({
      contentUrl: `https://picsum.photos/400/400?random=${index}`,
      type: MediaType.photo,
    });
    onClose();
  };

  // Mock array to represent previously uploaded media in the posts table
  const mockGalleryMedia = Array.from({ length: 15 }).map((_, i) => i);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={[styles.sheetContent, { backgroundColor: colors.background }]}>
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
          </View>

          {/* Title Row */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{tr('select_media')}</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity onPress={() => setActiveTab('gallery')}>
              <Text style={[styles.tab, activeTab === 'gallery' ? styles.tabActive : styles.tabInactive]}>
                {tr('gallery_tab')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('device')}>
              <Text style={[styles.tab, activeTab === 'device' ? styles.tabActive : styles.tabInactive]}>
                {tr('device_tab')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Body content based on tab */}
          {activeTab === 'gallery' ? (
            <ScrollView contentContainerStyle={styles.galleryContainer}>
              {mockGalleryMedia.map((index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => handleSelectMockImage(index)}
                  activeOpacity={0.8}
                >
                  <ExpoImage 
                    source={{ uri: `https://picsum.photos/400/400?random=${index}` }} 
                    style={styles.galleryImage} 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={{ flex: 1 }}>
              {hasPermission === false ? (
                <View style={styles.body}>
                  <Text style={{ color: colors.text }}>Permission to access gallery was denied.</Text>
                </View>
              ) : isLoadingDevicePhotos ? (
                <View style={styles.body}>
                  <ActivityIndicator size="large" color="#FACD11" />
                </View>
              ) : (
                <>
                  <MediaChips 
                    selectedAlbum={selectedAlbum} 
                    onAlbumSelected={setSelectedAlbum} 
                  />
                  <FlatList
                    data={devicePhotos}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    contentContainerStyle={{ padding: 2 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        onPress={() => {
                          onMediaSelected({ contentUrl: item.uri, type: MediaType.photo });
                          onClose();
                        }}
                        activeOpacity={0.8}
                      >
                        <ExpoImage 
                          source={{ uri: item.uri }} 
                          style={styles.galleryImage} 
                          contentFit="cover"
                        />
                      </TouchableOpacity>
                    )}
                  />
                </>
              )}
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 12,
  },
  tab: {
    marginRight: 24,
    fontSize: 13,
  },
  tabActive: {
    color: '#FACD11',
    fontWeight: '900',
  },
  tabInactive: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceButton: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(250, 205, 17, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(250, 205, 17, 0.2)',
  },
  deviceButtonText: {
    color: '#FACD11',
    fontWeight: 'bold',
    marginTop: 16,
    fontSize: 16,
  },
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  galleryImage: {
    width: (width - 4) / 3, // 3 columns
    height: (width - 4) / 3,
    margin: 1,
  },
});
