import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { CircleDot, Hash, Settings } from 'lucide-react-native';

import { FinalizeCaptionSection } from './widgets/FinalizeCaptionSection';
import { FinalizeMediaPreview } from './widgets/FinalizeMediaPreview';
import { FinalizeShareButton } from './widgets/FinalizeShareButton';
import { FinalizeListTile, FinalizeSwitchTile } from './widgets/FinalizeTiles';
import { ChannelTags, ChannelData } from './widgets/ChannelTags';
import { AdvancedSettingsSheet } from './widgets/AdvancedSettingsSheet';
import { usePostingStore, PostType } from '@/core/store/usePostingStore';

// Dummy channels to match UI layout
const DUMMY_CHANNELS: ChannelData[] = [
  { id: '1', name: 'General', avatarUrl: '' },
  { id: '2', name: 'Crime Updates', avatarUrl: 'https://picsum.photos/id/101/200/200' },
  { id: '3', name: 'Community', avatarUrl: '' },
];

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
  const [isChannelExpanded, setIsChannelExpanded] = useState(false);
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
    setIsPosting(true);
    
    const success = await createPost({
      media: selectedMedia,
      caption,
      channelId: targetChannelId,
      postType: isDirectChannelPost ? PostType.manifesto : PostType.channel,
      shareToStatus,
      allowComments,
      isPublicFeed: isPublic,
    });

    setIsPosting(false);
    
    if (success) {
      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => {
            router.push('/(tabs)');
        }}
      ]);
    } else {
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
                onTap={() => setIsChannelExpanded(!isChannelExpanded)}
              />

              {isChannelExpanded && (
                <ChannelTags 
                  channels={DUMMY_CHANNELS} 
                  selectedChannels={selectedChannels} 
                  onChannelSelected={handleChannelSelect} 
                />
              )}
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
