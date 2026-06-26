import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, useWindowDimensions, Platform, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { MessageMediaItem } from '../../../../models/MediaModel';

interface MediaGalleryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  items: MessageMediaItem[];
  initialIndex?: number;
}

export const MediaGalleryBottomSheet: React.FC<MediaGalleryBottomSheetProps> = ({
  visible,
  onClose,
  items,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<any>(null);
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const viewerWidth = isDesktop ? Math.min(width * 0.85, 1200) : width;
  const viewerHeight = isDesktop ? Math.min(height * 0.85, 900) : height;

  const renderItem = ({ item }: { item: MessageMediaItem }) => {
    return (
      <View style={[styles.page, { width: viewerWidth, height: viewerHeight }]}>
        <Image
          source={{ uri: item.url }}
          style={styles.media}
          contentFit="contain"
        />
      </View>
    );
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType={isDesktop ? "fade" : "slide"} onRequestClose={onClose}>
      <View style={[styles.overlay, isDesktop && styles.overlayDesktop]}>
        {isDesktop && <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />}
        
        <View style={[styles.container, isDesktop && { 
          width: viewerWidth, 
          height: viewerHeight, 
          borderRadius: 24, 
          overflow: 'hidden',
          backgroundColor: '#0F1117'
        }]}>
          <View style={[styles.topBar, isDesktop && { top: 0, paddingVertical: 16 }]}>
            <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.iconButton}>
              <X color="#FFF" size={28} />
            </TouchableOpacity>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {items.length}
            </Text>
            <TouchableOpacity activeOpacity={1} style={styles.iconButton}>
              <Download color="#FFF" size={28} />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={items}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.url}-${index}`}
            renderItem={renderItem}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: viewerWidth,
              offset: viewerWidth * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / viewerWidth);
              setCurrentIndex(index);
            }}
          />

          {/* Navigation Arrows */}
          {isDesktop && items.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity style={styles.leftArrow} onPress={handlePrev}>
                  <View style={styles.arrowCircle}>
                    <ChevronLeft color="#FFF" size={32} />
                  </View>
                </TouchableOpacity>
              )}
              {currentIndex < items.length - 1 && (
                <TouchableOpacity style={styles.rightArrow} onPress={handleNext}>
                  <View style={styles.arrowCircle}>
                    <ChevronRight color="#FFF" size={32} />
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  overlayDesktop: {
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  },
  page: {
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
  rightArrow: {
    position: 'absolute',
    right: 24,
    top: '50%',
    marginTop: -24,
    zIndex: 20,
  },
  leftArrow: {
    position: 'absolute',
    left: 24,
    top: '50%',
    marginTop: -24,
    zIndex: 20,
  },
  arrowCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
