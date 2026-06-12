import { Image as ExpoImage } from 'expo-image';
import LottieView from 'lottie-react-native';
import { Play } from 'lucide-react-native';
import { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { MediaGalleryBottomSheet } from '../bottom_sheets/MediaGalleryBottomSheet';
import { MessageMediaItem } from '../models/MediaModel';

interface MessageMediaGridProps {
  items: MessageMediaItem[];
  channelId?: string;
  isMe?: boolean;
  shareActionText?: string;
  onShareAction?: () => void;
}

const isLottie = (type: string) => type === 'lottie';
const isVideo = (type: string) => type === 'video';

const ITEM_WIDTH = 200;
const ITEM_GAP = 6;
const MAX_BUBBLE_WIDTH = Dimensions.get('window').width - 120; // Approx bubble content area

export const MessageMediaGrid: React.FC<MessageMediaGridProps> = ({
  items,
  channelId,
  isMe = false,
  shareActionText = 'Share Moment',
  onShareAction,
}) => {
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const galleryItems = items.filter(i => !isLottie(i.type as string));

  const handleMediaTap = (index: number, type: string) => {
    if (isLottie(type)) return;
    // Map the tapped index to its position in the gallery items list
    const item = items[index];
    const galleryIndex = galleryItems.findIndex(i => i === item);
    setInitialIndex(Math.max(0, galleryIndex));
    setIsGalleryVisible(true);
  };

  const renderSingleMedia = (item: MessageMediaItem) => {
    const type = item.type as string;

    if (isLottie(type)) {
      return (
        <View style={styles.lottieContainer}>
          <LottieView
            source={typeof item.url === 'string' ? { uri: item.url } : (item.url as any)}
            autoPlay
            loop
            style={{ width: 120, height: 120 }}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => handleMediaTap(0, type)}
        style={styles.singleContainer}
        activeOpacity={0.7}
      >
        <ExpoImage
          source={{ uri: item.thumbnail || (item.url as string) }}
          style={styles.image}
          contentFit="cover"
        />
        {isVideo(type) && (
          <View style={styles.playIconContainer}>
            <Play fill="#FFF" color="#FFF" size={24} style={{ marginLeft: 2 }} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderThreadMedia = () => {
    const totalContentWidth = items.length * ITEM_WIDTH + (items.length - 1) * ITEM_GAP;
    
    const screenWidth = Dimensions.get('window').width;
    
    // Calculate offsets based on ChatBubble padding and avatar width
    // Avatar(42) + Spacer(12) + Row padding(16) = 70
    const leftOffset = isMe ? 16 : 70;
    const rightOffset = isMe ? 70 : 16;
    
    const availableWidth = screenWidth - leftOffset - rightOffset;
    
    let paddingLeft = leftOffset;
    const paddingRight = rightOffset;
    
    // For outgoing messages, align to the right if content is smaller than available space
    if (isMe && totalContentWidth < availableWidth) {
      paddingLeft += (availableWidth - totalContentWidth);
    }

    return (
      <View 
        style={{ 
          width: screenWidth, 
          marginTop: 8,
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          marginLeft: isMe ? 0 : -leftOffset,
          marginRight: isMe ? -rightOffset : 0,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.threadContent, 
            { paddingLeft, paddingRight }
          ]}
        >
          {items.map((item, index) => {
            const type = item.type as string;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleMediaTap(index, type)}
                style={styles.threadItem}
                activeOpacity={isLottie(type) ? 1 : 0.7}
              >
                {isLottie(type) ? (
                  <LottieView
                    source={typeof item.url === 'string' ? { uri: item.url } : (item.url as any)}
                    autoPlay
                    loop
                    style={styles.image}
                  />
                ) : (
                  <ExpoImage
                    source={{ uri: item.thumbnail || (item.url as string) }}
                    style={styles.image}
                    contentFit="cover"
                  />
                )}
                {isVideo(type) && (
                  <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={[styles.playIconContainer, { width: 36, height: 36 }]}>
                      <Play fill="#FFF" color="#FFF" size={16} style={{ marginLeft: 2 }} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      {items.length === 1 ? renderSingleMedia(items[0]) : renderThreadMedia()}
      <MediaGalleryBottomSheet
        visible={isGalleryVisible}
        onClose={() => setIsGalleryVisible(false)}
        items={galleryItems as any}
        initialIndex={initialIndex}
      />
    </>
  );
};

const styles = StyleSheet.create({
  singleContainer: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadContent: {
    flexDirection: 'row',
    gap: ITEM_GAP,
  },
  threadItem: {
    width: ITEM_WIDTH,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  lottieContainer: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
});
