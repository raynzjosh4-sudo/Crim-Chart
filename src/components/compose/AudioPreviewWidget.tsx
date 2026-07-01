import { colors } from '@/core/theme/colors';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { FileText, Pause, Play, Plus, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { DeviceEventEmitter, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LyricsEditorPanel } from './LyricsEditorPanel';

interface AudioPreviewWidgetProps {
  media: any;
  onRemove?: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  onSelect?: (media: any) => void;
  isSelected?: boolean;
}

export const AudioPreviewWidget: React.FC<AudioPreviewWidgetProps> = ({ media, onRemove, onUpdate, onSelect, isSelected }) => {
  const user = useAuthStore(s => s.user);
  const { startLoading, stopLoading } = useGlobalProgress();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Local state for edits
  const [thumbnail, setThumbnail] = useState<string | null>(media.thumbnailUri || null);
  const [name, setName] = useState(media.name || '');
  const [artist, setArtist] = useState(media.artist || '');
  const [lyricsModalVisible, setLyricsModalVisible] = useState(false);
  const [lyrics, setLyrics] = useState(media.lyrics || '');

  const displayImage = thumbnail || user?.profileImageUrl;

  // Cleanup audio on unmount — stop THEN unload so playback halts immediately
  useEffect(() => {
    return () => {
      if (sound) {
        sound.stopAsync().finally(() => sound.unloadAsync());
      }
    };
  }, [sound]);

  // Pause when another audio starts playing
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('play_audio', async (playingId) => {
      if (playingId !== media.id && isPlaying && sound) {
        try {
          await sound.pauseAsync();
          setIsPlaying(false);
        } catch (error) {
          console.error("Error pausing other audio", error);
        }
      }
    });
    return () => sub.remove();
  }, [sound, isPlaying, media.id]);

  const togglePlayback = async () => {
    if (!media.uri) return;

    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        DeviceEventEmitter.emit('play_audio', media.id);
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else {
      try {
        DeviceEventEmitter.emit('play_audio', media.id);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: media.uri },
          { shouldPlay: true }
        );
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
              newSound.setPositionAsync(0);
            }
          }
        });
        setSound(newSound);
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio", error);
      }
    }
  };

  const pickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setThumbnail(uri);
      onUpdate(media.id, { thumbnailUri: uri });
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    onUpdate(media.id, { name: val });
  };

  const handleArtistChange = (val: string) => {
    setArtist(val);
    onUpdate(media.id, { artist: val });
  };

  return (
    <View style={styles.container}>
      {/* Left side: Thumbnail & Play button */}
      <View style={styles.thumbnailContainer}>
        <TouchableOpacity style={styles.thumbnailWrapper} onPress={pickThumbnail} activeOpacity={0.8}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.thumbnailImage} contentFit="cover" />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButtonOverlay} onPress={togglePlayback}>
          <View style={styles.playButtonCircle}>
            {isPlaying ? (
              <Pause size={24} color="#FFF" fill="#FFF" />
            ) : (
              <Play size={24} color="#FFF" fill="#FFF" style={{ marginLeft: 3 }} />
            )}
          </View>
        </TouchableOpacity>

        {/* Plus Badge */}
        {!thumbnail && (
          <TouchableOpacity style={styles.plusBadge} onPress={pickThumbnail}>
            <Plus size={14} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Right side: Info fields */}
      <View style={styles.infoContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <TextInput
            style={[styles.nameInput, { flex: 1, paddingRight: onRemove ? 24 : 0 }]}
            placeholder="Song Name"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={name}
            onChangeText={handleNameChange}
          />
          {onRemove && (
            <TouchableOpacity
              onPress={() => onRemove(media.id)}
              style={{ position: 'absolute', right: 0, top: 0, padding: 4, zIndex: 10 }}
            >
              <X size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        <TextInput
          style={styles.artistInput}
          placeholder="Artist Name"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={artist}
          onChangeText={handleArtistChange}
        />

        <View style={styles.divider} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.lyricButton} onPress={async () => {
            startLoading();
            await new Promise(r => setTimeout(r, 400));
            stopLoading();
            setLyricsModalVisible(true);
          }}>
            <FileText size={12} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.lyricButtonText}>{lyrics ? 'Edit lyric' : 'Add lyric'}</Text>
          </TouchableOpacity>

          {onSelect && (
            <TouchableOpacity
              style={[styles.lyricButton, { marginLeft: 8, backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.primary }]}
              onPress={() => onSelect({ ...media, name, artist, lyrics, thumbnail })}
              disabled={isSelected}
            >
              <Text style={[styles.lyricButtonText, { color: isSelected ? '#FFF' : '#000', fontWeight: 'bold' }]}>
                {isSelected ? 'Selected' : 'Select'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lyrics Modal */}
      <Modal visible={lyricsModalVisible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView
          style={styles.lyricsModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.lyricsSmallWindow}>
            <View style={styles.lyricsHeader}>
              <Text style={styles.lyricsTitle}>Lyrics</Text>
              <TouchableOpacity
                onPress={() => setLyricsModalVisible(false)}
                style={styles.lyricsCloseBtn}
              >
                <X size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            <LyricsEditorPanel
              value={lyrics}
              onChange={(val) => {
                setLyrics(val);
                onUpdate(media.id, { lyrics: val });
              }}
              initialArtist={artist}
              initialSong={name}
            />
            <View style={styles.lyricsFooter}>
              <TouchableOpacity style={styles.lyricsSaveButton} onPress={() => {
                onUpdate(media.id, { lyrics });
                setLyricsModalVisible(false);
              }}>
                <Text style={styles.lyricsSaveButtonText}>Save Lyrics</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    padding: 8,
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginRight: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  plusBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  playButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lyricsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lyricsSmallWindow: {
    width: '100%',
    maxWidth: 400,
    height: 400,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
  },
  lyricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  lyricsTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  lyricsCloseBtn: {
    padding: 4,
  },
  lyricsInputSmall: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    padding: 16,
    textAlignVertical: 'top',
    outlineStyle: 'none' as any,
  },
  lyricsFooter: {
    padding: 16,
  },
  lyricsSaveButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  lyricsSaveButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameInput: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    padding: 0,
    margin: 0,
    outlineStyle: 'none' as any,
  },
  artistInput: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    padding: 0,
    margin: 0,
    outlineStyle: 'none' as any,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  lyricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  lyricButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  getLyricsHereBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  getLyricsHereText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  lyricsSearchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
  },
});
