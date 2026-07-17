import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { CircleDot, Hash, Settings } from 'lucide-react-native';

import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { PostType, usePostingStore } from '@/core/store/usePostingStore';

import { AdvancedSettingsSheet } from './finalpostpage/widgets/AdvancedSettingsSheet';
import { FinalizeCaptionSection } from './finalpostpage/widgets/FinalizeCaptionSection';
import { FinalizeListTile, FinalizeSwitchTile } from './finalpostpage/widgets/FinalizeTiles';
import { SelectChannelBottomSheet } from './finalpostpage/widgets/SelectChannelBottomSheet';

const { width } = Dimensions.get('window');

export const VideoTrimmerPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const selectedMediaJson = params.selectedMediaJson as string | undefined;
  const stagingMedia = usePostingStore((s) => s.stagingMedia);
  const selectedMedia = selectedMediaJson ? JSON.parse(selectedMediaJson) : (stagingMedia.length > 0 ? stagingMedia : []);
  const videoItem = selectedMedia[0];

  const targetChannelId = params.targetChannelId as string | undefined;
  const isChannelPost = params.isChannelPost === 'true';
  const isChannelStatus = params.isChannelStatus === 'true';
  const isChannelMoment = params.isChannelMoment === 'true';
  const isGlobalStatus = params.isGlobalStatus === 'true';
  const isManifesto = !!targetChannelId && !isChannelPost && !isChannelStatus && !isChannelMoment;

  const channelName = params.channelName as string | undefined;
  const channelAvatarUrl = params.channelAvatarUrl as string | undefined;

  const { createPost } = usePostingStore();

  const [postFormat, setPostFormat] = useState<'short' | 'long' | 'text'>('short');
  const [caption, setCaption] = useState('');
  const [shareToStatus, setShareToStatus] = useState(false);
  
  const [isChannelSheetVisible, setIsChannelSheetVisible] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  
  const [isAdvancedSettingsVisible, setIsAdvancedSettingsVisible] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Video Player
  const player = useVideoPlayer(videoItem?.path, player => {
    player.loop = true;
    player.play();
  });

  const handleChannelSelect = (id: string) => {
    const newChannels = selectedChannels.includes(id)
      ? selectedChannels.filter(c => c !== id)
      : [...selectedChannels, id];
    setSelectedChannels(newChannels);
  };

  const handlePost = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    let primaryPostType = 'feed';
    if (isManifesto) primaryPostType = PostType.manifesto;
    if (isChannelPost) primaryPostType = PostType.channel;
    if (isChannelStatus) primaryPostType = PostType.channel_status;
    if (isChannelMoment) primaryPostType = PostType.channel_moment;
    if (isGlobalStatus) primaryPostType = PostType.status;

    // If 'text' is selected, ignore media. Otherwise use videoItem
    const mediaToUpload = postFormat === 'text' ? [] : [videoItem];

    const postParams = {
      media: mediaToUpload,
      caption,
      channelId: targetChannelId,
      channelName,
      channelAvatarUrl,
      postType: primaryPostType,
      shareToStatus: false,
      allowComments,
      isPublicFeed: isPublic,
      aspectRatio: mediaToUpload.length > 0 ? mediaToUpload[0].aspectRatio : undefined,
      isShortClip: postFormat === 'short',
    };

    // ─── Navigate immediately — the pending post is already visible in the feed ───
    if (targetChannelId && (isChannelPost || isChannelStatus || isChannelMoment || isManifesto)) {
      router.replace({ pathname: '/channel/channelpage', params: { id: targetChannelId } } as any);
    } else {
      router.replace('/');
    }

    // ─── Fire upload in the background — no await, no waiting ───
    createPost(postParams).then(async (success) => {
      if (!success) {
        console.error('[VideoTrimmerPage] Background upload failed:', usePostingStore.getState().errorMessage);
        return;
      }
      if (shareToStatus && !isManifesto) {
        await createPost({
          media: mediaToUpload,
          caption,
          postType: PostType.status,
          shareToStatus: true,
          allowComments,
          isPublicFeed: isPublic,
          isShortClip: postFormat === 'short',
        });
      }
    }).catch((e) => {
      console.error('[VideoTrimmerPage] Unhandled upload error:', e);
    }).finally(() => {
      setIsSubmitting(false); // Only unlocks if navigation fails or is extremely slow
    });
  };


  return (
    <View style={styles.root}>
      <ChartAppBar
        title="Compose"
        onBack={() => router.back()}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Video Preview */}
        {postFormat !== 'text' && videoItem && (
          <View style={styles.videoContainer}>
            <VideoView 
              style={styles.video} 
              player={player} 
              allowsFullscreen={false} 
              allowsPictureInPicture={false} 
              contentFit="cover"
            />
          </View>
        )}

        {/* Format Chips */}
        <View style={styles.chipsContainer}>
          {['short', 'long', 'text'].map((fmt) => {
            const isActive = postFormat === fmt;
            return (
              <TouchableOpacity
                key={fmt}
                onPress={() => setPostFormat(fmt as any)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {fmt === 'short' ? 'Short Clip' : fmt === 'long' ? 'Long Video' : 'Text'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Caption */}
        <FinalizeCaptionSection
          caption={caption}
          onChangeText={setCaption}
        />

        <View style={styles.spacing} />

        {/* Settings */}
        {!isGlobalStatus && (
          <FinalizeSwitchTile
            icon={<CircleDot color="rgba(255,255,255,0.7)" size={22} />}
            title="Share to Status"
            value={shareToStatus}
            onChanged={setShareToStatus}
          />
        )}

        {!isManifesto && !isChannelStatus && !isChannelMoment && !isGlobalStatus && (
          <FinalizeListTile
            icon={<Hash color="rgba(255,255,255,0.7)" size={22} />}
            title={selectedChannels.length === 0 ? 'Tag in Channel' : `Tag in Channel (${selectedChannels.length} selected)`}
            onTap={() => setIsChannelSheetVisible(true)}
          />
        )}

        <View style={styles.spacingSmall} />

        {!isGlobalStatus && (
          <FinalizeListTile
            icon={<Settings color="rgba(255,255,255,0.7)" size={22} />}
            title="Advanced Settings"
            onTap={() => setIsAdvancedSettingsVisible(true)}
          />
        )}
        
        <View style={styles.bottomSpacing} />

        {/* Small Post Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.postButtonBig, isSubmitting && { opacity: 0.5 }]} 
            onPress={handlePost} 
            disabled={isSubmitting} 
            activeOpacity={0.8}
          >
            <Text style={styles.postButtonTextBig}>{isSubmitting ? '...' : 'POST'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Sheets */}
      <AdvancedSettingsSheet
        visible={isAdvancedSettingsVisible}
        onClose={() => setIsAdvancedSettingsVisible(false)}
        isPublic={isPublic}
        allowComments={allowComments}
        onPublicChanged={setIsPublic}
        onAllowCommentsChanged={setAllowComments}
      />

      <SelectChannelBottomSheet
        visible={isChannelSheetVisible}
        onClose={() => setIsChannelSheetVisible(false)}
        selectedChannels={selectedChannels}
        onToggleChannel={handleChannelSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  videoContainer: {
    width: width,
    height: width * 1.2, // 4:5 ratio or dynamic
    backgroundColor: '#000',
    marginBottom: 16,
  },
  video: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#222',
  },
  chipActive: {
    backgroundColor: '#FACD11',
  },
  chipText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#000',
  },
  postButtonSmall: {
    backgroundColor: '#FACD11',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonTextSmall: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12,
  },
  postButtonBig: {
    backgroundColor: '#FACD11',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonTextBig: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
  },
  spacing: { height: 16 },
  spacingSmall: { height: 8 },
  bottomSpacing: { height: 24 },
  footer: {
    width: '100%',
    paddingBottom: 24,
  },
});
