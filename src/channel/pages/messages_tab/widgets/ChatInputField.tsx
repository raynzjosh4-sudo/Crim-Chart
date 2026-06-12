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
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Smile, Send, Mic, Square, Trash2, Play, X } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

// We'll mock recording for now until we fully wire up expo-av
enum RecordState {
  none,
  recording,
  reviewing,
}

interface PendingMedia {
  uri: string;
  type: 'image' | 'video' | 'audio';
}

interface ChatInputFieldProps {
  channelId: string;
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newMedia: PendingMedia[] = result.assets.map(a => ({
        uri: a.uri,
        type: 'image' as const,
      }));
      setPendingMedia([...pendingMedia, ...newMedia]);
    }
  };

  const removePendingMedia = (index: number) => {
    setPendingMedia(pendingMedia.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (recordState === RecordState.recording) {
      setRecordState(RecordState.reviewing);
      return;
    }
    if (recordState === RecordState.reviewing) {
      console.log('Send audio recording');
      onSubmitted('', [{ uri: 'dummy_audio_uri', type: 'audio' }]);
      setRecordState(RecordState.none);
      setRecordSeconds(0);
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
    setRecordState(RecordState.recording);
  };

  const handleCancelRecording = () => {
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
              source={{ uri: m.uri }}
              style={styles.pendingImage}
              contentFit="cover"
            />
            <TouchableOpacity
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

  const renderInputField = () => {
    if (recordState === RecordState.recording) {
      return (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>0:00</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.recordingLabel}>Recording...</Text>
          <TouchableOpacity onPress={handleCancelRecording} style={styles.trashBtn}>
            <Trash2 size={16} color="#FF5252" />
          </TouchableOpacity>
        </View>
      );
    }

    if (recordState === RecordState.reviewing) {
      return (
        <View style={styles.reviewingContainer}>
          <TouchableOpacity onPress={handleCancelRecording} style={styles.trashBtn}>
            <Trash2 size={16} color="#FF5252" />
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingHorizontal: 12 }}>
            <Play size={20} color="#FFF" fill="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            {[10, 14, 20, 14, 18, 24, 18, 14, 20, 10].map((h, i) => (
              <View key={i} style={{ width: 3, height: h, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
            ))}
          </View>
          <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold', paddingRight: 12, paddingLeft: 12 }}>
            00:00
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
        <TouchableOpacity onPress={onEmojiPressed} style={styles.emojiBtn}>
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
        <TouchableOpacity onPress={handlePickMedia} style={styles.cameraBtn}>
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
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.actionBtn, { backgroundColor: buttonColor }]}
        >
          {getActionIcon()}
        </TouchableOpacity>
      </View>
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
    maxHeight: 120,
  },
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
