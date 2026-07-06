import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { supabase } from '@/core/supabase/supabaseConfig';
import { Camera } from 'lucide-react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

export const EditProfileImagePage: React.FC = () => {
  const navigation = useNavigation();
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const user = useAuthStore(s => s.user);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!preview || !user) return;
    setIsUploading(true);
    try {
      const response = await fetch(preview);
      const blob = await response.blob();
      const ext = preview.split('.').pop() ?? 'jpg';
      const path = `users/${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('crown')
        .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('crown').getPublicUrl(path);

      await supabase.from('profiles').update({ profile_image_url: publicUrl }).eq('id', user.id);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message ?? 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUri = preview ?? user?.profileImageUrl;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile Photo</Text>

      <TouchableOpacity activeOpacity={1} style={styles.avatarWrapper} onPress={pickImage}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Camera color="rgba(255,255,255,0.4)" size={40} />
          </View>
        )}
        <View style={styles.editBadge}>
          <Camera color={theme.colors.onPrimary} size={16} />
        </View>
      </TouchableOpacity>

      <Text style={styles.hint}>Tap the photo to select a new one</Text>

      {preview && (
        <TouchableOpacity activeOpacity={1} style={styles.uploadBtn} onPress={uploadImage} disabled={isUploading}>
          {isUploading
            ? <ActivityIndicator color={theme.colors.onPrimary} />
            : <Text style={styles.uploadBtnText}>Save Photo</Text>
          }
        </TouchableOpacity>
      )}
    </View>
  );
};

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  heading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  hint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginBottom: 32,
  },
  uploadBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  uploadBtnText: {
    color: colors.onPrimary,
    fontWeight: '900',
    fontSize: 15,
  },
});
