import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';

export const saveMediaToDevice = async (url: string, isAudio: boolean = false): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Fallback for web: Trigger a direct download via a hidden anchor tag
      const a = document.createElement('a');
      a.href = url;
      a.download = url.split('/').pop() || (isAudio ? 'audio.mp3' : 'media.mp4');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }

    // Native implementation
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need permission to save media to your gallery.');
      return false;
    }

    // Extract file extension and prepare local URI
    let ext = url.split('.').pop() || '';
    if (!['mp4', 'mp3', 'jpg', 'jpeg', 'png'].includes(ext.toLowerCase())) {
       ext = isAudio ? 'mp3' : 'mp4';
    }
    // Clean up query params if any
    ext = ext.split('?')[0];

    const fileUri = `${FileSystem.documentDirectory}temp_media_${Date.now()}.${ext}`;

    const downloadResult = await FileSystem.downloadAsync(url, fileUri);

    if (downloadResult.status !== 200) {
      throw new Error('Failed to download media');
    }

    await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

    // Clean up temporary file
    await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });

    Alert.alert('Success', 'Saved successfully to your gallery!');
    return true;
  } catch (error) {
    console.error('Failed to save media:', error);
    Alert.alert('Error', 'Failed to save media. Please try again.');
    return false;
  }
};
