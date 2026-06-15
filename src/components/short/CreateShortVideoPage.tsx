import { useCameraStore } from '@/core/store/useCameraStore';
import { CameraView } from 'expo-camera';
import { Flashlight, Music, RefreshCcw, Settings, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CreateShortVideoPageProps {
  onClose: () => void;
}

export const CreateShortVideoPage: React.FC<CreateShortVideoPageProps> = ({ onClose }) => {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<any>(null);
  const setCapturedVideo = useCameraStore(s => s.setCapturedVideo);
  const setCapturedImage = useCameraStore(s => s.setCapturedImage);

  const toggleFacing = () => setFacing(facing === 'back' ? 'front' : 'back');
  const toggleFlash = () => setFlash(flash === 'off' ? 'on' : 'off');

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    // For Shorts, we generally prefer video, but we can allow taking a photo cover
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) setCapturedImage(photo.uri);
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
      if (video?.uri) setCapturedVideo(video.uri);
    } catch (e) {
      console.log('Record error:', e);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!cameraRef.current || !isRecording) return;
    cameraRef.current.stopRecording();
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        mode="video"
        enableTorch={flash === 'on'}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <X size={28} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
              <Flashlight size={24} color={flash === 'on' ? '#FFB300' : '#FFF'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Settings size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Gallery / Capture / Flip row */}
            <View style={styles.captureRow}>
              <TouchableOpacity style={styles.galleryButton}>
                <View style={styles.galleryPlaceholder} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.captureRing, isRecording && { borderColor: '#E50914' }]}
                onPress={handleCapture}
                onLongPress={startRecording}
                onPressOut={stopRecording}
                delayLongPress={200}
              >
                <View style={[styles.captureButton, isRecording && { backgroundColor: '#E50914', borderRadius: 10, width: 36, height: 36 }]} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={toggleFacing}>
                <RefreshCcw size={28} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Music Widget */}
            <View style={styles.musicWidgetContainer}>
              <TouchableOpacity style={styles.musicButton}>
                <Music size={16} color="#FFF" style={styles.musicIcon} />
                <Text style={styles.musicText}>Add Audio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    paddingBottom: 20,
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  galleryPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  captureRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  musicWidgetContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  musicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  musicIcon: {
    marginRight: 6,
  },
  musicText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
