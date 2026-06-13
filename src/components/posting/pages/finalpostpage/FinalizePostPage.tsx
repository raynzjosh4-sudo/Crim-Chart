import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { CircleDot, Hash, Settings } from 'lucide-react-native';

import { FinalizeCaptionSection } from './widgets/FinalizeCaptionSection';
import { FinalizeMediaPreview } from './widgets/FinalizeMediaPreview';
import { FinalizeShareButton } from './widgets/FinalizeShareButton';
import { FinalizeListTile, FinalizeSwitchTile } from './widgets/FinalizeTiles';
import { ChannelData } from './widgets/ChannelTags'; // keep data structure
import { SelectChannelBottomSheet } from './widgets/SelectChannelBottomSheet';
import { AdvancedSettingsSheet } from './widgets/AdvancedSettingsSheet';
import { usePostingStore, PostType } from '@/core/store/usePostingStore';

// Removed dummy channels as they are now fetched internally
// We mock the posting controller state for the UI translation
export const FinalizePostPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const selectedMediaJson = params.selectedMediaJson as string | undefined;
  const selectedMedia = selectedMediaJson ? JSON.parse(selectedMediaJson) : []; 
  const targetChannelId = params.targetChannelId as string | undefined;
  const isManifestoContext = params.isManifestoContext === 'true';

  const { createPost } = usePostingStore();

  const [caption, setCaption] = useState('');
  const [shareToStatus, setShareToStatus] = useState(false);
  const [isChannelSheetVisible, setIsChannelSheetVisible] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  
  const [isAdvancedSettingsVisible, setIsAdvancedSettingsVisible] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  
  const [isPosting, setIsPosting] = useState(false);

  const isDirectChannelPost = !!targetChannelId;

  const handleChannelSelect = (id: string) => {
    const newChannels = selectedChannels.includes(id) 
      ? selectedChannels.filter(c => c !== id) 
      : [...selectedChannels, id];
    setSelectedChannels(newChannels);
  };

  const handlePost = async () => {
    console.log('[FinalizePostPage] Starting handlePost...');
    console.log('[FinalizePostPage] Inputs:', { caption, targetChannelId, isDirectChannelPost, shareToStatus, allowComments, isPublic, selectedChannelsLength: selectedChannels.length });
    
    setIsPosting(true);
    
    // 1. Submit the main post to the `posts` table (or manifesto)
    // We intentionally do not use PostType.channel here for the feed post,
    // so it falls back to the default `posts` table insert.
    console.log('[FinalizePostPage] Step 1: Submitting main post...');
    const success = await createPost({
      media: selectedMedia,
      caption,
      channelId: targetChannelId, // Only relevant if isDirectChannelPost
      postType: isDirectChannelPost ? PostType.manifesto : 'feed',
      shareToStatus: false, // We handle this explicitly below
      allowComments,
      isPublicFeed: isPublic,
      aspectRatio: selectedMedia.length > 0 ? selectedMedia[0].aspectRatio : undefined,
    });
    console.log('[FinalizePostPage] Main post success?', success);
    if (!success) {
      console.error('[FinalizePostPage] Post insertion failed! Reason:', usePostingStore.getState().errorMessage);
    }

    if (success) {
      // 2. Reuse the existing status insertion wrapper logic if switch is on
      if (shareToStatus && !isDirectChannelPost) {
        console.log('[FinalizePostPage] Step 2: Submitting post to status because shareToStatus is ON...');
        const statusSuccess = await createPost({
          media: selectedMedia,
          caption,
          postType: PostType.status,
          shareToStatus: true,
          allowComments,
          isPublicFeed: isPublic,
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

      console.log('[FinalizePostPage] All tasks completed successfully, navigating home.');
      setIsPosting(false);
      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => {
            router.push('/(tabs)');
        }}
      ]);
    } else {
      setIsPosting(false);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  return (
    <View style={styles.root}>
      <ChartAppBar 
        title={isDirectChannelPost ? 'New Manifesto' : 'New Post'} 
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

          {!isDirectChannelPost && (
            <>
              <FinalizeSwitchTile
                icon={<CircleDot color="rgba(255,255,255,0.7)" size={22} />}
                title="Share to Status"
                value={shareToStatus}
                onChanged={setShareToStatus}
              />

              <FinalizeListTile
                icon={<Hash color="rgba(255,255,255,0.7)" size={22} />}
                title={selectedChannels.length === 0 ? 'Tag in Channel' : `Tag in Channel (${selectedChannels.length} selected)`}
                onTap={() => setIsChannelSheetVisible(true)}
              />
            </>
          )}

          <View style={styles.spacingSmall} />

          <FinalizeListTile
            icon={<Settings color="rgba(255,255,255,0.7)" size={22} />}
            title="Advanced Settings"
            onTap={() => setIsAdvancedSettingsVisible(true)}
          />

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <FinalizeShareButton 
          onTap={handlePost} 
          isLoading={isPosting} 
          statusText={isPosting ? 'UPLOADING...' : 'SHARE'}
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
  }
});
