import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { ChartLinearLoader } from '@/components/CrimchartLoader/ChartLinearLoader';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { PermissionDialog } from '@/components/ui/PermissionDialog';
import { cloudMediaService } from '@/core/network/cloudMediaService';
import { useCameraStore } from '@/core/store/useCameraStore';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const EditProfilePage = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const isLoading = useAuthStore((s) => s.isLoading);
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState(user?.username || '');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionType, setPermissionType] = useState<'camera' | 'gallery' | null>(null);
  const [permissionState, setPermissionState] = useState<'request' | 'denied'>('request');
  const capturedImage = useCameraStore(s => s.capturedImage);
  const setCapturedImage = useCameraStore(s => s.setCapturedImage);

  useEffect(() => {
    if (capturedImage) {
      uploadImage(capturedImage);
      setCapturedImage(null);
    }
  }, [capturedImage]);

  const handleSave = async () => {
    if (isLoading) return;
    // Map the internal 'username' state (which acts as the Name field) to the 'display_name' column
    const success = await updateProfile({ display_name: username });
    if (success) {
      ChartToast.showSuccess(null, { title: 'Success', message: 'Profile updated successfully!' });
      router.back();
    } else {
      ChartToast.showError(null, { title: 'Error', message: 'Failed to update profile.' });
    }
  };

  const handleEditPicture = () => {
    setShowImagePickerModal(true);
  };

  const uploadImage = async (uri: string) => {
    try {
      setLocalImageUri(uri);
      setShowImagePickerModal(false);

      const publicUrl = await cloudMediaService.uploadMedia(uri, 'profile_images', user?.id);

      const success = await updateProfile({ profile_image_url: publicUrl });
      if (success) {
        ChartToast.showSuccess(null, { title: 'Success', message: 'Profile picture updated!' });
      } else {
        ChartToast.showError(null, { title: 'Error', message: 'Failed to save profile picture.' });
      }
    } catch (e: any) {
      ChartToast.showError(null, { title: 'Upload Failed', message: e.message || 'Could not upload image.' });
    }
  };

  const launchCamera = async () => {
    router.push('/camera');
  };

  const launchGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const handlePermissionConfirm = async () => {
    if (permissionState === 'denied') {
      Linking.openSettings();
      setShowPermissionDialog(false);
      return;
    }

    setShowPermissionDialog(false);
    if (permissionType === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        launchCamera();
      } else {
        setPermissionState('denied');
        setShowPermissionDialog(true);
      }
    } else if (permissionType === 'gallery') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        launchGallery();
      } else {
        setPermissionState('denied');
        setShowPermissionDialog(true);
      }
    }
  };

  const handleSelectImageSource = async (index: number) => {
    setShowImagePickerModal(false);
    setPermissionState('request');
    try {
      if (index === 0) {
        const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
        if (status === 'granted') {
          launchCamera();
        } else if (canAskAgain) {
          setPermissionType('camera');
          setShowPermissionDialog(true);
        } else {
          setPermissionType('camera');
          setPermissionState('denied');
          setShowPermissionDialog(true);
        }
      } else if (index === 1) {
        const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status === 'granted') {
          launchGallery();
        } else if (canAskAgain) {
          setPermissionType('gallery');
          setShowPermissionDialog(true);
        } else {
          setPermissionType('gallery');
          setPermissionState('denied');
          setShowPermissionDialog(true);
        }
      }
    } catch (e) {
      console.log('Image picker error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <ChartAppBar
        title="Edit Profile"
        showBack={false}
        leading={<CrimchartBackButton onPress={() => router.back()} color={colors.text} />}
        actions={[
          <TouchableOpacity key="save" onPress={handleSave} disabled={isLoading} style={styles.saveButton}>
            <Text style={[styles.saveText, isLoading && { opacity: 0.5 }]}>Save</Text>
          </TouchableOpacity>
        ]}
      />

      <ChartLinearLoader isLoading={isLoading} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.pictureSection}>
          <TouchableOpacity onPress={handleEditPicture}>
            <View>
              <Image
                source={{ uri: localImageUri || user?.profileImageUrl || 'https://via.placeholder.com/150' }}
                style={styles.avatar}
              />
              <View style={styles.cameraBadge}>
                <Camera size={14} color="#000" />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditPicture} style={styles.editPictureButton}>
            <Text style={styles.editPictureText}>Edit picture</Text>
          </TouchableOpacity>
        </View>

        {/* Username Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>NAME</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="name"
              autoComplete="name"
            />
          </View>
        </View>

        {/* Personal Info Link */}
        <View style={styles.personalInfoRow}>
          <TouchableOpacity
            style={styles.personalInfoButton}
            onPress={() => router.push('/personal-info')}
          >
            <Text style={styles.personalInfoText}>Personal Information</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Picker Sheet */}
      <Modal visible={showImagePickerModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowImagePickerModal(false)}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <Text style={styles.modalTitle}>CHANGE PROFILE PICTURE</Text>

            <TouchableOpacity style={styles.modalItemRow} onPress={() => handleSelectImageSource(0)}>
              <Camera size={20} color={colors.text} />
              <Text style={styles.modalItemText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalItemRow} onPress={() => handleSelectImageSource(1)}>
              <ImageIcon size={20} color={colors.text} />
              <Text style={styles.modalItemText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowImagePickerModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <PermissionDialog
        visible={showPermissionDialog}
        title={permissionState === 'request'
          ? (permissionType === 'camera' ? 'Camera Access' : 'Gallery Access')
          : (permissionType === 'camera' ? 'Camera Access Denied' : 'Gallery Access Denied')
        }
        description={permissionState === 'request'
          ? `We need access to your ${permissionType === 'camera' ? 'camera' : 'photo library'} so you can select a profile picture.`
          : `Please enable ${permissionType === 'camera' ? 'camera' : 'gallery'} access in your phone settings to continue.`
        }
        icon={permissionType === 'camera' ? <Camera size={24} color={colors.primary} /> : <ImageIcon size={24} color={colors.primary} />}
        confirmText={permissionState === 'request' ? 'Continue' : 'Open Settings'}
        onCancel={() => setShowPermissionDialog(false)}
        onConfirm={handlePermissionConfirm}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  saveButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  saveText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  content: {
    paddingVertical: 30,
  },
  pictureSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#1A1A1A',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  editPictureButton: {
    marginTop: 16,
  },
  editPictureText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 15,
  },
  personalInfoRow: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  personalInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  personalInfoText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13.5,
  },
  inputSection: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
  },
  input: {
    width: '100%',
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    paddingVertical: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  modalTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  modalItemText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.error || '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
});
