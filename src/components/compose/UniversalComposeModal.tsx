import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  Globe,
  Image as ImageIcon,
  Music,
  Smile,
  X
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text, TextInput, TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';

import { EmojiPickerWidget } from '@/components/EmojiPicker/EmojiPickerWidget';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useDesktopComposeStore } from '@/core/store/useDesktopComposeStore';
import { useDraftStore } from '@/core/store/useDraftStore';
import { MediaSource, MediaType, PostType, usePostingStore } from '@/core/store/usePostingStore';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import LottieView from 'lottie-react-native';
import { CoverArtSelectorSheet, CoverArtSelectorSheetRef } from '@/components/compose/CoverArtSelectorSheet';
import { OPTIONAL_EMOJIS } from '@/components/optionalEmojis';
import { AudioPreviewWidget } from './AudioPreviewWidget';
import { DraftsListModal } from './DraftsListModal';
import { MobileMediaPickerMenu } from './MobileMediaPickerMenu';
import { VideoPreviewWidget } from './VideoPreviewWidget';

export const UniversalComposeModal: React.FC = () => {
  const { isOpen, options, closeModal } = useDesktopComposeStore();
  const { user } = useAuthStore();
  const { createPost } = usePostingStore();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const coverArtSheetRef = useRef<CoverArtSelectorSheetRef | null>(null);

  const [text, setText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMobileMediaPicker, setShowMobileMediaPicker] = useState(false);
  const [showDraftsList, setShowDraftsList] = useState(false);

  // Settings states
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [shareToStatus, setShareToStatus] = useState(false);
  const [isShortClip, setIsShortClip] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setText(options?.initialText || '');
      setSelectedMedia([]);
      setIsPosting(false);
      setShowEmojiPicker(false);
      setShowMobileMediaPicker(false);
    }
  }, [isOpen, options]);

  const handleMediaOptionSelect = async (source: 'camera' | 'library', mediaType: 'image' | 'video') => {
    setShowMobileMediaPicker(false);

    const hasImage = selectedMedia.some(m => m.type === 'image');
    const hasVideo = selectedMedia.some(m => m.type === 'video');

    if (mediaType === 'video' && hasVideo) {
      ChartToast.showError(null, { title: 'Limit reached', message: 'You can only attach one video per post.' });
      return;
    }

    let result;
    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: mediaType === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: mediaType === 'image',
      quality: 0.8,
    };

    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        ChartToast.showError(null, { title: 'Permission denied', message: 'Camera access is required.' });
        return;
      }
      result = await ImagePicker.launchCameraAsync(pickerOptions);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    }

    if (!result.canceled && result.assets) {
      const newMedia = result.assets.map(asset => ({
        id: Math.random().toString(),
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        width: asset.width,
        height: asset.height,
        aspectRatio: asset.width / asset.height,
      }));
      setSelectedMedia([...selectedMedia, ...newMedia]);
    }
  };

  const pickMedia = async () => {
    if (isMobile) {
      setShowMobileMediaPicker(true);
      return;
    }

    const hasImage = selectedMedia.some(m => m.type === 'image');
    const hasVideo = selectedMedia.some(m => m.type === 'video');

    if (hasVideo) {
      ChartToast.showError(null, { title: 'Limit reached', message: 'You can only attach one video per post.' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: hasImage ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      let newAssets = result.assets;

      if (!hasImage && newAssets.some(a => a.type === 'video')) {
        newAssets = newAssets.filter(a => a.type === 'video').slice(0, 1);
      } else if (hasImage) {
        newAssets = newAssets.filter(a => a.type !== 'video');
      }

      const newMedia = newAssets.map(asset => ({
        id: Math.random().toString(),
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        width: asset.width,
        height: asset.height,
        aspectRatio: asset.width / asset.height,
      }));
      setSelectedMedia([...selectedMedia, ...newMedia]);
    }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Prepare metadata and open the cover art sheet
        const mediaMeta = {
          uri: asset.uri,
          name: asset.name,
          artist: 'Unknown Artist',
          mimeType: asset.mimeType,
        };
        coverArtSheetRef.current?.present(mediaMeta as any);
      }
    } catch (err) {
      console.log('Error picking audio:', err);
    }
  };

  const removeMedia = (id: string) => {
    setSelectedMedia(selectedMedia.filter(m => m.id !== id));
  };

  const updateMedia = (id: string, updates: any) => {
    setSelectedMedia(selectedMedia.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleEmojiSelect = (emoji: string) => {
    setText(text + emoji);
  };

  const handleLottieSelect = (source: any) => {
    const newMedia = {
      id: Math.random().toString(),
      uri: source,
      type: 'lottie',
      width: 150,
      height: 150,
      aspectRatio: 1,
    };
    setSelectedMedia([...selectedMedia, newMedia]);
    setShowEmojiPicker(false);
  };

  const handlePost = async () => {
    if (!text.trim() && selectedMedia.length === 0) return;

    setIsPosting(true);
    let primaryPostType = options?.postType || 'post';

    // On web, blob: URLs created by pickers can be revoked when the component
    // unmounts (i.e. when we closeModal). Pre-read them into real Blob objects NOW,
    // before we close the modal, so the upload always has the bytes.
    const resolveMediaItem = async (m: any) => {
      let resolvedPath: string | Blob = m.uri || m.path || '';
      let resolvedThumb: string | Blob | null = m.thumbnailUri || m.thumbnailUrl || null;

      // On web: eagerly read blob: URLs into real Blob objects before closing the
      // modal, since the browser may revoke them on unmount.
      if (Platform.OS === 'web') {
        const isLocalBlob = (uri: string) =>
          typeof uri === 'string' && (uri.startsWith('blob:') || uri.startsWith('file://'));

        if (isLocalBlob(resolvedPath as string)) {
          try {
            const resp = await fetch(resolvedPath as string);
            resolvedPath = await resp.blob();
          } catch (e) {
            console.warn('[handlePost] Failed to pre-read audio blob:', e);
          }
        }
        if (resolvedThumb && isLocalBlob(resolvedThumb as string)) {
          try {
            const resp = await fetch(resolvedThumb as string);
            resolvedThumb = await resp.blob();
          } catch (e) {
            console.warn('[handlePost] Failed to pre-read thumbnail blob:', e);
          }
        }
      }
      // On native: ph:// and content:// URIs are normalized inside cloudMediaService
      // via FileSystem.copyAsync, so no extra work is needed here.

      return {
        path: resolvedPath,
        type: m.type === 'video' ? MediaType.video : m.type === 'audio' ? MediaType.audio : MediaType.photo,
        source: MediaSource.device,
        thumbnailUrl: resolvedThumb,
        aspectRatio: m.aspectRatio,
        title: m.name || m.title,
        artist: m.artist,
        lyrics: m.lyrics,
      };
    };

    try {
      const resolvedMedia = await Promise.all(selectedMedia.map(resolveMediaItem));

      // Close modal immediately AFTER pre-reading blobs (so revocation is irrelevant)
      closeModal();

      const success = await createPost({
        media: resolvedMedia as any,
        caption: text.trim(),
        channelId: options?.targetChannelId,
        channelName: options?.channelName,
        channelAvatarUrl: options?.channelAvatarUrl,
        postType: primaryPostType,
        shareToStatus: shareToStatus,
        allowComments: allowComments,
        isPublicFeed: isPublic,
        isShortClip: selectedMedia.some((m: any) => m.type === 'video') ? isShortClip : undefined,
      });

      if (success) {
        ChartToast.showSuccess(null, { title: 'Posted successfully!', message: 'Your post is now live.' });
      } else {
        ChartToast.showError(null, { title: 'Failed to post', message: 'Something went wrong, please try again.' });
      }
    } catch (e) {
      console.error('[handlePost] Error:', e);
      ChartToast.showError(null, { title: 'Failed to post', message: 'Something went wrong, please try again.' });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveDraft = () => {
    if (!text.trim() && selectedMedia.length === 0) {
      setShowDraftsList(true);
      return;
    }
    useDraftStore.getState().saveDraft({
      text: text.trim(),
      media: selectedMedia,
      post_type: options?.postType || 'post'
    });
    ChartToast.showSuccess(null, { title: 'Draft saved offline', message: 'You can load it anytime.' });
    closeModal();
  };

  const handleSelectDraft = (draft: any) => {
    setText(draft.text || '');
    if (draft.media) {
      setSelectedMedia(draft.media);
    }
    setShowDraftsList(false);
  };

  if (!isOpen || Platform.OS !== 'web') return null;

  const hasAudio = selectedMedia.some(m => m.type === 'audio');
  const hasVideo = selectedMedia.some(m => m.type === 'video');
  const hasImageOrVideo = selectedMedia.some(m => m.type === 'image' || m.type === 'video');

  const primaryPostType = options?.postType || 'post';

  let headerTitle = "Create Post";
  let placeholderText = "What's happening?!";
  let submitButtonText = "Post";
  let showWhoCanReply = true;
  let showPublicToggle = true;
  let showShareToStatusToggle = true;
  let showDraftsButton = true;

  switch (primaryPostType) {
    case PostType.status:
      headerTitle = "New Status";
      placeholderText = "What's on your mind?";
      submitButtonText = "Share";
      showShareToStatusToggle = false;
      break;
    case PostType.channel:
    case PostType.channel_status:
      headerTitle = "Channel Post";
      placeholderText = "Share with the channel...";
      showPublicToggle = false;
      break;
    case PostType.moment:
    case PostType.channel_moment:
      headerTitle = "Share a Moment";
      placeholderText = "Share a moment...";
      submitButtonText = "Share";
      showWhoCanReply = false;
      showDraftsButton = false;
      break;
    case PostType.manifesto:
      headerTitle = "Update Manifesto";
      placeholderText = "Write your manifesto...";
      submitButtonText = "Update";
      showWhoCanReply = false;
      showDraftsButton = false;
      break;
  }

  return (
    <Modal transparent visible={isOpen} animationType="fade">
      <Pressable style={[styles.overlay, isMobile && { paddingTop: 0, padding: 0 }]} onPress={closeModal}>
        <Pressable
          style={[
            styles.modalContainer,
            isMobile && {
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              maxHeight: '100%',
              borderRadius: 0,
              borderWidth: 0,
            }
          ]}
          onPress={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <TouchableOpacity onPress={closeModal} style={styles.iconButton}>
                <X size={20} color="#FFF" />
              </TouchableOpacity>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 16 }}>{headerTitle}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {hasVideo && (
                <View style={styles.videoChipsContainer}>
                  <TouchableOpacity
                    style={[styles.videoChip, isShortClip && styles.videoChipActive]}
                    onPress={() => setIsShortClip(true)}
                  >
                    <Text style={[styles.videoChipText, isShortClip && styles.videoChipTextActive]}>Short clip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.videoChip, !isShortClip && styles.videoChipActive]}
                    onPress={() => setIsShortClip(false)}
                  >
                    <Text style={[styles.videoChipText, !isShortClip && styles.videoChipTextActive]}>Long clip</Text>
                  </TouchableOpacity>
                </View>
              )}

              {showDraftsButton && (
                <TouchableOpacity onPress={handleSaveDraft}>
                  <Text style={styles.draftsText}>Drafts</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <View style={styles.inputRow}>
              <Image
                source={{ uri: user?.profileImageUrl || 'https://i.pravatar.cc/150?img=11' }}
                style={styles.avatar as any}
              />
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder={placeholderText}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  value={text}
                  onChangeText={setText}
                  autoFocus
                />

                {selectedMedia.length > 0 && (
                  <ScrollView horizontal style={styles.mediaPreviewContainer}>
                    {selectedMedia.map(media => (
                      <View key={media.id} style={media.type === 'audio' ? styles.audioPreviewContainer : media.type === 'video' ? styles.videoPreviewContainer : styles.mediaPreview}>
                        {media.type === 'lottie' ? (
                          <LottieView
                            source={media.uri}
                            autoPlay
                            loop
                            style={styles.mediaImage as any}
                            resizeMode="contain"
                          />
                        ) : media.type === 'video' ? (
                          <VideoPreviewWidget media={media} />
                        ) : media.type === 'audio' ? (
                          <AudioPreviewWidget
                            media={media}
                            onRemove={removeMedia}
                            onUpdate={updateMedia}
                          />
                        ) : (
                          <Image source={typeof media.uri === 'string' ? { uri: media.uri } : media.uri} style={styles.mediaImage as any} />
                        )}
                        <TouchableOpacity style={styles.removeMediaBtn} onPress={() => removeMedia(media.id)}>
                          <X size={14} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            {showWhoCanReply && (
              <TouchableOpacity style={styles.replyIndicatorRow} onPress={() => setShowSettingsMenu(true)}>
                <Globe size={16} color={colors.primary} />
                <Text style={styles.replyIndicatorText}>Who can reply?</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {showEmojiPicker && (
            <>
              <Pressable
                style={[StyleSheet.absoluteFillObject, { zIndex: 9998, cursor: 'default' as any }]}
                onPress={() => setShowEmojiPicker(false)}
              />
              <View style={styles.emojiPickerContainer}>
                <EmojiPickerWidget
                  onEmojiSelect={handleEmojiSelect}
                  onLottieSelect={handleLottieSelect}
                />
              </View>
            </>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.toolbar}>
              <TouchableOpacity
                style={[styles.iconButton, hasAudio && { opacity: 0.5 }]}
                onPress={pickMedia}
                disabled={hasAudio}
              >
                <ImageIcon size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Smile size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, hasImageOrVideo && { opacity: 0.5 }]}
                onPress={pickAudio}
                disabled={hasImageOrVideo}
              >
                <Music size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.postActions}>
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (!text.trim() && selectedMedia.length === 0) && styles.postButtonDisabled
                ]}
                onPress={handlePost}
                disabled={isPosting || (!text.trim() && selectedMedia.length === 0)}
              >
                {isPosting ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.postButtonText}>{submitButtonText}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Post Settings Popover */}
          {showSettingsMenu && showWhoCanReply && (
            <>
              <Pressable
                style={[StyleSheet.absoluteFillObject, { zIndex: 9998, cursor: 'default' as any }]}
                onPress={() => setShowSettingsMenu(false)}
              />
              <View style={styles.settingsDropdown}>
                <Text style={styles.settingsTitle}>Who can reply?</Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingText}>Allow comments</Text>
                  <Switch
                    value={allowComments}
                    onValueChange={setAllowComments}
                    trackColor={{ false: '#3A3A3C', true: colors.primary }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#3A3A3C"
                    style={[Platform.OS === 'web' && { cursor: 'pointer' as any }, { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }]}
                  />
                </View>

                {showPublicToggle && (
                  <View style={styles.settingRow}>
                    <Text style={styles.settingText}>Public</Text>
                    <Switch
                      value={isPublic}
                      onValueChange={setIsPublic}
                      trackColor={{ false: '#3A3A3C', true: colors.primary }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#3A3A3C"
                      style={[Platform.OS === 'web' && { cursor: 'pointer' as any }, { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }]}
                    />
                  </View>
                )}

                {showShareToStatusToggle && (
                  <View style={styles.settingRow}>
                    <Text style={styles.settingText}>Share to status</Text>
                    <Switch
                      value={shareToStatus}
                      onValueChange={setShareToStatus}
                      trackColor={{ false: '#3A3A3C', true: colors.primary }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#3A3A3C"
                      style={[Platform.OS === 'web' && { cursor: 'pointer' as any }, { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }]}
                    />
                  </View>
                )}
              </View>
            </>
          )}

          <MobileMediaPickerMenu
            visible={showMobileMediaPicker}
            onClose={() => setShowMobileMediaPicker(false)}
            onSelectOption={handleMediaOptionSelect}
          />

          <DraftsListModal
            visible={showDraftsList}
            onClose={() => setShowDraftsList(false)}
            onSelectDraft={handleSelectDraft}
          />

          <CoverArtSelectorSheet
            ref={coverArtSheetRef}
            onSelectArtwork={(media, artworkUrl) => {
              const newMedia = {
                id: Math.random().toString(),
                uri: media.uri,
                type: 'audio',
                name: media.name,
                artist: media.artist || 'Unknown Artist',
                thumbnailUri: artworkUrl,
                mimeType: media.mimeType,
              };
              setSelectedMedia([...selectedMedia, newMedia]);
              
              if (!text.trim()) {
                let randomEmojis = '';
                for(let i=0; i<4; i++) randomEmojis += OPTIONAL_EMOJIS[Math.floor(Math.random() * OPTIONAL_EMOJIS.length)];
                setText(`${media.name || ''} by ${media.artist || 'Unknown Artist'} ${randomEmojis}`);
              }
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '5%',
  },
  modalContainer: {
    width: 600,
    maxWidth: '90%',
    backgroundColor: '#000',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'visible',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 53,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  draftsText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  inputContainer: {
    flex: 1,
    paddingTop: 8,
  },
  textInput: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '400',
    minHeight: 100,
    outlineStyle: 'none' as any,
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  audioPreviewContainer: {
    marginRight: 12,
    position: 'relative',
  },
  videoPreviewContainer: {
    marginRight: 12,
    position: 'relative',
  },
  mediaPreview: {
    width: 250,
    height: 300,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 52, // Align with text input (40 avatar + 12 margin)
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  replyIndicatorText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  toolbar: {
    flexDirection: 'row',
    marginLeft: 36, // roughly align
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiPickerContainer: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
  settingsDropdown: {
    position: 'absolute',
    left: 20,
    bottom: 70,
    width: 320,
    backgroundColor: '#000',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 20,
    zIndex: 9999,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  settingsTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  videoChipsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
  },
  videoChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'transparent',
  },
  videoChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  videoChipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  videoChipTextActive: {
    color: '#000',
  },
});
