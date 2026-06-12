import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform, FlatList } from 'react-native';
import { Image } from 'expo-image';
// import { Video, ResizeMode } from 'expo-av';
import { X, Download, Play } from 'lucide-react-native';
import { MessageMediaItem } from '../../../../models/MediaModel';

interface MediaGalleryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  items: MessageMediaItem[];
  initialIndex?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoGalleryItem = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <View style={styles.page}>
      {/* 
      <Video
        source={{ uri: url }}
        style={styles.media}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls={false}
        shouldPlay={isPlaying}
        isLooping
      />
      */}
      <View style={[styles.media, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{color: 'white'}}>Video Player Disabled</Text>
      </View>
      <TouchableOpacity 
        style={styles.videoOverlay} 
        activeOpacity={1} 
        onPress={() => setIsPlaying(!isPlaying)}
      >
        {!isPlaying && <Play size={80} color="rgba(255,255,255,0.5)" fill="rgba(255,255,255,0.5)" />}
      </TouchableOpacity>
    </View>
  );
};

export const MediaGalleryBottomSheet: React.FC<MediaGalleryBottomSheetProps> = ({
  visible,
  onClose,
  items,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!visible) return null;

  const renderItem = ({ item }: { item: MessageMediaItem }) => {
    if (item.type === 'video') {
      return <VideoGalleryItem url={item.url} />;
    }

    return (
      <View style={styles.page}>
        <Image
          source={{ uri: item.url }}
          style={styles.media}
          contentFit="contain"
        />
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <X color="#FFF" size={28} />
          </TouchableOpacity>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {items.length}
          </Text>
          <TouchableOpacity style={styles.iconButton}>
            <Download color="#FFF" size={28} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          renderItem={renderItem}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setCurrentIndex(index);
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  page: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  iconButton: {
    padding: 8,
  },
  counterText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
