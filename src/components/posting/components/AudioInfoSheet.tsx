import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Animated, PanResponder } from 'react-native';
import { MediaItem } from '../models/MediaItem';
import { colors } from '@/core/theme/colors';
import { Image as ImageIcon, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface AudioInfoSheetProps {
  visible: boolean;
  onClose: () => void;
  mediaItem: MediaItem | null;
  onConfirm: (updatedItem: MediaItem) => void;
}

export const AudioInfoSheet: React.FC<AudioInfoSheetProps> = ({ visible, onClose, mediaItem, onConfirm }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (visible && mediaItem) {
      setTitle(mediaItem.title || '');
      setArtist(mediaItem.artist || '');
      setLyrics(mediaItem.lyrics || '');
      setThumbnailUrl(mediaItem.thumbnailUrl);
    }
  }, [visible, mediaItem]);

  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      pan.setValue({ x: 0, y: 0 });
    }
  }, [visible]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setThumbnailUrl(result.assets[0].uri);
    }
  };

  const handleConfirm = () => {
    if (!mediaItem) return;
    onConfirm({
      ...mediaItem,
      title: title.trim() || mediaItem.title,
      artist: artist.trim() || mediaItem.artist,
      lyrics: lyrics.trim(),
      thumbnailUrl: thumbnailUrl || mediaItem.thumbnailUrl,
    });
    onClose();
  };

  if (!mediaItem) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
          <Animated.View style={[styles.container, { transform: [{ translateY: pan.y }] }]}>
            <View {...panResponder.panHandlers} style={{ width: '100%', alignItems: 'center' }}>
              <View style={styles.dragHandle} />
              
              <View style={[styles.header, { width: '100%' }]}>
                <View style={{ width: 60 }} />
                <Text style={styles.headerTitle}>Audio Details</Text>
                <TouchableOpacity activeOpacity={1} onPress={handleConfirm} style={[styles.headerBtn, { width: 60, alignItems: 'flex-end' }]}>
                  <Text style={styles.saveText}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}>
              {/* Sleek Thumbnail Picker */}
              <View style={styles.thumbnailSection}>
                <TouchableOpacity style={styles.thumbnailBtn} onPress={handlePickImage} activeOpacity={0.8}>
                  {thumbnailUrl ? (
                    <>
                      <Image source={{ uri: thumbnailUrl }} style={styles.thumbnailImg} />
                      <View style={styles.editBadge}>
                        <Camera color="#FFF" size={12} />
                      </View>
                    </>
                  ) : (
                    <View style={styles.thumbnailPlaceholder}>
                      <ImageIcon color="rgba(255,255,255,0.4)" size={32} />
                      <View style={styles.editBadge}>
                        <Camera color="#FFF" size={12} />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Minimal Inputs */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.minimalInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Song title"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  selectionColor="#FACD11"
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.minimalInput}
                  value={artist}
                  onChangeText={setArtist}
                  placeholder="Artist"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  selectionColor="#FACD11"
                />
              </View>

              <View style={[styles.inputGroup, { borderBottomWidth: 0 }]}>
                <TextInput
                  style={[styles.minimalInput, styles.textArea]}
                  value={lyrics}
                  onChangeText={setLyrics}
                  placeholder="Write lyrics here..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  textAlignVertical="top"
                  selectionColor="#FACD11"
                />
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
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
    width: '100%',
    backgroundColor: '#000000', // Pitch black, standard for sleek dark mode
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerBtn: {
    paddingVertical: 4,
  },
  cancelText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  saveText: {
    color: '#FACD11',
    fontSize: 16,
    fontWeight: '600',
  },
  scroll: {
    width: '100%',
  },
  thumbnailSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  thumbnailBtn: {
    width: 100,
    height: 100,
    borderRadius: 50, // Perfect circle for social media vibe
    backgroundColor: '#111111',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2A2A2A',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  inputGroup: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  minimalInput: {
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
    fontWeight: '500',
  },
  textArea: {
    height: 160,
    paddingTop: 16,
  },
});
