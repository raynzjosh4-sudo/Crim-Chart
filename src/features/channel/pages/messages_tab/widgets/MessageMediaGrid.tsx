import { colors } from '@/core/theme/colors';
import { Image } from 'expo-image';
import { Play, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MediaGalleryBottomSheet } from '../../../../../channel/pages/messages_tab/bottom_sheets/MediaGalleryBottomSheet';
import { ShareStatusButton } from '@/components/buttons/ShareStatusButton';
import { MessageMediaItem } from '../../../../../models/MediaModel';

interface MessageMediaGridProps {
  items: MessageMediaItem[];
  channelId?: string;
  isMe?: boolean;
  caption?: string;
}

import { Dimensions } from 'react-native';

export const MessageMediaGrid: React.FC<MessageMediaGridProps> = ({
  items,
  channelId,
  isMe = false,
  caption,
}) => {
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  if (items.length === 0) return null;

  const openGallery = (index: number) => {
    setInitialIndex(index);
    setGalleryVisible(true);
  };

  const renderPlayIcon = (small = false) => (
    <View style={[styles.playIconContainer, { width: small ? 36 : 54, height: small ? 36 : 54, borderRadius: small ? 18 : 27 }]}>
      <Play color="#FFF" size={small ? 20 : 36} fill="#FFF" />
    </View>
  );

  const renderShareMoment = (item: MessageMediaItem) => (
    <ShareStatusButton 
      mediaUrl={item.url} 
      mediaType={item.type} 
      targetType={channelId ? 'moment' : 'status'} 
      channelId={channelId} 
      caption={caption}
    />
  );

  if (items.length === 1) {
    const item = items[0];
    return (
      <>
        <TouchableOpacity activeOpacity={0.9} onPress={() => openGallery(0)}>
          <View style={styles.singleContainer}>
            <Image source={{ uri: item.thumbnail || item.url }} style={styles.image} contentFit="cover" />
            {item.type === 'video' && (
              <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                {renderPlayIcon()}
              </View>
            )}
            {renderShareMoment(item)}
          </View>
        </TouchableOpacity>
        <MediaGalleryBottomSheet
          visible={galleryVisible}
          onClose={() => setGalleryVisible(false)}
          items={items}
          initialIndex={0}
        />
      </>
    );
  }

  const ITEM_WIDTH = 240;
  const ITEM_GAP = 10;
  const totalContentWidth = items.length * ITEM_WIDTH + (items.length - 1) * ITEM_GAP;

  const screenWidth = Dimensions.get('window').width;

  const leftOffset = isMe ? 16 : 70;
  const rightOffset = isMe ? 70 : 16;

  const availableWidth = screenWidth - leftOffset - rightOffset;

  let paddingLeft = leftOffset;
  const paddingRight = rightOffset;

  if (isMe && totalContentWidth < availableWidth) {
    paddingLeft += (availableWidth - totalContentWidth);
  }

  return (
    <>
      <View
        style={{
          height: 320,
          width: screenWidth,
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          marginLeft: isMe ? 0 : -leftOffset,
          marginRight: isMe ? -rightOffset : 0,
        }}
      >
        <FlatList
          data={items}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft, paddingRight }}
          ItemSeparatorComponent={() => <View style={{ width: ITEM_GAP }} />}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity activeOpacity={0.9} onPress={() => openGallery(index)}>
              <View style={styles.threadContainer}>
                <Image source={{ uri: item.thumbnail || item.url }} style={styles.image} contentFit="cover" />
                {item.type === 'video' && (
                  <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                    {renderPlayIcon(true)}
                  </View>
                )}
                {renderShareMoment(item)}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
      <MediaGalleryBottomSheet
        visible={galleryVisible}
        onClose={() => setGalleryVisible(false)}
        items={items}
        initialIndex={initialIndex}
      />
    </>
  );
};

const styles = StyleSheet.create({
  singleContainer: {
    width: 260,
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  threadContainer: {
    width: 240,
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
