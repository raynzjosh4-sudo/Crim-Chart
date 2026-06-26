import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  Text,
  ScrollView,
  Linking,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Camera, Smile, Send, Mic, Square, Trash2, Play, Pause, X } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';
import { PermissionDialog } from '@/components/ui/PermissionDialog';

// We'll mock recording for now until we fully wire up expo-av
enum RecordState {
  none,
  recording,
  reviewing,
}

interface PendingMedia {
  uri: string;
  thumbnailUri?: string;
  type: 'image' | 'video' | 'audio';
}

interface ChatInputFieldProps {
  channelId?: string;
  /** Called with text when sending text-only or text+media together */
  onSubmitted: (text: string, media: PendingMedia[]) => void;
  onEmojiPressed?: () => void;
  onChangeText?: (text: string) => void;
}

export const ChatInputField: React.FC<ChatInputFieldProps> = ({
  channelId,
  onSubmitted,
  onEmojiPressed,
  onChangeText,
}) => {
  const [text, setText] = useState('');
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [recordState, setRecordState] = useState<RecordState>(RecordState.none);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordUri, setRecordUri] = useState<string | null>(null);
  const [permissionDialogState, setPermissionDialogState] = useState<'hidden' | 'initial' | 'denied'>('hidden');

  const [reviewSound, setReviewSound] = useState<Audio.Sound | null>(null);
  const [isPlayingReview, setIsPlayingReview] = useState(false);
  const [reviewPosition, setReviewPosition] = useState(0);

  const handleTextChange = (val: string) => {
    setText(val);
    if (onChangeText) onChangeText(val);
  };

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const hasContent = text.trim().length > 0 || pendingMedia.length > 0;

  useEffect(() => {
    if (pendingMedia.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ])
      ).start();
    } else {
      shakeAnim.stopAnimation();
      shakeAnim.setValue(0);
    }
  }, [pendingMedia.length, shakeAnim]);

  const handlePickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newMedia: PendingMedia[] = await Promise.all(
        result.assets.map(async (a) => {
          let thumbnailUri: string | undefined;
          if (a.type === 'video') {
            try {
              const { uri } = await VideoThumbnails.getThumbnailAsync(a.uri, {
                time: 1000,
              });
              thumbnailUri = uri;
            } catch (e) {
              console.warn('Failed to generate video thumbnail', e);
            }
          }
          return {
            uri: a.uri,
            thumbnailUri,
            type: a.type === 'video' ? 'video' : 'image',
          };
        })
      );
      setPendingMedia([...pendingMedia, ...newMedia]);
    }
  };

  const removePendingMedia = (index: number) => {
    setPendingMedia(pendingMedia.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const perm = await Audio.getPermissionsAsync();
      if (perm.status !== 'granted') {
        if (!perm.canAskAgain) {
          setPermissionDialogState('denied');
        } else {
          setPermissionDialogState('initial');
        }
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setRecordState(RecordState.recording);
      setRecordSeconds(0);

      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          setRecordSeconds(Math.floor(status.durationMillis / 1000));
        }
      });
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const cleanupReviewSound = async () => {
    if (reviewSound) {
      await reviewSound.unloadAsync().catch(() => {});
      setReviewSound(null);
    }
    setIsPlayingReview(false);
    setReviewPosition(0);
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordUri(uri);
      setRecordState(RecordState.reviewing);
      
      if (uri) {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false }
        );
        setReviewSound(sound);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setIsPlayingReview(status.isPlaying);
            setReviewPosition(Math.floor(status.positionMillis / 1000));
            if (status.didJustFinish) {
              setIsPlayingReview(false);
              sound.setPositionAsync(0);
            }
          }
        });
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const toggleReviewPlay = async () => {
    if (!reviewSound) return;
    if (isPlayingReview) {
      await reviewSound.pauseAsync();
    } else {
      await reviewSound.playAsync();
    }
  };

  const handleSubmit = async () => {
    if (recordState === RecordState.recording) {
      await stopRecording();
      return;
    }
    if (recordState === RecordState.reviewing) {
      if (recordUri) {
        onSubmitted('', [{ uri: recordUri, type: 'audio' }]);
      }
      await cleanupReviewSound();
      setRecordState(RecordState.none);
      setRecordSeconds(0);
      setRecordUri(null);
      setRecording(null);
      return;
    }

    // If there's media or text, send together
    if (hasContent) {
      onSubmitted(text.trim(), pendingMedia);
      setText('');
      setPendingMedia([]);
      Keyboard.dismiss();
      return;
    }

    // Empty — start recording
    await startRecording();
  };

  const handleCancelRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync().catch(() => {});
    }
    await cleanupReviewSound();
    setRecording(null);
    setRecordUri(null);
    setRecordState(RecordState.none);
    setRecordSeconds(0);
  };

  const renderPendingMediaRow = () => {
    if (pendingMedia.length === 0) return null;
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pendingRow}
        contentContainerStyle={styles.pendingRowContent}
      >
        {pendingMedia.map((m, i) => (
          <View key={i} style={styles.pendingThumb}>
            <ExpoImage
              source={{ uri: m.thumbnailUri || m.uri }}
              style={styles.pendingImage}
              contentFit="cover"
            />
            {m.type === 'video' && (
              <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12 }]}>
                <Play size={20} color="#FFF" fill="#FFF" />
              </View>
            )}
            <TouchableOpacity activeOpacity={1}
              style={styles.removeThumbBtn}
              onPress={() => removePendingMedia(i)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <X size={10} color="#FFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderInputField = () => {
    if (recordState === RecordState.recording) {
      return (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>{formatTime(recordSeconds)}</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.recordingLabel}>Recording...</Text>
          <TouchableOpacity activeOpacity={1} onPress={handleCancelRecording} style={styles.trashBtn}>
            <Trash2 size={16} color="#FF5252" />
          </TouchableOpacity>
        </View>
      );
    }

    if (recordState === RecordState.reviewing) {
      return (
        <View style={styles.reviewingContainer}>
          <TouchableOpacity activeOpacity={1} onPress={handleCancelRecording} style={styles.trashBtn}>
            <Trash2 size={16} color="#FF5252" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1} style={{ paddingHorizontal: 12 }} onPress={toggleReviewPlay}>
            {isPlayingReview ? <Pause size={20} color="#FFF" /> : <Play size={20} color="#FFF" fill="#FFF" />}
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            {[10, 14, 20, 14, 18, 24, 18, 14, 20, 10].map((h, i) => (
              <View key={i} style={{ width: 3, height: h, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
            ))}
          </View>
          <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold', paddingRight: 12, paddingLeft: 12 }}>
            {formatTime(isPlayingReview || reviewPosition > 0 ? reviewPosition : recordSeconds)}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={pendingMedia.length > 0 ? 'Add a caption...' : 'Type a message...'}
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={text}
          onChangeText={handleTextChange}
          multiline
        />
        <TouchableOpacity activeOpacity={1} onPress={onEmojiPressed} style={styles.emojiBtn}>
          <Smile size={20} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>
    );
  };

  const getActionIcon = () => {
    if (recordState === RecordState.recording) return <Square size={20} color="#FFF" />;
    if (recordState === RecordState.reviewing) return <Send size={20} color="#000" />;
    if (hasContent) return <Send size={20} color="#000" />;
    return <Mic size={20} color="#000" />;
  };

  const buttonColor = recordState === RecordState.recording ? '#FF5252' : colors.primary;

  return (
    <View style={styles.wrapper}>
      {/* Pending media thumbnails above the input bar */}
      {renderPendingMediaRow()}

      <View style={styles.container}>
        {/* Camera/Media Button */}
        <TouchableOpacity activeOpacity={1} onPress={handlePickMedia} style={styles.cameraBtn}>
          <Animated.View
            style={{
              transform: [
                {
                  translateY: shakeAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-2, 2],
                  }),
                },
              ],
            }}
          >
            <View style={[
              styles.cameraIconWrapper,
              pendingMedia.length > 0 && styles.cameraIconWrapperActive,
            ]}>
              <Camera size={24} color={pendingMedia.length > 0 ? '#000' : colors.primary} />
              {pendingMedia.length > 0 && (
                <View style={styles.mediaBadge}>
                  <Text style={styles.mediaBadgeText}>{pendingMedia.length}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>

        <View style={{ width: 12 }} />

        {/* Main Input Area */}
        <View style={styles.mainArea}>
          {renderInputField()}
        </View>

        <View style={{ width: 12 }} />

        {/* Action Button (Mic/Send/Stop) */}
        <TouchableOpacity activeOpacity={1}
          onPress={handleSubmit}
          style={[styles.actionBtn, { backgroundColor: buttonColor }]}
        >
          {getActionIcon()}
        </TouchableOpacity>
      </View>

      <PermissionDialog
        visible={permissionDialogState !== 'hidden'}
        icon={<Mic size={32} color={colors.primary} />}
        title="Microphone Access"
        description={
          permissionDialogState === 'denied'
            ? 'You have previously denied microphone access. Please enable it in your device settings to record voice messages.'
            : 'CrimChart needs access to your microphone so you can record and send voice messages to your friends.'
        }
        cancelText="Not Now"
        confirmText={permissionDialogState === 'denied' ? 'Open Settings' : 'Continue'}
        onCancel={() => setPermissionDialogState('hidden')}
        onConfirm={async () => {
          if (permissionDialogState === 'denied') {
            Linking.openSettings();
            setPermissionDialogState('hidden');
          } else {
            setPermissionDialogState('hidden');
            const newPerm = await Audio.requestPermissionsAsync();
            if (newPerm.status === 'granted') {
              startRecording();
            }
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  pendingRow: {
    maxHeight: 90,
    paddingTop: 8,
  },
  pendingRowContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  pendingThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'visible',
    position: 'relative',
  },
  pendingImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  removeThumbBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cameraBtn: {
    marginBottom: 4,
  },
  cameraIconWrapper: {
    padding: 8,
    backgroundColor: 'rgba(250, 205, 17, 0.1)',
    borderRadius: 24,
  },
  cameraIconWrapperActive: {
    backgroundColor: colors.primary,
  },
  mediaBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  mainArea: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 24,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 250,
    outlineStyle: 'none',
  } as any,
  emojiBtn: {
    padding: 12,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
    height: 48,
    paddingHorizontal: 16,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5252',
  },
  recordingTime: {
    color: '#FF5252',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 12,
  },
  recordingLabel: {
    color: 'rgba(255, 82, 82, 0.7)',
    fontSize: 12,
    marginRight: 8,
  },
  reviewingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(250, 205, 17, 0.3)',
    height: 48,
    paddingHorizontal: 8,
  },
  trashBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 20,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
