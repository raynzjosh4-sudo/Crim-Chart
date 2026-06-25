import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronLeft } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';
import { supabase } from '@/core/supabase/supabaseConfig';
import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { useChannelData } from '@/channel/hooks/useChannelData';
import { cloudMediaService } from '@/core/network/cloudMediaService';

export default function ChannelEditPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { channel, loading: channelLoading } = useChannelData(id as string);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      router.back();
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
        <TouchableOpacity activeOpacity={1} onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Channel</Text>
        <View style={{ width: 44 }} />
      </View>

      {channelLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}

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
          placeholderTextColor="rgba(255,255,255,0.3)"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Channel Description"
          placeholderTextColor="rgba(255,255,255,0.3)"
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
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  content: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cameraOverlay: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    padding: 18,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 120,
  },
  saveContainer: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 120,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.0,
  },
});
