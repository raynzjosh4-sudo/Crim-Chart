import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MemberListItem } from './widgets/MemberListItem';
import { MemberPageShimmer } from './widgets/MemberPageShimmer';
import { useRouter } from 'expo-router';
import { useChannelRequests } from '@/channel/hooks/useChannelRequests';
import { ChannelRequestItem } from '@/channel/components/requests/ChannelRequestItem';
import { useChannelMembers } from '@/channel/hooks/useChannelMembers';
import { useChannelPermissions } from '@/channel/hooks/useChannelPermissions';
import { useChannelData } from '@/channel/hooks/useChannelData';
import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
interface Member {
  id: string;
  displayName: string;
  profileImageUrl: string;
  role: string;
  canChat?: boolean;
  channelCount?: number;
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
  onAddStory
}) => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 8
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold'
    },
    exploreText: {
      color: '#FFB800',
      // colors.primary
      fontSize: 14,
      fontWeight: 'bold'
    },
    footerSpacer: {
      height: 80
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginHorizontal: 16,
      marginVertical: 16
    }
  }));
  const {
    members: fetchedMembers,
    isLoading: isMembersLoading
  } = useChannelMembers(channelId);
  const {
    role: currentUserRole
  } = useChannelPermissions(channelId);
  const {
    channel
  } = useChannelData(channelId);
  const {
    user
  } = useAuthStore();
  const isAdmin = currentUserRole === 'admin' || currentUserRole === 'owner';
  const showChatToggle = isAdmin && channel?.allowChattingBy === 'selected members';

  // State to hold local toggle changes optimistically
  const [localChatPermissions, setLocalChatPermissions] = React.useState({} as Record<string, boolean>);
  const handleToggleChat = async (userId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setLocalChatPermissions(prev => ({
      ...prev,
      [userId]: newVal
    }));
    try {
      await channelRepository.updateMemberChatPermission(channelId, userId, newVal);
    } catch (e) {
      console.error('Failed to update chat permission', e);
      setLocalChatPermissions(prev => ({
        ...prev,
        [userId]: currentVal
      })); // Revert
    }
  };
  const router = useRouter();
  const {
    requests,
    updateRequestStatus
  } = useChannelRequests(channelId);
  if (isLoading || isMembersLoading) {
    return <MemberPageShimmer />;
  }

  // Combine passed members and fetched members
  const realMembers = fetchedMembers.length > 0 ? fetchedMembers.map(m => ({
    id: m.userId,
    displayName: m.displayName || 'Unknown User',
    profileImageUrl: m.profileImageUrl || '',
    role: m.role,
    canChat: m.canChat,
    channelCount: 0,
    isMe: m.userId === user?.id
  })) : members;

  // Mock statuses for demonstration
  const statuses = [{
    id: 's1',
    authorId: '1',
    authorUsername: 'Josh',
    authorAvatarUrl: 'https://i.pravatar.cc/150?img=12',
    primaryImageUrl: 'https://picsum.photos/400/600?random=101',
    imageUrls: ['https://picsum.photos/400/600?random=101']
  }];
  const sortedMembers = [...realMembers].sort((a, b) => {
    if (a.isMe) return -1;
    if (b.isMe) return 1;
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (b.role === 'admin' && a.role !== 'admin') return 1;
    return 0;
  });
  return <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {requests.length > 0 && <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Requests ({requests.length})</Text>
          </View>
          {requests.map(req => <React.Fragment key={req.id}>
              <ChannelRequestItem requestId={req.id} targetUser={req.target_user} requestedBy={req.requested_by} requestType={req.request_type} onApprove={id => updateRequestStatus(id, 'approved')} onReject={id => updateRequestStatus(id, 'rejected')} />
            </React.Fragment>)}
          <View style={styles.divider} />
        </>}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Members ({totalMemberCount > 0 ? totalMemberCount : sortedMembers.length})
        </Text>
        <TouchableOpacity activeOpacity={1} onPress={() => router.push('/explore' as any)}>
          <Text style={styles.exploreText}>Explore</Text>
        </TouchableOpacity>
      </View>

      {sortedMembers.map(member => {
      const canChat = localChatPermissions[member.id] ?? member.canChat ?? true;
      return <React.Fragment key={member.id}>
            <MemberListItem id={member.id} name={member.displayName} profileImageUrl={member.profileImageUrl} subtitle={member.isMe ? 'You (Admin)' : `${member.role}`} showFollow={!member.isMe} showChatToggle={showChatToggle && !member.isMe && member.role !== 'owner'} canChat={canChat} onToggleChat={() => handleToggleChat(member.id, canChat)} onAvatarTap={() => router.push('/profile' as any)} />
          </React.Fragment>;
    })}


      <View style={styles.footerSpacer} />
    </ScrollView>;
};