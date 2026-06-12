import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MembersStoryBar } from '../discovery_widgets/MembersStoryBar';
import { MemberListItem } from './widgets/MemberListItem';
import { ChannelInvitationCard } from './widgets/ChannelInvitationCard';
import { MemberPageShimmer } from './widgets/MemberPageShimmer';
import { useRouter } from 'expo-router';

interface Member {
  id: string;
  displayName: string;
  profileImageUrl: string;
  role: string;
  channelCount: number;
  isMe?: boolean;
}

interface MembersTabViewProps {
  channelId: string;
  channelName?: string;
  channelImageUrl?: string;
  canPostStatus?: boolean;
  totalMemberCount?: number;
  isLoading?: boolean;
  members?: Member[];
  onAddStory?: () => void;
}

export const MembersTabView: React.FC<MembersTabViewProps> = ({
  channelId,
  channelName,
  channelImageUrl,
  canPostStatus = true,
  totalMemberCount = 0,
  isLoading = false,
  members = [],
  onAddStory,
}) => {
  if (isLoading) {
    return <MemberPageShimmer />;
  }

  // Mock statuses for demonstration
  const statuses = [
    {
      id: 's1',
      authorId: '1',
      authorUsername: 'Josh',
      authorAvatarUrl: 'https://i.pravatar.cc/150?img=12',
      primaryImageUrl: 'https://picsum.photos/400/600?random=101',
      imageUrls: ['https://picsum.photos/400/600?random=101'],
    }
  ];

  const sortedMembers = [...members].sort((a, b) => {
    if (a.isMe) return -1;
    if (b.isMe) return 1;
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (b.role === 'admin' && a.role !== 'admin') return 1;
    return 0;
  });

  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MembersStoryBar 
        statuses={statuses} 
        onAddStory={onAddStory || (() => {})} 
        canPostStatus={canPostStatus} 
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Members ({totalMemberCount > 0 ? totalMemberCount : sortedMembers.length})
        </Text>
        <TouchableOpacity onPress={() => router.push('/explore' as any)}>
          <Text style={styles.exploreText}>Explore</Text>
        </TouchableOpacity>
      </View>

      {sortedMembers.map(member => (
        <React.Fragment key={member.id}>
          <MemberListItem 
            id={member.id}
            name={member.displayName}
            profileImageUrl={member.profileImageUrl}
            subtitle={member.isMe ? 'You (Admin)' : `${(member.channelCount * 1.2).toFixed(1)}K followers`}
            showFollow={!member.isMe}
            onAvatarTap={() => router.push('/profile' as any)}
          />
        </React.Fragment>
      ))}

      <ChannelInvitationCard 
        channelName={channelName} 
        onTap={() => router.push(`/channel/settings/select-channel/${channelId}` as any)} 
      />

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exploreText: {
    color: '#FFB800', // colors.primary
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerSpacer: {
    height: 80,
  },
});
