import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { Camera, Smile, Mic, Send, Square, Trash2, Play, Pause } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';
import CommentingSheet from '@/commentingsheets/widgets/CommentingSheet';
import { StickerSheet } from './StickerSheet';

// ─── Recording State Machine ──────────────────────────────────────────────────
enum RecordState { None, Recording, Reviewing }

interface ChatInputFieldProps {
  channelId?: string;
  onSubmitted?: (text: string) => void;
  onMediaSubmitted?: (media: any[], caption: string) => void;
  onVoiceSubmitted?: (url: string, duration: number) => void;
  onLottieSubmitted?: (stickerIndex: number) => void;
  onTypingChange?: (isTyping: boolean) => void;
}

export const ChatInputField: React.FC<ChatInputFieldProps> = ({
  channelId,
  onSubmitted,
  onMediaSubmitted,
  onVoiceSubmitted,
  onLottieSubmitted,
  onTypingChange,
}) => {
  const [text, setText] = useState('');
  const [recordState, setRecordState] = useState(RecordState.None);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordSecondsRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSeconds, setPlaySeconds] = useState(0);
  const playSecondsRef = useRef(0);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isMediaSheetVisible, setIsMediaSheetVisible] = useState(false);
  const [isStickerSheetVisible, setIsStickerSheetVisible] = useState(false);

  // ─── Typing Indicator Logic ───
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = useCallback((newText: string) => {
    setText(newText);
    if (newText.length > 0 && !isTyping) {
      setIsTyping(true);
      onTypingChange?.(true);
    }
    
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingChange?.(false);
    }, 2000);
  }, [isTyping, onTypingChange]);

  // Shake animation for camera icon (when typing)
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shakeLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Blink animation for recording dot
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const blinkLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Waveform pulse animation
  const waveAnim = useRef(new Animated.Value(0.5)).current;
  const waveLoop = useRef<Animated.CompositeAnimation | null>(null);

  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Shake animation when text is typed ─────────────────────────────────
  useEffect(() => {
    if (text.length > 0) {
      if (!shakeLoop.current) {
        shakeLoop.current = Animated.loop(
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true, easing: Easing.linear }),
          ])
        );
        shakeLoop.current.start();
      }
    } else {
      shakeLoop.current?.stop();
      shakeLoop.current = null;
      shakeAnim.setValue(0);
    }
  }, [text]);

  // ─── Blink dot when recording ────────────────────────────────────────────
  useEffect(() => {
    if (recordState === RecordState.Recording) {
      blinkLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      blinkLoop.current.start();
    } else {
      blinkLoop.current?.stop();
      blinkLoop.current = null;
      blinkAnim.setValue(1);
    }
  }, [recordState]);

  // ─── Waveform animation when reviewing ──────────────────────────────────
  useEffect(() => {
    if (recordState === RecordState.Reviewing) {
      waveLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
      waveLoop.current.start();
    } else {
      waveLoop.current?.stop();
      waveLoop.current = null;
      waveAnim.setValue(0.5);
    }
  }, [recordState]);

  // ─── Timer for recording ─────────────────────────────────────────────────
  useEffect(() => {
    if (recordState === RecordState.Recording) {
      recordSecondsRef.current = 0;
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        recordSecondsRef.current += 1;
        setRecordSeconds(recordSecondsRef.current);
      }, 1000);
    } else {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [recordState]);

  // ─── Playback simulation timer ───────────────────────────────────────────
  const stopPlayback = useCallback(() => {
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
    setIsPlaying(false);
    playSecondsRef.current = 0;
    setPlaySeconds(0);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      playTimerRef.current = null;
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playTimerRef.current = setInterval(() => {
        playSecondsRef.current += 1;
        setPlaySeconds(playSecondsRef.current);
        // Stop at recordSeconds duration
        if (playSecondsRef.current >= recordSecondsRef.current) {
          if (playTimerRef.current) clearInterval(playTimerRef.current);
          playTimerRef.current = null;
          setIsPlaying(false);
          playSecondsRef.current = 0;
          setPlaySeconds(0);
        }
      }, 1000);
    }
  }, [isPlaying, recordSeconds]);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ─── Recording handlers ──────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    setRecordState(RecordState.Recording);
  }, []);

  const stopRecordingForReview = useCallback(() => {
    setRecordState(RecordState.Reviewing);
    stopPlayback();
  }, [stopPlayback]);

  const cancelRecording = useCallback(() => {
    stopPlayback();
    setRecordState(RecordState.None);
    setRecordSeconds(0);
    recordSecondsRef.current = 0;
  }, [stopPlayback]);

  const sendRecording = useCallback(() => {
    stopPlayback();
    setRecordState(RecordState.None);
    setRecordSeconds(0);
    recordSecondsRef.current = 0;
    onVoiceSubmitted?.('dummy-audio.mp4', playSecondsRef.current * 1000);
  }, [stopPlayback, onVoiceSubmitted]);


  // ─── Main submit logic ───────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (recordState === RecordState.Recording) {
      stopRecordingForReview();
      return;
    }
    if (recordState === RecordState.Reviewing) {
      sendRecording();
      return;
    }
    if (text.trim().length === 0) {
      startRecording();
      return;
    }
    onSubmitted?.(text.trim());
    setText('');
  }, [recordState, text, onSubmitted]);

  // ─── Derived send button ─────────────────────────────────────────────────
  const SendIcon = () => {
    if (recordState === RecordState.Recording) return <Square size={20} color="#FFF" />;
    if (recordState === RecordState.Reviewing || text.length > 0) return <Send size={20} color="#000" />;
    return <Mic size={20} color="#000" />;
  };

  const sendBgColor = recordState === RecordState.Recording ? '#E41E3F' : colors.primary;

  const cameraTranslateY = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-2, 0, 2],
  });

  // ─── Fake waveform bars ───────────────────────────────────────────────────
  const BARS = 18;
  const waveHeights = [0.3, 0.5, 0.8, 0.6, 1.0, 0.7, 0.5, 0.9, 0.4, 0.7, 1.0, 0.6, 0.4, 0.8, 0.5, 0.9, 0.3, 0.6];

  return (
    <>
      <View style={styles.container}>
        {/* ── Camera / Folder Icon ── */}
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => setIsMediaSheetVisible(true)}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ translateY: cameraTranslateY }] }}>
            <Camera size={24} color={colors.primary} />
          </Animated.View>
        </TouchableOpacity>

        {/* ── Input / Recording / Reviewing area ── */}
        <View style={styles.inputArea}>
          {recordState === RecordState.Recording ? (
            /* ── RECORDING PILL ── */
            <View style={styles.recordingPill}>
              <Animated.View style={{ opacity: blinkAnim }}>
                <View style={styles.recordDot} />
              </Animated.View>
              <Text style={styles.recordTime}>{fmtTime(recordSeconds)}</Text>
              <Text style={styles.recordingLabel}>Recording...</Text>
              <TouchableOpacity onPress={cancelRecording} style={styles.trashBtn}>
                <Trash2 size={16} color="#E41E3F" />
              </TouchableOpacity>
            </View>
          ) : recordState === RecordState.Reviewing ? (
            /* ── REVIEWING PILL (with waveform + playback) ── */
            <View style={styles.reviewingPill}>
              {/* Trash */}
              <TouchableOpacity onPress={cancelRecording} style={styles.trashBtn}>
                <Trash2 size={16} color="#E41E3F" />
              </TouchableOpacity>

              {/* Play/Pause */}
              <TouchableOpacity onPress={togglePlayback} style={styles.playBtn}>
                {isPlaying
                  ? <Pause size={16} color="#FFF" />
                  : <Play size={16} color="#FFF" />
                }
              </TouchableOpacity>

              {/* Fake waveform */}
              <View style={styles.waveform}>
                {waveHeights.map((h, i) => {
                  // bars before playback progress → active color, else dim
                  const progress = recordSeconds > 0 ? playSeconds / recordSeconds : 0;
                  const isActive = (i / BARS) < progress;
                  return (
                    <Animated.View
                      key={i}
                      style={[
                        styles.waveBar,
                        {
                          height: 28 * h,
                          backgroundColor: isActive ? colors.primary : 'rgba(255,255,255,0.25)',
                          transform: [{ scaleY: isPlaying ? waveAnim : 1 }],
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Duration */}
              <Text style={styles.playTime}>{fmtTime(playSeconds)}</Text>
            </View>
          ) : (
            /* ── NORMAL INPUT ── */
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                multiline
                value={text}
                onChangeText={handleTyping}
              />
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setIsStickerSheetVisible(true)}
                activeOpacity={0.7}
              >
                <Smile size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Send / Stop / Mic Button ── */}
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: sendBgColor }]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <SendIcon />
        </TouchableOpacity>
      </View>

      {/* ── Select Media Sheet ── */}
      <CommentingSheet
        visible={isMediaSheetVisible}
        onClose={() => setIsMediaSheetVisible(false)}
        channelId={channelId}
        showInputField={true}
        onCommentPosted={(data) => {
          if (data && data.media && data.media.length > 0) {
            onMediaSubmitted?.(data.media, data.caption || '');
          } else if (data && data.caption) {
            onSubmitted?.(data.caption);
          }
        }}
      />

      {/* ── Sticker / Emoji Sheet ── */}
      <StickerSheet
        visible={isStickerSheetVisible}
        onClose={() => setIsStickerSheetVisible(false)}
        onStickerSelected={(index) => {
          setIsStickerSheetVisible(false);
          onLottieSubmitted?.(index);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align bottom so icons stay at bottom when input grows
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 14,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputArea: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align icons to bottom
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    paddingVertical: 12,
    lineHeight: 20,
    minHeight: 48,
    maxHeight: 120, // Prevent infinite growth
  },
  iconBtn: {
    padding: 12,
  },
  // ── Recording ──
  recordingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(228, 30, 63, 0.1)',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(228, 30, 63, 0.3)',
    gap: 8,
  },
  recordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E41E3F',
  },
  recordTime: {
    color: '#E41E3F',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recordingLabel: {
    flex: 1,
    color: 'rgba(228, 30, 63, 0.7)',
    fontSize: 12,
  },
  trashBtn: {
    padding: 6,
    backgroundColor: 'rgba(228, 30, 63, 0.1)',
    borderRadius: 12,
  },
  // ── Reviewing ──
  reviewingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    paddingHorizontal: 10,
    height: 52,
    borderWidth: 1,
    borderColor: `${colors.primary}44`,
    gap: 6,
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
  playTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
  // ── Send button ──
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  // ── Delete menu (Android) ──
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  deleteMenu: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  deleteMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  deleteMenuText: {
    color: '#E41E3F',
    fontSize: 16,
    fontWeight: '700',
  },
});
