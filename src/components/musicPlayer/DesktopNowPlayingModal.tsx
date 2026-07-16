import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback, useWindowDimensions, Platform } from 'react-native';
import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';
import { NowPlayingScreen } from './NowPlayingScreen';

export const DesktopNowPlayingModal = () => {
  const { isOpen, queue, currentIndex, closeModal, nextTrack, prevTrack } = useDesktopNowPlayingStore();
  const { height } = useWindowDimensions();

  if (Platform.OS !== 'web') return null;
  if (!isOpen || queue.length === 0) return null;

  const currentTrack = queue[currentIndex];
  if (!currentTrack) return null;

  const hasNext = currentIndex < queue.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={closeModal}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={[styles.modalContent, { maxHeight: height * 0.9 }]}>
          <NowPlayingScreen
            title={currentTrack.title}
            artist={currentTrack.artist}
            coverUrl={currentTrack.coverUrl}
            audioUrl={currentTrack.audioUrl}
            lyrics={currentTrack.lyrics}
            postId={currentTrack.postId}
            boxId={currentTrack.boxId}
            onBack={closeModal}
            onNext={hasNext ? nextTrack : undefined}
            onPrev={hasPrev ? prevTrack : undefined}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: 450,
    height: 800,
    maxWidth: '95%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  }
});
