import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { ChartLinearLoader } from '@/components/CrimchartLoader/ChartLinearLoader';
import { cloudMediaService } from '@/core/network/cloudMediaService';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BoxCategory } from '../../components/CreateBoxSheet';
import { useBoxStore } from '../../application/useBoxStore';

export const CreateBoxPage: React.FC = () => {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: BoxCategory }>();
  const boxType = type || 'audio';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined);

  // Settings
  const [allowSubmissions, setAllowSubmissions] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const user = useAuthStore(s => s.user);
  const addBox = useBoxStore(s => s.addBox);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCoverImageUrl(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !user || isCreating) return;

    setIsCreating(true);
    try {
      let finalImageUrl: string | null = null;
      if (coverImageUrl) {
        // Upload image to Cloudflare R2
        finalImageUrl = await cloudMediaService.uploadMedia(coverImageUrl, 'box_covers', user.id);
      }

      // Insert Box into Supabase
      const { data, error } = await supabase.from('boxes').insert({
        owner_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        box_type: boxType,
        allow_submissions: allowSubmissions,
        is_public: isPublic,
        metadata: {
          coverImageUrl: finalImageUrl,
        }
      }).select().single();

      if (error) throw error;

      // Normalize box type for UI
      let mappedType = data.box_type;
      if (mappedType === 'audio') mappedType = 'music';
      if (mappedType === 'video') mappedType = 'movie';
      if (mappedType === 'marketplace') mappedType = 'store';
      if (mappedType === 'contest') mappedType = 'voting';

      // Add instantly to local store
      addBox(user.id, {
        id: data.id,
        title: data.title,
        boxType: mappedType as any,
        coverImageUrl: data.metadata?.coverImageUrl,
        itemCount: 0
      });

      ChartToast.showSuccess(null, { title: 'Box Created!', message: 'Your new box is ready.' });
      router.back();
    } catch (e: any) {
      console.error('[CreateBoxPage] Creation error:', e);
      ChartToast.showError(null, { title: 'Failed to create box', message: e.message || 'An unknown error occurred.' });
    } finally {
      setIsCreating(false);
    }
  };

  // Dynamic UI configuration based on Box Type
  const getConfig = () => {
    switch (boxType) {
      case 'audio':
        return {
          header: 'New Audio Box',
          bannerTitle: 'Curate Your Sound',
          bannerSub: 'Create a collection of music, podcasts, or voice notes.',
          accent: '#1DB954',
          illustration: require('../../../../../assets/illustrations/undraw_happy_fsrv.svg')
        };
      case 'video':
        return {
          header: 'New Video Box',
          bannerTitle: 'Curate Your Screen',
          bannerSub: 'Create a collection of movies, series, or short clips.',
          accent: '#E50914',
          illustration: require('../../../../../assets/illustrations/undraw_relaxing-outdoors_s653.svg')
        };
      case 'marketplace':
        return {
          header: 'New Storefront',
          bannerTitle: 'Setup Your Store',
          bannerSub: 'Create a space for selling, swapping, or bidding.',
          accent: '#FF9900',
          illustration: require('../../../../../assets/illustrations/undraw_handshake-deal_nwk6.svg')
        };
      case 'sports':
        return {
          header: 'New Sports Box',
          bannerTitle: 'Curate Highlights',
          bannerSub: 'Create a collection of matches, scores, and brackets.',
          accent: '#00529B',
          illustration: require('../../../../../assets/illustrations/undraw_counting-stars_1fur.svg')
        };
      case 'contest':
        return {
          header: 'New Contest Box',
          bannerTitle: 'Start a Competition',
          bannerSub: 'Create a space for polls, ratings, and community voting.',
          accent: '#9C27B0',
          illustration: require('../../../../../assets/illustrations/undraw_social-media_25ev.svg')
        };
      default:
        return {
          header: 'New Box',
          bannerTitle: 'Create a Box',
          bannerSub: 'Curate a new collection.',
          accent: '#FACD11',
          illustration: require('../../../../../assets/illustrations/undraw_social-media_25ev.svg')
        };
    }
  };

  const config = getConfig();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* App Bar */}
      <View style={styles.appBar}>
        <CrimchartBackButton onPress={() => router.back()} color="#FFF" />
        <Text style={styles.appBarTitle}>{config.header}</Text>
        <View style={{ width: 36 }} /> {/* Spacer to center title */}
      </View>

      <ChartLinearLoader isLoading={isCreating} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Header Banner */}
          <View style={styles.bannerContainer}>
            <Image
              source={config.illustration}
              style={{ width: 180, height: 140, marginBottom: 16 }}
              contentFit="contain"
            />
            <Text style={styles.bannerTitle}>{config.bannerTitle}</Text>
            <Text style={styles.bannerSubtitle}>{config.bannerSub}</Text>
          </View>

          {/* Cover Image Picker */}
          <View style={styles.thumbnailSection}>
            <TouchableOpacity style={styles.thumbnailBtn} onPress={handlePickImage} activeOpacity={0.8}>
              {coverImageUrl ? (
                <>
                  <Image source={{ uri: coverImageUrl }} style={styles.thumbnailImg} />
                  <View style={[styles.editBadge, { backgroundColor: config.accent }]}>
                    <Camera color="#FFF" size={14} />
                  </View>
                </>
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <ImageIcon color="rgba(255,255,255,0.3)" size={36} />
                  <View style={[styles.editBadge, { backgroundColor: config.accent }]}>
                    <Camera color="#FFF" size={14} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.thumbnailHelper}>Tap to add cover art</Text>
          </View>

          {/* Inputs */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Box Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.minimalInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Summer Hits 2026"
                placeholderTextColor="rgba(255,255,255,0.2)"
                selectionColor={config.accent}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description <Text style={{ color: 'rgba(255,255,255,0.3)' }}>(Optional)</Text></Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.minimalInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="What kind of content is in here?"
                placeholderTextColor="rgba(255,255,255,0.2)"
                multiline
                textAlignVertical="top"
                selectionColor={config.accent}
              />
            </View>
          </View>

          {/* Settings Section (No Card) */}
          <Text style={styles.inputLabel}>Permissions</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Allow Community Submissions</Text>
              <Text style={styles.settingSubtitle}>Let other users link their posts to your box.</Text>
            </View>
            <Switch
              value={allowSubmissions}
              onValueChange={setAllowSubmissions}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: `${config.accent}80` }}
              thumbColor={allowSubmissions ? config.accent : '#FFF'}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Public Box</Text>
              <Text style={styles.settingSubtitle}>Make this box visible on your profile.</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: `${config.accent}80` }}
              thumbColor={isPublic ? config.accent : '#FFF'}
            />
          </View>

          <Text style={styles.permissionsHelperText}>
            You can always update these permissions and configure additional settings (like age limits and country restrictions) later from Profile {'>'} Settings {'>'} Box Visibility.
          </Text>

        </ScrollView>

        {/* Sticky Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createBtn, (!title.trim() || isCreating) ? styles.createBtnDisabled : { backgroundColor: config.accent }]}
            activeOpacity={0.8}
            onPress={handleCreate}
            disabled={!title.trim() || isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[styles.createBtnText, !title.trim() && styles.createBtnTextDisabled]}>
                Create Box
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  keyboardView: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 48, // safe area spacing roughly
  },
  appBarTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  bannerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: '80%',
  },
  thumbnailSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  thumbnailBtn: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
  },
  thumbnailHelper: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
  },
  editBadge: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0D0D0D',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  minimalInput: {
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
  },
  permissionsHelperText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 40, // bottom safe area
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#0D0D0D',
  },
  createBtn: {
    borderRadius: 100,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  createBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  createBtnTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
});
