import { CameraView } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { X, RefreshCcw, Flashlight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCameraStore } from '@/core/store/useCameraStore';

export const CustomCamera = () => {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setCapturedImage = useCameraStore(s => s.setCapturedImage);

  const toggleCameraFacing = () => {
    setFacing(facing === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
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

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFill} 
        facing={facing}
        enableTorch={flash === 'on'}
      >
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <X color="white" size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
            <Flashlight color={flash === 'on' ? '#FFB300' : 'white'} size={24} />
          </TouchableOpacity>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 32) }]}>
          <View style={styles.sideButtonContainer} />
          
          <TouchableOpacity 
            style={styles.captureRing} 
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={styles.captureButton}>
              {isCapturing ? <ActivityIndicator color="black" /> : null}
            </View>
          </TouchableOpacity>

          <View style={styles.sideButtonContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
