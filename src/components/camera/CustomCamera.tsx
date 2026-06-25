import { useCameraStore } from '@/core/store/useCameraStore';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Flashlight, RefreshCcw, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CustomCamera = () => {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setCapturedImage = useCameraStore(s => s.setCapturedImage);
  const setCapturedVideo = useCameraStore(s => s.setCapturedVideo);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mode, setMode] = useState<'picture' | 'video'>('picture');

  const toggleCameraFacing = () => {
    setFacing(facing === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing || isRecording) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (photo?.uri) {
        setCapturedImage(photo.uri);
        router.back();
      }
    } catch (e) {
      console.log('Capture error:', e);
    } finally {
      setIsCapturing(false);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || isCapturing || isRecording) return;
    setMode('video');

    // Slight delay to ensure mode is set before recording
    setTimeout(async () => {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 60,
        });
        if (video?.uri) {
          setCapturedVideo(video.uri);
          router.back();
        }
      } catch (e) {
        console.log('Record error:', e);
      } finally {
        setIsRecording(false);
        setMode('picture');
      }
    }, 100);
  };

  const stopRecording = () => {
    if (!cameraRef.current || !isRecording) return;
    cameraRef.current.stopRecording();
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(recordingTime + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        mode={mode}
        enableTorch={flash === 'on'}
      >
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity activeOpacity={1} style={styles.iconButton} onPress={() => router.back()}>
            <X color="white" size={28} />
          </TouchableOpacity>
          {isRecording && (
            <View style={styles.recordingTimer}>
              <View style={styles.recordingDot} />
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            </View>
          )}
          <TouchableOpacity activeOpacity={1} style={styles.iconButton} onPress={toggleFlash}>
            <Flashlight color={flash === 'on' ? '#FFB300' : 'white'} size={24} />
          </TouchableOpacity>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 32) }]}>
          <View style={styles.sideButtonContainer} />

          <TouchableOpacity activeOpacity={1}
            style={[styles.captureRing, isRecording && { borderColor: '#E50914' }]}
            onPress={takePicture}
            onLongPress={startRecording}
            onPressOut={stopRecording}
            delayLongPress={200}
            disabled={isCapturing}
          >
            <View style={[styles.captureButton, isRecording && { backgroundColor: '#E50914', borderRadius: 8, width: 32, height: 32 }]} />
          </TouchableOpacity>

          <View style={styles.sideButtonContainer}>
            <TouchableOpacity activeOpacity={1} style={styles.iconButton} onPress={toggleCameraFacing}>
              <RefreshCcw color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  recordingTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E50914',
    marginRight: 8,
  },
  timerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 32,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideButtonContainer: {
    width: 48,
    alignItems: 'center',
  }
});
