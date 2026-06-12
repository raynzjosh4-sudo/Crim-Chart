import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings2,
  MessageCircle,
  Globe,
  Sparkles,
  History,
  X,
} from 'lucide-react-native';
import { Image } from 'expo-image';
// import { Audio } from 'expo-av';
// Stubbing Audio to prevent native module crash in Expo Go
const Audio: any = {
  Recording: class {
    prepareToRecordAsync() {}
    startAsync() {}
    stopAndUnloadAsync() {}
    getURI() { return 'dummy-uri'; }
  },
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  setAudioModeAsync: async () => {},
  AndroidOutputFormat: {},
  AndroidAudioEncoder: {},
  IOSOutputFormat: {},
  IOSAudioQuality: {},
};

import { useLocalization } from '@/core/localization/LocalizationProvider';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { usePostingStore, MediaItem, MediaType, MediaSource, PostType } from '@/core/store/usePostingStore';
import { MediaData, MediaType as LegacyMediaType } from '@/components/media/types';
import CrimchartUserAvatarImage from '@/components/avatar/CrimchartUserAvatarImage';
import CommentInputField from './CommentInputField';
import YourDataTab from '@/components/tabs/YourDataTab';
import DeviceMediaTab from '@/components/media/DeviceMediaTab';
import GifSelectionTab from '@/components/media/GifSelectionTab';
import CrimChartMemberTab from '@/components/tabs/CrimChartMemberTab';

export interface CommentingSheetProps {
  visible: boolean;
  onClose: () => void;
  channelId?: string;
  channelName?: string;
  commentCount?: string;
  onCommentPosted?: (data?: any) => void;
  onMediaSelected?: (item: MediaData) => void;
  showInputField?: boolean;
  isStatus?: boolean;
  isMoment?: boolean;
  showPostSettings?: boolean;
  isRepost?: boolean;
  isEmbedded?: boolean;
  linkedPostId?: string;
  linkedAuthorUsername?: string;
  linkedCaption?: string;
  linkedChannelId?: string;
  linkedThumbnailUrl?: string;
}

const TABS = ['gallery_tab', 'device_tab', 'gif_tab', 'members_tab'] as const;

export default function CommentingSheet({
  visible,
  onClose,
  channelId,
  channelName,
  commentCount = '0',
  onCommentPosted,
  onMediaSelected,
  showInputField = true,
  isStatus = false,
  isMoment = false,
  showPostSettings = false,
  isRepost = false,
  isEmbedded = false,
  linkedPostId,
  linkedAuthorUsername,
  linkedCaption,
  linkedChannelId,
  linkedThumbnailUrl,
}: CommentingSheetProps) {
  const { tr } = useLocalization();
  const { height } = useWindowDimensions();
  const { user } = useAuthStore();
  const { createPost } = usePostingStore();

  // Input
  const [commentText, setCommentText] = useState('');

  // Selected media
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaData[]>([]);

  // Active tab
  const [activeTab, setActiveTab] = useState(0);

  // Post settings
  const [allowComments, setAllowComments] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [shareToMoment, setShareToMoment] = useState(false);
  const [shareToStatus, setShareToStatus] = useState(isStatus);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Recording
  const recordingRef = useRef<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // ─── Audio Recording ────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        isMeteringEnabled: false,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 24000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.LOW,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 24000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (e) {
      console.error('Failed to start recording:', e);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (!recordingRef.current) return;
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      if (uri) {
        handlePost(uri);
      }
    } catch (e) {
      console.error('Failed to stop recording:', e);
      setIsRecording(false);
    }
  }, [commentText, selectedMedia]);

  // ─── Media Selection ────────────────────────────────────────────────────────

  const onMediaTap = (index: number, item: MediaData) => {
    if (onMediaSelected) {
      onMediaSelected(item);
      onClose();
      return;
    }

    if (selectedIndices.includes(index)) {
      setSelectedMedia(selectedMedia.filter(x => x.contentUrl !== item.contentUrl));
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedMedia([...selectedMedia, item]);
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  // ─── Post Handling ──────────────────────────────────────────────────────────

  const handlePost = async (recordedAudioPath?: string) => {
    const caption = commentText.trim();
    if (!caption && selectedMedia.length === 0 && !recordedAudioPath) return;
    // Removed if (!user) return; so it works in dummy mode

    const items: MediaItem[] = [];

    for (const mediaItem of selectedMedia) {
      const isLocal = !mediaItem.contentUrl.startsWith('http');
      items.push({
        path: mediaItem.contentUrl,
        type: mediaItem.type === LegacyMediaType.video ? MediaType.video : MediaType.photo,
        source: isLocal ? MediaSource.device : MediaSource.gallery,
        thumbnailUrl: mediaItem.thumbnailUrl,
        linkedPostId: isLocal ? undefined : mediaItem.postId,
        aspectRatio: mediaItem.aspectRatio,
      });
    }

    if (recordedAudioPath) {
      items.push({
        path: recordedAudioPath,
        type: MediaType.audio,
        source: MediaSource.device,
      });
    }

    // Smart routing
    let postType: string = PostType.channel;
    if (isMoment) {
      postType = PostType.moment;
    } else if (isStatus) {
      postType = PostType.status;
    } else if (isRepost) {
      postType = PostType.repost;
    } else if (linkedPostId) {
      postType = PostType.comment;
    } else if (channelId && channelId !== 'general') {
      postType = PostType.manifesto;
    }

    await createPost({
      media: items,
      caption,
      channelId,
      channelName,
      isMyChannel: false,
      postType,
      shareToStatus,
      allowComments,
      isPublicFeed: isPublic,
      shareToMoment,
      linkedPostId,
      linkedAuthorUsername,
      linkedCaption,
      linkedChannelId,
      linkedThumbnailUrls: linkedThumbnailUrl ? [linkedThumbnailUrl] : undefined,
      aspectRatio: items[0]?.aspectRatio,
    });

    onCommentPosted?.({ media: items, caption });
    onClose();
  };

  // ─── Settings Dropdown ──────────────────────────────────────────────────────

  const renderSettingsModal = () => (
    <Modal
      visible={settingsVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setSettingsVisible(false)}
    >
      <TouchableOpacity
        style={styles.settingsOverlay}
        activeOpacity={1}
        onPress={() => setSettingsVisible(false)}
      >
        <View style={[styles.settingsMenu, { backgroundColor: colors.surface }]}>
          {[
            { title: 'Allow Comments', value: allowComments, setter: setAllowComments, Icon: MessageCircle },
            { title: 'Public Post', value: isPublic, setter: setIsPublic, Icon: Globe },
            { title: 'Share as Moment', value: shareToMoment, setter: setShareToMoment, Icon: Sparkles },
            { title: 'Share to Status', value: shareToStatus, setter: setShareToStatus, Icon: History },
          ].map(({ title, value, setter, Icon }) => (
            <View key={title} style={styles.settingRow}>
              <Icon color={value ? colors.primary : 'rgba(255,255,255,0.5)'} size={18} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{title}</Text>
              <Switch
                value={value}
                onValueChange={setter}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.primary }}
                thumbColor="white"
                style={{ transform: [{ scaleX: 0.65 }, { scaleY: 0.65 }] }}
              />
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  const tabLabels = [
    tr('gallery_tab') || 'Gallery',
    tr('device_tab') || 'Device',
    tr('gif_tab') || 'GIFs',
    tr('members_tab') || 'Members',
  ];

  const content = (
    <View
      style={[
        styles.sheet,
        { height: height * 0.85, backgroundColor: colors.surface, flexDirection: 'column' },
        isEmbedded && { borderTopLeftRadius: 24, borderTopRightRadius: 24, flex: 1, height: '100%' }
      ]}
    >
      {/* Drag Handle */}
      <View style={styles.handle} />

      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text
          style={[
            styles.title,
            { color: isRecording ? '#FF4B4B' : colors.text },
          ]}
        >
          {isRecording
            ? tr('recording') || 'Recording...'
            : isStatus
            ? 'Post Status'
            : tr('select_media') || 'Select Media'}
        </Text>
        <View style={styles.titleActions}>
          {showPostSettings && (
            <TouchableOpacity
              onPress={() => setSettingsVisible(true)}
              style={[styles.settingsBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
            >
              <Settings2 color={colors.primary} size={20} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color={colors.text} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Replying To Banner */}
      {linkedPostId && (
        <View
          style={[
            styles.replyBanner,
            {
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderLeftColor: colors.primary,
            },
          ]}
        >
          {linkedThumbnailUrl && (
            <View style={styles.replyThumb}>
              <CrimchartUserAvatarImage
                url={linkedThumbnailUrl}
                width={40}
                height={40}
                borderRadius={8}
                fit="cover"
              />
            </View>
          )}
          <View style={styles.replyContent}>
            <Text style={[styles.replyLabel, { color: colors.primary }]}>
              {isRepost
                ? `Tagging ${linkedAuthorUsername ?? 'Original'}`
                : `Replying to ${linkedAuthorUsername ?? 'Original'}`}
            </Text>
            <Text
              style={[styles.replyCaption, { color: 'rgba(255,255,255,0.7)' }]}
              numberOfLines={1}
            >
              {linkedCaption || 'Shared Media'}
            </Text>
          </View>
        </View>
      )}

      {/* Tab Bar */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {tabLabels.map((label, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveTab(i)}
              style={styles.tabItem}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: activeTab === i ? colors.primary : 'rgba(255,255,255,0.4)',
                    fontWeight: activeTab === i ? '900' : '700',
                  },
                ]}
              >
                {label}
              </Text>
              {activeTab === i && (
                <View
                  style={[styles.tabIndicator, { backgroundColor: colors.primary }]}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 0 && (
          <YourDataTab
            selectedIndices={selectedIndices}
            onMediaTap={onMediaTap}
          />
        )}
        {activeTab === 1 && (
          <DeviceMediaTab
            selectedIndices={selectedIndices}
            onMediaTap={onMediaTap}
          />
        )}
        {activeTab === 2 && (
          <GifSelectionTab
            selectedIndices={selectedIndices}
            onMediaTap={onMediaTap}
          />
        )}
        {activeTab === 3 && <CrimChartMemberTab />}
      </View>

      {/* Selected Media Previews */}
      {selectedMedia.length > 0 && (
        <View style={{ maxHeight: 72, paddingHorizontal: 20, marginBottom: 8, marginTop: 4 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedMedia.map((m, idx) => (
              <View key={`${m.contentUrl}-${idx}`} style={{ marginRight: 8, position: 'relative' }}>
                <Image
                  source={{ uri: m.thumbnailUrl || m.contentUrl }}
                  style={{ width: 64, height: 64, borderRadius: 8 }}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: 10,
                    padding: 2,
                  }}
                  onPress={() => onMediaTap(selectedIndices[idx], m)}
                >
                  <X size={12} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Field */}
      <CommentInputField
        controller={{ value: commentText, onChange: setCommentText }}
        userImageUrl={user?.profileImageUrl}
        hasMedia={selectedMedia.length > 0}
        onSend={() => handlePost()}
        onLongPressStart={startRecording}
        onLongPressEnd={stopRecording}
        showTextField={showInputField}
      />
      {renderSettingsModal()}
    </View>
  );

  if (isEmbedded) {
    return visible ? content : null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        {content}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 4,
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  replyThumb: {
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  replyContent: { flex: 1 },
  replyLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  replyCaption: {
    fontSize: 13,
  },
  tabBarWrapper: {
    height: 44,
  },
  tabBar: {
    paddingHorizontal: 20,
    gap: 4,
    alignItems: 'center',
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    position: 'relative',
    marginRight: 4,
    height: 44,
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 13,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
  },
  tabContent: { flex: 1, overflow: 'hidden' },
  settingsOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 120,
    paddingRight: 20,
  },
  settingsMenu: {
    borderRadius: 20,
    padding: 16,
    minWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
});


