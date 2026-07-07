import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleDot, Hash, Save, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useDraftStore } from '@/core/store/useDraftStore';
import { PostType, usePostingStore } from '@/core/store/usePostingStore';
import { AdvancedSettingsSheet } from './widgets/AdvancedSettingsSheet';
import { FinalizeCaptionSection } from './widgets/FinalizeCaptionSection';
import { FinalizeMediaPreview } from './widgets/FinalizeMediaPreview';
import { FinalizeShareButton } from './widgets/FinalizeShareButton';
import { FinalizeListTile, FinalizeSwitchTile } from './widgets/FinalizeTiles';
import { SelectChannelBottomSheet } from './widgets/SelectChannelBottomSheet';
import { VideoFormatSelector } from './widgets/VideoFormatSelector';

// Removed dummy channels as they are now fetched internally
// We mock the posting controller state for the UI translation
export const FinalizePostPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const selectedMediaJson = params.selectedMediaJson as string | undefined;
  const selectedMedia = selectedMediaJson ? JSON.parse(selectedMediaJson) : [];
  const targetChannelId = params.targetChannelId as string | undefined;
  const isManifestoContext = params.isManifestoContext === 'true';
  const isChannelPost = params.isChannelPost === 'true';
  const isChannelStatus = params.isChannelStatus === 'true';
  const isChannelMoment = params.isChannelMoment === 'true';
  const isGlobalStatus = params.isGlobalStatus === 'true';

  const channelName = params.channelName as string | undefined;
  const channelAvatarUrl = params.channelAvatarUrl as string | undefined;

  const draftId = params.draftId as string | undefined;
  const initialCaption = params.initialCaption as string | undefined;

  const { createPost } = usePostingStore();

  const [caption, setCaption] = useState(initialCaption || '');
  const [shareToStatus, setShareToStatus] = useState(false);
  const [isChannelSheetVisible, setIsChannelSheetVisible] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const [isAdvancedSettingsVisible, setIsAdvancedSettingsVisible] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);

  const [isPosting, setIsPosting] = useState(false);
  const [isShortClip, setIsShortClip] = useState(true);

  // If none of the new flags are set, but targetChannelId is present, it's a legacy manifesto
  const isManifesto = !!targetChannelId && !isChannelPost && !isChannelStatus && !isChannelMoment;
  const hasVideo = selectedMedia.some((m: any) => m.type === 'video');

  const handleChannelSelect = (id: string) => {
    const newChannels = selectedChannels.includes(id)
      ? selectedChannels.filter(c => c !== id)
      : [...selectedChannels, id];
    setSelectedChannels(newChannels);
  };

  const handleSaveDraft = () => {
    let primaryPostType = 'post';
    if (isManifesto) primaryPostType = PostType.manifesto;
    if (isChannelPost) primaryPostType = PostType.channel;
    if (isChannelStatus) primaryPostType = PostType.channel_status;
    if (isChannelMoment) primaryPostType = PostType.channel_moment;
    if (isGlobalStatus) primaryPostType = PostType.status;

    useDraftStore.getState().saveDraft({
      text: caption.trim(),
      media: selectedMedia,
      post_type: primaryPostType
    });
    ChartToast.showSuccess(null, { title: 'Draft saved offline', message: 'You can load it anytime.' });
    router.push('/(tabs)');
  };

  const handlePost = async () => {
    console.log('[FinalizePostPage] Starting handlePost...');
    console.log('[FinalizePostPage] Inputs:', { caption, targetChannelId, isChannelPost, isChannelStatus, isManifesto, shareToStatus, allowComments, isPublic, selectedChannelsLength: selectedChannels.length });

    setIsPosting(true);
    ChartToast.showInfo(null, { title: 'Uploading...', message: 'You can leave this page while we finish!' });

    // Determine the post type dynamically
    let primaryPostType = 'feed';
    if (isManifesto) primaryPostType = PostType.manifesto;
    if (isChannelPost) primaryPostType = PostType.channel;
    if (isChannelStatus) primaryPostType = PostType.channel_status;
    if (isChannelMoment) primaryPostType = PostType.channel_moment;
    if (isGlobalStatus) primaryPostType = PostType.status;

    console.log(`[FinalizePostPage] Step 1: Submitting main post as ${primaryPostType}...`);
    const success = await createPost({
      media: selectedMedia,
      caption,
      channelId: targetChannelId, // Relevant for manifesto, channel post, channel status
      channelName,
      channelAvatarUrl,
      postType: primaryPostType,
      shareToStatus: false, // We handle this explicitly below
      allowComments,
      isPublicFeed: isPublic,
      aspectRatio: selectedMedia.length > 0 ? selectedMedia[0].aspectRatio : undefined,
      isShortClip,
    });
    console.log('[FinalizePostPage] Main post success?', success);
    if (!success) {
      console.error('[FinalizePostPage] Post insertion failed! Reason:', usePostingStore.getState().errorMessage);
    }

    if (success) {
      // 2. Reuse the existing status insertion wrapper logic if switch is on
      if (shareToStatus && !isManifesto) {
        console.log('[FinalizePostPage] Step 2: Submitting post to status because shareToStatus is ON...');
        const statusSuccess = await createPost({
          media: selectedMedia,
          caption,
          postType: PostType.status,
          shareToStatus: true,
          allowComments,
          isPublicFeed: isPublic,
          isShortClip,
        });
        console.log('[FinalizePostPage] Status post success?', statusSuccess);
      } else {
        console.log('[FinalizePostPage] Step 2 Skipped: shareToStatus is', shareToStatus);
      }

      // 3. Defer channel posts logic as per the architecture plan
      if (selectedChannels.length > 0) {
        // TODO: In the future, we will call a hook from src/channel here 
        // e.g., await broadcastToChannels(postId, selectedChannels);
        console.log(`[FinalizePostPage] Step 3: Deferred broadcasting to channels:`, selectedChannels);
      } else {
        console.log(`[FinalizePostPage] Step 3 Skipped: No channels selected.`);
      }

      console.log('[FinalizePostPage] All tasks completed successfully, navigating.');
      setIsPosting(false);
      ChartToast.showSuccess(null, { title: 'Success', message: 'Post created successfully!' });

      if (draftId) {
        useDraftStore.getState().deleteDraft(draftId);
      }

      if (targetChannelId && (isChannelPost || isChannelStatus || isChannelMoment || isManifesto)) {
        router.dismissAll();
        setTimeout(() => {
          router.push({ pathname: '/channel/channelpage', params: { id: targetChannelId } } as any);
        }, 100);
      } else {
        router.dismissAll();
      }
    } else {
      setIsPosting(false);
      ChartToast.showError(null, { title: 'Error', message: 'Failed to create post' });
    }
  };

  const getHeaderTitle = () => {
    if (isManifesto) return 'New Manifesto';
    if (isChannelPost) return 'New Channel Post';
    if (isChannelStatus) return 'New Channel Status';
    return 'New Post';
  };

  return (
    <View style={styles.root}>
      <ChartAppBar
        title={getHeaderTitle()}
        onBack={() => router.back()}
        isLoading={isPosting}
        loadingProgress={0.5}
      />

      <View style={styles.body}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <FinalizeMediaPreview selectedMedia={selectedMedia} />

          <FinalizeCaptionSection
            caption={caption}
            onChangeText={setCaption}
          />

          <View style={styles.spacing} />

          {hasVideo && (
            <VideoFormatSelector
              isShortClip={isShortClip}
              onFormatChange={setIsShortClip}
            />
          )}

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

          <FinalizeListTile
            icon={<Save color="rgba(255,255,255,0.7)" size={22} />}
            title="Save as Draft"
            onTap={handleSaveDraft}
          />

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <FinalizeShareButton
          onTap={handlePost}
          isLoading={isPosting}
          statusText={isPosting ? 'UPLOADING... YOU CAN LEAVE' : 'SHARE'}
        />
      </View>

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
  body: {
    flex: 1,
    flexDirection: 'column',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  spacing: {
    height: 16,
  },
  spacingSmall: {
    height: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});
