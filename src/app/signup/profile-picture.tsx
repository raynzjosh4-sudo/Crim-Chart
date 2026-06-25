import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { cloudMediaService } from '@/core/network/cloudMediaService';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, User } from 'lucide-react-native';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfilePicturePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      if (image && user?.id) {
        const publicUrl = await cloudMediaService.uploadMedia(image, 'profile_images', user.id);
        await updateProfile({ profile_image_url: publicUrl });
      }
      router.push('/signup/user-suggestions' as any);
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      ChartToast.showErrorSimple('Upload Failed', error.message || 'Could not upload profile picture.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar
        title=""
        showBorder
        isLoading={isLoading}
        actions={[
          <TouchableOpacity activeOpacity={1}
            key="skip"
            onPress={() => router.push('/signup/channel-intro' as any)}
            disabled={isLoading}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ]}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Add a profile picture</Text>
          <Text style={styles.subtitle}>
            Adding a photo helps your friends recognize you. You can always change this later.
          </Text>

          <View style={styles.spacerExtraLarge} />

          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              {image ? (
                <Image source={{ uri: image }} style={styles.imagePlaceholder} />
              ) : (
                <User size={80} color="rgba(255, 255, 255, 0.1)" />
              )}
            </View>
            <TouchableOpacity activeOpacity={1}
              style={styles.cameraButton}
              onPress={pickImage}
              disabled={isLoading}
            >
              <Camera size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.spacerExtraLarge} />

          <TouchableOpacity activeOpacity={1}
            style={styles.nextButton}
            onPress={image ? handleNext : pickImage}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>{image ? 'Next' : 'Add a photo'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  spacerExtraLarge: {
    height: 60,
  },
  skipText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 179, 0, 0.3)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    backgroundColor: '#333',
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 52,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

