import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Image, ScrollView, Platform, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { Camera, ChevronLeft } from 'lucide-react-native';
import { supabase } from '@/core/supabase/supabaseConfig';
import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { useChannelData } from '@/channel/hooks/useChannelData';
import { cloudMediaService } from '@/core/network/cloudMediaService';

export default function ChannelEditPage({ channelIdOverride }: { channelIdOverride?: string }) {
  const router = useRouter();
  const { id: routeId } = useLocalSearchParams();
  const id = channelIdOverride || routeId;
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const { channel, loading: channelLoading } = useChannelData(id as string);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const theme = useCurrentTheme();
  const styles = useStyles(useStylesHook);

  useEffect(() => {
    if (channel && !name) {
      setName(channel.title || '');
      setDescription(channel.description || '');
    }
  }, [channel]);

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    
    setIsSaving(true);
    try {
      let publicUrl = channel?.imageUrl;

      if (preview) {
        publicUrl = await cloudMediaService.uploadMedia(preview, 'channel_avatars', channel?.creatorUser?.id);
      }

      await channelRepository.updateLocalChannelSettings(id as string, {
        name: name.trim(),
        description: description.trim(),
        avatar_url: publicUrl,
      });

      Alert.alert('Success', 'Channel updated successfully!');
      if (isDesktop && channelIdOverride) {
        router.setParams({ desktopChannelView: 'settings' });
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(`/channel/settings/${id}` as any);
      }
    } catch (e: any) {
      Alert.alert('Update Failed', e?.message ?? 'Failed to update channel');
    } finally {
      setIsSaving(false);
    }
  };

  const displayAvatar = preview ?? channel?.imageUrl;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={1} onPress={() => {
          if (isDesktop && channelIdOverride) {
            router.setParams({ desktopChannelView: 'settings' });
          } else if (router.canGoBack()) {
            router.back();
          } else {
            router.replace(`/channel/settings/${id}` as any);
          }
        }} style={styles.headerButton}>
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Channel</Text>
        <View style={{ width: 44 }} />
      </View>

      {channelLoading && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity activeOpacity={1} onPress={pickImage} style={styles.avatarWrapper}>
            {displayAvatar ? (
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
            <View style={styles.cameraOverlay}>
              <Camera size={32} color="#FFD700" />
            </View>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Channel Title"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Channel Description"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.saveContainer}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStylesHook = (colors: any) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    height: 60,
    paddingHorizontal: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900' as const,
  },
  content: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.surfaceVariant,
    overflow: 'hidden' as const,
    position: 'relative' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  avatar: {
    width: '100%',
    height: '100%',
    position: 'absolute' as const,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cameraOverlay: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600' as const,
    padding: 18,
    marginBottom: 16,
    outlineStyle: 'none' as any,
  },
  textArea: {
    minHeight: 120,
  },
  saveContainer: {
    alignItems: 'flex-end' as const,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: colors.surfaceVariant,
    width: 120,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900' as const,
    letterSpacing: 1.0,
  },
});
