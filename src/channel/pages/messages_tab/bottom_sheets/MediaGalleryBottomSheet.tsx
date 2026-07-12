import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageMediaItem } from '../../../../models/MediaModel';
import { GalleryDownloadButton } from './GalleryDownloadButton';

interface MediaGalleryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  items?: MessageMediaItem[];
  groups?: MessageMediaItem[][];
  initialIndex?: number;
  initialGroupIndex?: number;
}

export const MediaGalleryBottomSheet: React.FC<MediaGalleryBottomSheetProps> = ({
  visible,
  onClose,
  items,
  groups,
  initialIndex = 0,
  initialGroupIndex = 0,
}) => {
  const dataGroups = groups || (items ? [items] : []);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const verticalListRef = useRef<any>(null);
  const horizontalListRefs = useRef<{ [key: number]: any }>({});
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const screenDimensions = Dimensions.get('screen');
  const insets = useSafeAreaInsets();
  const isDesktop = Platform.OS === 'web' && windowWidth >= 768;

  // Use state to track exact layout dimensions so paging doesn't drift
  const [layoutDims, setLayoutDims] = useState<{ width: number, height: number } | null>(null);

  // Fallback to screen dimensions initially to prevent layout jumps, but onLayout will provide the exact pixel size
  const viewerWidth = isDesktop ? Math.min(windowWidth * 0.85, 1200) : (layoutDims?.width || screenDimensions.width);
  const viewerHeight = isDesktop ? Math.min(windowHeight * 0.85, 900) : (layoutDims?.height || screenDimensions.height);

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
      const newIndex = currentIndex - 1;
      horizontalListRefs.current[currentGroupIndex]?.scrollToIndex({ index: newIndex, animated: true });
      setCurrentIndex(newIndex);
    }
  };

  const handleNext = () => {
    const currentGroup = dataGroups[currentGroupIndex] || [];
    if (currentIndex < currentGroup.length - 1) {
      const newIndex = currentIndex + 1;
      horizontalListRefs.current[currentGroupIndex]?.scrollToIndex({ index: newIndex, animated: true });
      setCurrentIndex(newIndex);
    }
  };

  return (
    <Modal visible={visible} transparent animationType={isDesktop ? "fade" : "slide"} onRequestClose={onClose}>
      <View style={[styles.overlay, isDesktop && styles.overlayDesktop]}>
        {isDesktop && <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />}

        <View 
          onLayout={(e) => {
            if (!isDesktop) {
              setLayoutDims({
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height
              });
            }
          }}
          style={[styles.container, isDesktop && {
            width: viewerWidth,
            height: viewerHeight,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: '#0F1117'
          }]}
        >
          <View style={[
            styles.topBar,
            isDesktop ? { top: 0, paddingVertical: 16 } : { top: Math.max(insets.top + 10, 20) }
          ]}>
            <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.iconButton}>
              <X color="#FFF" size={28} />
            </TouchableOpacity>
            <Text style={styles.counterText}>
              {dataGroups.length > 1
                ? `${currentGroupIndex + 1}/${dataGroups.length}` + (dataGroups[currentGroupIndex]?.length > 1 ? ` • ${currentIndex + 1}/${dataGroups[currentGroupIndex].length}` : '')
                : `${currentIndex + 1}/${dataGroups[0]?.length || 1}`
              }
            </Text>
            <GalleryDownloadButton 
              url={dataGroups[currentGroupIndex]?.[currentIndex]?.url} 
              type={dataGroups[currentGroupIndex]?.[currentIndex]?.type} 
            />
          </View>

          {(!layoutDims && !isDesktop) ? null : (
            <FlatList
              ref={verticalListRef}
              data={dataGroups}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              keyExtractor={(_, index) => `group-${index}`}
              initialScrollIndex={initialGroupIndex}
              getItemLayout={(_, index) => ({
                length: viewerHeight,
                offset: viewerHeight * index,
                index,
              })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / viewerHeight);
              setCurrentGroupIndex(index);
              setCurrentIndex(0); // Reset horizontal index when changing vertical post
            }}
            renderItem={({ item: groupItems, index: groupIndex }) => (
              <View style={{ width: viewerWidth, height: viewerHeight }}>
                <FlatList
                  ref={(ref) => { horizontalListRefs.current[groupIndex] = ref; }}
                  data={groupItems}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, idx) => `${item.url}-${idx}`}
                  renderItem={renderItem}
                  initialScrollIndex={groupIndex === initialGroupIndex ? initialIndex : 0}
                  getItemLayout={(_, index) => ({
                    length: viewerWidth,
                    offset: viewerWidth * index,
                    index,
                  })}
                  onMomentumScrollEnd={(e) => {
                    if (groupIndex === currentGroupIndex) {
                      const index = Math.round(e.nativeEvent.contentOffset.x / viewerWidth);
                      setCurrentIndex(index);
                    }
                  }}
                />
              </View>
            )}
          />
          )}

          {/* Navigation Arrows */}
          {isDesktop && (dataGroups[currentGroupIndex]?.length || 0) > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity style={styles.leftArrow} onPress={handlePrev}>
                  <View style={styles.arrowCircle}>
                    <ChevronLeft color="#FFF" size={32} />
                  </View>
                </TouchableOpacity>
              )}
              {currentIndex < (dataGroups[currentGroupIndex]?.length || 0) - 1 && (
                <TouchableOpacity style={styles.rightArrow} onPress={handleNext}>
                  <View style={styles.arrowCircle}>
                    <ChevronRight color="#FFF" size={32} />
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Caption */}
          {dataGroups[currentGroupIndex]?.[currentIndex]?.caption ? (
            <View style={[
              styles.captionContainer,
              isDesktop ? styles.captionContainerDesktop : { bottom: Math.max(insets.bottom + 16, 24) }
            ]}>
              <Text style={styles.captionText}>{dataGroups[currentGroupIndex][currentIndex].caption}</Text>
            </View>
          ) : null}
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
  captionContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 30,
  },
  captionContainerDesktop: {
    bottom: 24,
    alignSelf: 'center',
    width: '80%',
    left: '10%',
    right: 'auto',
  },
  captionText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
