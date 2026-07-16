import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, FlatList, Image } from 'react-native';
import { X, Play } from 'lucide-react-native';
import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';
import { useTheme } from '@react-navigation/native';

interface MusicQueueSheetProps {
  visible: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
}

export const MusicQueueSheet: React.FC<MusicQueueSheetProps> = ({ visible, onClose, isEmbedded = false }) => {
  const { queue, currentIndex, jumpToTrack } = useDesktopNowPlayingStore();
  const { colors } = useTheme();

  if (!visible) return null;

  const content = (
    <View style={[styles.container, isEmbedded && styles.embeddedContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>Up Next</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={queue}
        keyExtractor={(_item, index) => `queue-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isActive = index === currentIndex;
          return (
            <TouchableOpacity 
              style={[styles.trackRow, isActive && styles.activeTrackRow]} 
              onPress={() => {
                jumpToTrack(index);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.thumbnailContainer}>
                {item.coverUrl ? (
                  <Image source={{ uri: item.coverUrl }} style={styles.thumbnail} />
                ) : (
                  <View style={[styles.thumbnail, styles.placeholderThumbnail]} />
                )}
                {isActive && (
                  <View style={styles.activeOverlay}>
                    <Play size={16} color="#000" fill="#000" />
                  </View>
                )}
              </View>
              
              <View style={styles.infoContainer}>
                <Text style={[styles.trackTitle, isActive && { color: colors.primary }]} numberOfLines={1}>
                  {item.title || 'Unknown Title'}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {item.artist || 'Unknown Artist'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        {content}
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
  container: {
    height: '60%',
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  embeddedContainer: {
    height: '100%',
    flex: 1,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    paddingVertical: 10,
    paddingBottom: 40,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  activeTrackRow: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  thumbnailContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    backgroundColor: '#222',
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
});
