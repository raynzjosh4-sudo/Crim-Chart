import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Audio } from 'expo-av';
import { Music, ChevronLeft, ArrowRight, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocalMusicList } from '@/components/compose/LocalMusicList';

export default function EditorPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const trimmedVideoUri = params.trimmedVideoUri as string;
  
  const [isMusicModalVisible, setIsMusicModalVisible] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Video Player
  const player = useVideoPlayer(trimmedVideoUri || '', (player) => {
    player.loop = true;
    player.play();
  });

  // Mute video if external audio is selected
  useEffect(() => {
    if (player) {
      player.muted = !!selectedAudio;
    }
  }, [player, selectedAudio]);

  // Audio Player
  useEffect(() => {
    if (selectedAudio) {
      loadAudio(selectedAudio.uri);
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [selectedAudio]);

  const loadAudio = async (uri: string) => {
    if (sound) {
      await sound.unloadAsync();
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
    } catch (e) {
      console.error("Failed to load audio:", e);
    }
  };

  // Sync video and audio playback
  useEffect(() => {
    if (!player || !sound) return;
    const sub = player.addListener('playingChange', (event) => {
      if (event.isPlaying) {
        sound.playAsync();
      } else {
        sound.pauseAsync();
      }
    });
    return () => sub.remove();
  }, [player, sound]);

  const togglePlay = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleNext = () => {
    // If audio is selected, we need to pass it to the finalize step
    // We update the original media item JSON or pass additional params
    router.push({ 
      pathname: '/finalize-post', 
      params: {
        ...params,
        selectedAudioJson: selectedAudio ? JSON.stringify(selectedAudio) : undefined,
      } 
    });
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <TouchableOpacity activeOpacity={1} onPress={togglePlay} style={StyleSheet.absoluteFillObject}>
        {trimmedVideoUri ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#222' }]} />
        )}
      </TouchableOpacity>

      {/* Top Navigation & Actions */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.addSoundButton}
          onPress={() => setIsMusicModalVisible(true)}
        >
          <Music color="#FFF" size={20} />
          <Text style={styles.addSoundText}>
            {selectedAudio ? selectedAudio.name || 'Sound added' : 'Add sound'}
          </Text>
        </TouchableOpacity>

        {/* Empty view for flex balancing */}
        <View style={{ width: 44 }} />
      </View>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <ArrowRight color="#000" size={20} />
        </TouchableOpacity>
      </View>

      {/* Music Selector Modal */}
      <Modal
        visible={isMusicModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsMusicModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Sound</Text>
            <TouchableOpacity onPress={() => setIsMusicModalVisible(false)}>
              <X color="#FFF" size={24} />
            </TouchableOpacity>
          </View>
          
          <LocalMusicList 
            onSelect={(media) => {
              setSelectedAudio(media);
              setIsMusicModalVisible(false);
            }} 
            selectedId={selectedAudio?.id}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
  },
  addSoundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  addSoundText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
